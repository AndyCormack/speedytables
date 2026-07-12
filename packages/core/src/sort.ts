import type { Job } from './executor';
import type { Projection } from './projection';
import type { SortDirection } from './types';

export interface SortKey {
	projection: Projection;
	dir: SortDirection;
}

const CHUNK = 16_384; // one chunk sorts comfortably inside a frame budget
const MERGE_YIELD_MASK = 0xffff; // yield every 64k merged elements

/**
 * Chunked merge sort over row indices: sort CHUNK-sized runs, then merge runs
 * pairwise, yielding throughout — no single slice of work exceeds the executor's
 * budget. Ties break by source index, so output is deterministic and stable.
 * O(N log N) total, same as a blocking sort; it just never blocks.
 *
 * `input` is the candidate set (e.g. the filter stage's output); it is copied,
 * never mutated.
 */
export function* sortIndexJob(keys: SortKey[], input: Uint32Array): Job<Uint32Array> {
	const compare = buildComparator(keys);
	const length = input.length;

	let source = input.slice();
	yield;

	for (let lo = 0; lo < length; lo += CHUNK) {
		source.subarray(lo, Math.min(lo + CHUNK, length)).sort(compare);
		yield;
	}

	let target = new Uint32Array(length);
	for (let width = CHUNK; width < length; width *= 2) {
		for (let lo = 0; lo < length; lo += width * 2) {
			const mid = Math.min(lo + width, length);
			const hi = Math.min(lo + width * 2, length);
			let left = lo;
			let right = mid;
			for (let out = lo; out < hi; out++) {
				target[out] =
					right >= hi || (left < mid && compare(source[left]!, source[right]!) <= 0)
						? source[left++]!
						: source[right++]!;
				if ((out & MERGE_YIELD_MASK) === 0) yield;
			}
		}
		[source, target] = [target, source];
	}
	return source;
}

function buildComparator(keys: SortKey[]): (a: number, b: number) => number {
	const count = keys.length;
	const projections = keys.map((k) => k.projection);
	const signs = keys.map((k) => (k.dir === 'desc' ? -1 : 1));
	const isText = keys.map((k) => Array.isArray(k.projection));

	return (a, b) => {
		for (let k = 0; k < count; k++) {
			const sign = signs[k]!;
			if (isText[k]) {
				const projection = projections[k] as string[];
				const va = projection[a]!;
				const vb = projection[b]!;
				if (va !== vb) return va < vb ? -sign : sign;
			} else {
				const projection = projections[k] as Float64Array;
				const va = projection[a]!;
				const vb = projection[b]!;
				const aNaN = Number.isNaN(va);
				const bNaN = Number.isNaN(vb);
				if (aNaN || bNaN) {
					if (aNaN !== bNaN) return aNaN ? 1 : -1; // nulls always last
				} else if (va !== vb) {
					return va < vb ? -sign : sign;
				}
			}
		}
		return a - b; // deterministic ties: source order
	};
}
