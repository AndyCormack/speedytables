import { SliceEmitter } from './emitter';
import { MainThreadExecutor, type Executor, type Job } from './executor';
import { RowPipeline } from './pipeline';
import { buildComparator, sortIndexJob, type SortKey } from './sort';
import { computeWindow } from './viewport';
import { WorkerBridge, workerSupported } from './worker-bridge';
import type {
	ColumnDef,
	Delta,
	FilterSpec,
	GridConfig,
	PositionSlice,
	Slice,
	SortSpec,
	WindowSlice
} from './types';

const scheduleFlush: (callback: () => void) => void =
	typeof requestAnimationFrame === 'function'
		? (cb) => requestAnimationFrame(() => cb())
		: (cb) => setTimeout(cb, 0);

export class Grid<Row> {
	readonly columns: ColumnDef[];
	readonly rowHeight: number;
	readonly getRowId: (row: Row) => string;

	#pipeline = new RowPipeline<Row>();
	#emitter = new SliceEmitter();
	#executor: Executor;
	#bridge: WorkerBridge | null = null;
	#overscan: number;
	#scrollTop = 0;
	#viewportHeight = 0;

	#sortModel: SortSpec[] = [];
	#filterModel: FilterSpec[] = [];
	#rebuildAbort: AbortController | null = null;
	#rebuildPromise: Promise<void> | null = null;
	/** Sort keys matching the currently-applied sorted index (for incremental patches). */
	#sortKeys: SortKey[] | null = null;
	#pendingDeltas: Delta<Row>[] = [];
	#flushPromise: Promise<void> | null = null;

	#window: WindowSlice<Row> = { firstRow: 0, count: 0, rows: [] };
	#position: PositionSlice = { blockTop: 0, virtualHeight: 0 };

	constructor(config: GridConfig<Row>) {
		this.columns = config.columns;
		this.rowHeight = config.rowHeight ?? 32;
		this.getRowId = config.getRowId;
		this.#overscan = config.overscan ?? 3;
		this.#executor = config.executor ?? new MainThreadExecutor();
		if (config.compute === 'worker' && workerSupported()) this.#bridge = new WorkerBridge();
		if (config.data) this.#pipeline.setSource(config.data);
		this.#recompute();
	}

	/** Releases the worker (if any) and cancels in-flight work. */
	destroy(): void {
		this.#rebuildAbort?.abort();
		this.#bridge?.dispose();
		this.#bridge = null;
	}

	get window(): WindowSlice<Row> {
		return this.#window;
	}

	get position(): PositionSlice {
		return this.#position;
	}

	get rowCount(): number {
		return this.#pipeline.length;
	}

	get sortModel(): SortSpec[] {
		return this.#sortModel;
	}

	get filterModel(): FilterSpec[] {
		return this.#filterModel;
	}

	setData(rows: Row[]): void {
		this.#pipeline.setSource(rows);
		this.#recompute(true);
		// all stage caches were invalidated with the source; reapply active models
		if (this.#sortModel.length > 0 || this.#filterModel.length > 0) void this.#rebuild(true);
	}

	/**
	 * Declarative sort (ADR-0002). Resolves once the sorted window is applied.
	 * While the pipeline rebuilds, the grid keeps serving the previous output —
	 * it never blocks.
	 */
	setSortModel(model: SortSpec[]): Promise<void> {
		this.#sortModel = model;
		this.#emitter.notify('sortModel');
		return this.#rebuild(false);
	}

	/** Declarative filter (ADR-0002). Resolves once the filtered window is applied. */
	setFilterModel(model: FilterSpec[]): Promise<void> {
		this.#filterModel = model;
		this.#emitter.notify('filterModel');
		return this.#rebuild(true);
	}

	/**
	 * Applies a delta batch (ADR-0004). All deltas received within one animation
	 * frame coalesce into a single pipeline patch; updates take the incremental
	 * path, inserts/removes trigger a full recompute. Resolves once this batch
	 * is applied to the window.
	 */
	applyDelta(delta: Delta<Row>): Promise<void> {
		this.#pendingDeltas.push(delta);
		this.#flushPromise ??= new Promise((resolve, reject) => {
			scheduleFlush(() => this.#flush().then(resolve, reject));
		});
		return this.#flushPromise;
	}

	async #flush(): Promise<void> {
		const batch = this.#pendingDeltas;
		this.#pendingDeltas = [];
		this.#flushPromise = null;

		// never mutate the source while a rebuild job is reading it
		await this.#rebuildPromise;

		const inserts = batch.flatMap((d) => d.insert ?? []);
		const removes = batch.flatMap((d) => d.remove ?? []);
		const updates = batch.flatMap((d) => d.update ?? []);

		if (inserts.length > 0 || removes.length > 0) {
			if (removes.length > 0) this.#pipeline.removeByIds(removes, this.getRowId);
			if (inserts.length > 0) this.#pipeline.appendRows(inserts, this.getRowId);
			for (const row of updates) {
				// structural change forces a rebuild anyway; fold updates into the source
				const map = await this.#executor.run(this.#pipeline.idIndexJob(this.getRowId));
				const index = map.get(this.getRowId(row));
				if (index !== undefined) this.#pipeline.patch([{ index, row }], this.columns, null);
			}
			await this.#rebuild(true);
			return;
		}
		if (updates.length === 0) return;

		const idIndex = await this.#executor.run(this.#pipeline.idIndexJob(this.getRowId));
		// last write wins when one row is updated twice in a frame
		const byIndex = new Map<number, Row>();
		for (const row of updates) {
			const index = idIndex.get(this.getRowId(row));
			if (index !== undefined) byIndex.set(index, row);
		}
		if (byIndex.size === 0) return;

		// worker mode: stage outputs were adopted without main-side patch state —
		// hydrate the predicate and sort keys once, then patch as usual
		if (this.#filterModel.length > 0 && !this.#pipeline.hasPredicate) {
			await this.#executor.run(this.#pipeline.ensurePredicateJob(this.#filterModel, this.columns));
		}
		if (this.#sortModel.length > 0 && !this.#sortKeys) {
			const keys: SortKey[] = [];
			for (const spec of this.#sortModel) {
				const column = this.columns.find((c) => c.id === spec.columnId);
				if (!column) continue;
				keys.push({
					projection: await this.#executor.run(this.#pipeline.projectionJob(column)),
					dir: spec.dir
				});
			}
			this.#sortKeys = keys;
		}

		const comparator = this.#sortKeys ? buildComparator(this.#sortKeys) : null;
		this.#pipeline.patch(
			[...byIndex.entries()].map(([index, row]) => ({ index, row })),
			this.columns,
			comparator
		);
		this.#recompute(true);
	}

	/**
	 * Recomputes invalidated pipeline stages in order (filter → sort). A newer
	 * call aborts an in-flight rebuild at its next slice point; a sort-only
	 * change reuses the cached filter output.
	 */
	#rebuild(filterDirty: boolean): Promise<void> {
		if (this.#bridge) return this.#rebuildWorker();

		this.#rebuildAbort?.abort();
		const abort = (this.#rebuildAbort = new AbortController());

		const pipeline = this.#pipeline;
		const columns = this.columns;
		const filterModel = this.#filterModel;
		const sortModel = this.#sortModel;

		const job = function* (): Job<{ sorted: Uint32Array; keys: SortKey[] } | null> {
			if (filterDirty) yield* pipeline.filterJob(filterModel, columns);
			if (sortModel.length === 0) return null;
			const keys: SortKey[] = [];
			for (const spec of sortModel) {
				const column = columns.find((c) => c.id === spec.columnId);
				if (!column) throw new Error(`Unknown sort column: ${spec.columnId}`);
				keys.push({ projection: yield* pipeline.projectionJob(column), dir: spec.dir });
			}
			return { sorted: yield* sortIndexJob(keys, yield* pipeline.candidatesJob()), keys };
		};

		const run = (async () => {
			try {
				const result = await this.#executor.run(job(), abort.signal);
				if (abort.signal.aborted) return;
				this.#pipeline.setSortedIndex(result?.sorted ?? null);
				this.#sortKeys = result?.keys ?? null;
				this.#recompute(true);
			} catch (error) {
				if (error instanceof DOMException && error.name === 'AbortError') return;
				throw error;
			} finally {
				// only the newest rebuild owns the pointer
				if (this.#rebuildAbort === abort) this.#rebuildPromise = null;
			}
		})();
		this.#rebuildPromise = run;
		return run;
	}

	/**
	 * Worker-mode rebuild: sync referenced projections to the worker mirror
	 * (skipped when its copies are current), post the declarative models, adopt
	 * the returned index arrays. The main thread only pays projection
	 * extraction (sliced) and transfer; the O(N log N) work happens off-thread.
	 */
	#rebuildWorker(): Promise<void> {
		this.#rebuildAbort?.abort();
		const abort = (this.#rebuildAbort = new AbortController());
		const pipeline = this.#pipeline;

		const run = (async () => {
			try {
				const referenced = new Set([
					...this.#filterModel.map((f) => f.columnId),
					...this.#sortModel.map((s) => s.columnId)
				]);
				for (const columnId of referenced) {
					const column = this.columns.find((c) => c.id === columnId);
					if (!column) throw new Error(`Unknown column: ${columnId}`);
					const projection = await this.#executor.run(pipeline.projectionJob(column), abort.signal);
					await this.#bridge!.sendProjection(columnId, projection, pipeline.dataVersion);
				}
				const result = await this.#bridge!.rebuild(
					pipeline.length,
					pipeline.dataVersion,
					this.#filterModel,
					this.#sortModel
				);
				if (abort.signal.aborted) return;
				pipeline.adoptStages(result.filtered, result.sorted, this.#filterModel);
				this.#sortKeys = null; // patch state rehydrates on demand (flush path)
				this.#recompute(true);
			} catch (error) {
				if (abort.signal.aborted) return;
				if (error instanceof DOMException && error.name === 'AbortError') return;
				throw error;
			} finally {
				if (this.#rebuildAbort === abort) this.#rebuildPromise = null;
			}
		})();
		this.#rebuildPromise = run;
		return run;
	}

	setScrollTop(px: number): void {
		this.#scrollTop = px;
		this.#recompute();
	}

	setViewportHeight(px: number): void {
		this.#viewportHeight = px;
		this.#recompute();
	}

	subscribe(slice: Slice, listener: () => void): () => void {
		return this.#emitter.subscribe(slice, listener);
	}

	#recompute(pipelineChanged = false): void {
		const next = computeWindow({
			scrollTop: this.#scrollTop,
			viewportHeight: this.#viewportHeight,
			rowHeight: this.rowHeight,
			rowCount: this.#pipeline.length,
			overscan: this.#overscan
		});

		if (next.blockTop !== this.#position.blockTop || next.virtualHeight !== this.#position.virtualHeight) {
			this.#position = { blockTop: next.blockTop, virtualHeight: next.virtualHeight };
			this.#emitter.notify('position');
		}

		// The window slice only changes when different rows come into view —
		// per-pixel scrolling inside the same window notifies 'position' alone.
		// A pipeline change (new data/order) refreshes rows even at the same offsets.
		if (pipelineChanged || next.firstRow !== this.#window.firstRow || next.count !== this.#window.count) {
			this.#window = {
				firstRow: next.firstRow,
				count: next.count,
				rows: this.#pipeline.window(next.firstRow, next.count)
			};
			this.#emitter.notify('window');
		}
	}
}

export function createGrid<Row>(config: GridConfig<Row>): Grid<Row> {
	return new Grid(config);
}
