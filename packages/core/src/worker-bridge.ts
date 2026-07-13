/**
 * Main-thread client for the worker pipeline mirror (ADR-0002).
 *
 * Projections sync one-way: Float64Arrays as transferred buffer copies (one
 * ~2-5ms memcpy per column per data version), text as chunked structured
 * clones (~65k strings per message) so no single postMessage becomes a long
 * task. postMessage ordering is FIFO, so projection sends need no acks —
 * a rebuild posted afterwards sees them.
 */
import type { Projection } from './projection';
import type { FilterSpec, SortSpec } from './types';

const TEXT_CHUNK = 65_536;

export interface RebuildResult {
	filtered: Uint32Array | null;
	sorted: Uint32Array | null;
}

export class WorkerBridge {
	#worker: Worker;
	#nextId = 1;
	#pending = new Map<number, { resolve: (r: RebuildResult) => void; reject: (e: Error) => void }>();
	/** columnId → last data version sent. */
	#sent = new Map<string, number>();

	constructor() {
		this.#worker = new Worker(new URL('./pipeline.worker.ts', import.meta.url), { type: 'module' });
		this.#worker.onmessage = (event) => {
			const msg = event.data as
				| { t: 'rebuild-done'; id: number; filtered: ArrayBuffer | null; sorted: ArrayBuffer | null }
				| { t: 'err'; id: number; message: string };
			const pending = this.#pending.get(msg.id);
			if (!pending) return;
			this.#pending.delete(msg.id);
			if (msg.t === 'err') pending.reject(new Error(msg.message));
			else
				pending.resolve({
					filtered: msg.filtered ? new Uint32Array(msg.filtered) : null,
					sorted: msg.sorted ? new Uint32Array(msg.sorted) : null
				});
		};
	}

	/** Sends a column's projection unless the worker already holds this version. */
	async sendProjection(columnId: string, projection: Projection, version: number): Promise<void> {
		if (this.#sent.get(columnId) === version) return;
		this.#sent.set(columnId, version);
		if (projection instanceof Float64Array) {
			const copy = projection.slice(); // transfer must not detach the pipeline's buffer
			this.#worker.postMessage(
				{ t: 'proj-num', columnId, version, buffer: copy.buffer },
				{ transfer: [copy.buffer] }
			);
			return;
		}
		for (let start = 0; start < projection.length; start += TEXT_CHUNK) {
			this.#worker.postMessage({
				t: 'proj-str-chunk',
				columnId,
				version,
				start,
				total: projection.length,
				values: projection.slice(start, start + TEXT_CHUNK)
			});
			// each chunk's structured-clone serialization runs on this thread —
			// yield between chunks or the loop itself becomes one long task
			await new Promise((resolve) => setTimeout(resolve, 0));
		}
	}

	rebuild(
		length: number,
		version: number,
		filterModel: FilterSpec[],
		sortModel: SortSpec[]
	): Promise<RebuildResult> {
		const id = this.#nextId++;
		return new Promise<RebuildResult>((resolve, reject) => {
			this.#pending.set(id, { resolve, reject });
			this.#worker.postMessage({ t: 'rebuild', id, length, version, filterModel, sortModel });
		});
	}

	dispose(): void {
		this.#worker.terminate();
		for (const { reject } of this.#pending.values()) reject(new Error('WorkerBridge disposed'));
		this.#pending.clear();
	}
}

export const workerSupported = (): boolean => typeof Worker !== 'undefined';
