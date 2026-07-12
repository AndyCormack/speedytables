import type { Job } from './executor';
import type { FilterSpec } from './types';

const YIELD_MASK = 0x1fff; // yield every 8k rows — predicates do string work

/**
 * Filter stage: collect the source indices (from `candidates`, in source order)
 * that pass `predicate`. Returns an exact-size Uint32Array.
 */
export function* filterIndicesJob(
	candidates: Uint32Array,
	predicate: (sourceIndex: number) => boolean
): Job<Uint32Array> {
	const buffer = new Uint32Array(candidates.length);
	let matched = 0;
	for (let i = 0; i < candidates.length; i++) {
		const index = candidates[i]!;
		if (predicate(index)) buffer[matched++] = index;
		if ((i & YIELD_MASK) === 0) yield;
	}
	return buffer.slice(0, matched);
}

/**
 * True when `next` provably narrows `prev` (result ⊆ previous result), so the
 * filter can re-scan only the previous matches. Covers the typeahead case:
 * identical specs except contains needles that extend the old ones.
 */
export function narrows(prev: FilterSpec[], next: FilterSpec[]): boolean {
	if (prev.length !== next.length) return false;
	for (let i = 0; i < next.length; i++) {
		const a = prev[i]!;
		const b = next[i]!;
		if (a.columnId !== b.columnId || a.type !== b.type) return false;
		if (a.type === 'contains' && b.type === 'contains') {
			if (!b.value.toLowerCase().startsWith(a.value.toLowerCase())) return false;
		} else if (a.type === 'in' && b.type === 'in') {
			const prevValues = new Set(a.values);
			if (!b.values.every((v) => prevValues.has(v))) return false;
		} else if (a.type === 'range' && b.type === 'range') {
			if ((b.min ?? -Infinity) < (a.min ?? -Infinity)) return false;
			if ((b.max ?? Infinity) > (a.max ?? Infinity)) return false;
		}
	}
	return true;
}
