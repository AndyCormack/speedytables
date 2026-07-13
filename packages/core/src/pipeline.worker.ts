/**
 * Worker mirror of the row pipeline (ADR-0002 worker executor).
 *
 * Holds per-column projection copies (synced by WorkerBridge, invalidated by
 * data version) and runs declarative filter + sort rebuilds off the main
 * thread by draining the SAME pure stage generators synchronously — no time
 * slicing needed here, the whole point is that this thread may block.
 * Results return as transferable Uint32Arrays (zero-copy).
 */
import { filterIndicesJob, narrows } from './filter';
import { sortIndexJob, type SortKey } from './sort';
import type { Projection } from './projection';
import type { FilterSpec, SortSpec } from './types';
import type { Job } from './executor';

interface ProjectionEntry {
	version: number;
	projection: Projection;
	lower?: string[];
	pendingChunks?: string[][];
}

const projections = new Map<string, ProjectionEntry>();
let identity: { length: number; version: number; index: Uint32Array } | null = null;
let filterCache: { model: FilterSpec[]; version: number; result: Uint32Array } | null = null;

/** Runs a job to completion on this (blockable) thread. */
function drain<T>(job: Job<T>): T {
	for (;;) {
		const step = job.next();
		if (step.done) return step.value;
	}
}

function lowerOf(entry: ProjectionEntry): string[] {
	if (!entry.lower) entry.lower = (entry.projection as string[]).map((s) => s.toLowerCase());
	return entry.lower;
}

function entryOf(columnId: string, version: number): ProjectionEntry {
	const entry = projections.get(columnId);
	if (!entry || entry.version !== version) {
		throw new Error(`worker: projection for '${columnId}' missing or stale (have ${entry?.version}, need ${version})`);
	}
	return entry;
}

function buildPredicate(model: FilterSpec[], version: number): (i: number) => boolean {
	const tests = model.map((spec) => {
		const entry = entryOf(spec.columnId, version);
		if (spec.type === 'contains') {
			const lower = lowerOf(entry);
			const needle = spec.value.toLowerCase();
			return (i: number) => lower[i]!.includes(needle);
		}
		if (spec.type === 'range') {
			const projection = entry.projection as Float64Array;
			const min = spec.min ?? -Infinity;
			const max = spec.max ?? Infinity;
			return (i: number) => {
				const value = projection[i]!;
				return value >= min && value <= max;
			};
		}
		const projection = entry.projection as string[];
		const allowed = new Set(spec.values);
		return (i: number) => allowed.has(projection[i]!);
	});
	return (i) => {
		for (const test of tests) if (!test(i)) return false;
		return true;
	};
}

function identityOf(length: number, version: number): Uint32Array {
	if (!identity || identity.length !== length || identity.version !== version) {
		const index = new Uint32Array(length);
		for (let i = 0; i < length; i++) index[i] = i;
		identity = { length, version, index };
	}
	return identity.index;
}

interface RebuildMessage {
	t: 'rebuild';
	id: number;
	length: number;
	version: number;
	filterModel: FilterSpec[];
	sortModel: SortSpec[];
}

type InMessage =
	| { t: 'proj-num'; columnId: string; version: number; buffer: ArrayBuffer }
	| { t: 'proj-str-chunk'; columnId: string; version: number; start: number; total: number; values: string[] }
	| RebuildMessage;

function rebuild(msg: RebuildMessage): void {
	let filtered: Uint32Array | null = null;
	if (msg.filterModel.length > 0) {
		const predicate = buildPredicate(msg.filterModel, msg.version);
		const refinable =
			filterCache && filterCache.version === msg.version && narrows(filterCache.model, msg.filterModel);
		const candidates = refinable ? filterCache!.result : identityOf(msg.length, msg.version);
		filtered = drain(filterIndicesJob(candidates, predicate));
		filterCache = { model: msg.filterModel, version: msg.version, result: filtered };
	} else {
		filterCache = null;
	}

	let sorted: Uint32Array | null = null;
	if (msg.sortModel.length > 0) {
		const keys: SortKey[] = msg.sortModel.map((spec) => ({
			projection: entryOf(spec.columnId, msg.version).projection,
			dir: spec.dir
		}));
		sorted = drain(sortIndexJob(keys, filtered ?? identityOf(msg.length, msg.version)));
	}

	// filtered result is retained by filterCache for refinement — transfer a copy;
	// sorted is not retained, transfer it outright
	const filteredOut = filtered ? filtered.slice() : null;
	const transfer: ArrayBuffer[] = [];
	if (filteredOut) transfer.push(filteredOut.buffer);
	if (sorted) transfer.push(sorted.buffer);
	postMessage(
		{ t: 'rebuild-done', id: msg.id, filtered: filteredOut?.buffer ?? null, sorted: sorted?.buffer ?? null },
		{ transfer }
	);
}

onmessage = (event: MessageEvent<InMessage>) => {
	const msg = event.data;
	try {
		if (msg.t === 'proj-num') {
			projections.set(msg.columnId, { version: msg.version, projection: new Float64Array(msg.buffer) });
		} else if (msg.t === 'proj-str-chunk') {
			let entry = projections.get(msg.columnId);
			if (!entry || entry.version !== msg.version || !entry.pendingChunks) {
				entry = { version: msg.version, projection: [], pendingChunks: [] };
				projections.set(msg.columnId, entry);
			}
			entry.pendingChunks!.push(msg.values);
			if (msg.start + msg.values.length >= msg.total) {
				entry.projection = entry.pendingChunks!.flat();
				delete entry.pendingChunks;
				delete entry.lower;
			}
		} else if (msg.t === 'rebuild') {
			rebuild(msg);
		}
	} catch (error) {
		if (msg.t === 'rebuild') {
			postMessage({ t: 'err', id: msg.id, message: error instanceof Error ? error.message : String(error) });
		}
	}
};
