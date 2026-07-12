import { SliceEmitter } from './emitter';
import { MainThreadExecutor, type Executor, type Job } from './executor';
import { RowPipeline } from './pipeline';
import { sortIndexJob, type SortKey } from './sort';
import { computeWindow } from './viewport';
import type {
	ColumnDef,
	FilterSpec,
	GridConfig,
	PositionSlice,
	Slice,
	SortSpec,
	WindowSlice
} from './types';

export class Grid<Row> {
	readonly columns: ColumnDef[];
	readonly rowHeight: number;
	readonly getRowId: (row: Row) => string;

	#pipeline = new RowPipeline<Row>();
	#emitter = new SliceEmitter();
	#executor: Executor;
	#overscan: number;
	#scrollTop = 0;
	#viewportHeight = 0;

	#sortModel: SortSpec[] = [];
	#filterModel: FilterSpec[] = [];
	#rebuildAbort: AbortController | null = null;

	#window: WindowSlice<Row> = { firstRow: 0, count: 0, rows: [] };
	#position: PositionSlice = { blockTop: 0, virtualHeight: 0 };

	constructor(config: GridConfig<Row>) {
		this.columns = config.columns;
		this.rowHeight = config.rowHeight ?? 32;
		this.getRowId = config.getRowId;
		this.#overscan = config.overscan ?? 3;
		this.#executor = config.executor ?? new MainThreadExecutor();
		if (config.data) this.#pipeline.setSource(config.data);
		this.#recompute();
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
	 * Recomputes invalidated pipeline stages in order (filter → sort). A newer
	 * call aborts an in-flight rebuild at its next slice point; a sort-only
	 * change reuses the cached filter output.
	 */
	async #rebuild(filterDirty: boolean): Promise<void> {
		this.#rebuildAbort?.abort();
		const abort = (this.#rebuildAbort = new AbortController());

		const pipeline = this.#pipeline;
		const columns = this.columns;
		const filterModel = this.#filterModel;
		const sortModel = this.#sortModel;

		const job = function* (): Job<Uint32Array | null> {
			if (filterDirty) yield* pipeline.filterJob(filterModel, columns);
			if (sortModel.length === 0) return null;
			const keys: SortKey[] = [];
			for (const spec of sortModel) {
				const column = columns.find((c) => c.id === spec.columnId);
				if (!column) throw new Error(`Unknown sort column: ${spec.columnId}`);
				keys.push({ projection: yield* pipeline.projectionJob(column), dir: spec.dir });
			}
			return yield* sortIndexJob(keys, yield* pipeline.candidatesJob());
		};

		try {
			const sorted = await this.#executor.run(job(), abort.signal);
			if (abort.signal.aborted) return;
			this.#pipeline.setSortedIndex(sorted);
			this.#recompute(true);
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			throw error;
		}
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
