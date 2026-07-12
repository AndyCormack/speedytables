import { describe, expect, it } from 'vitest';
import { MainThreadExecutor } from './executor';
import { sortIndexJob, type SortKey } from './sort';

const executor = new MainThreadExecutor();

function run(keys: SortKey[], length: number): Promise<Uint32Array> {
	return executor.run(sortIndexJob(keys, length));
}

const numbers = (values: number[]): Float64Array => Float64Array.from(values);

describe('sortIndexJob', () => {
	it('sorts numbers ascending', async () => {
		const index = await run([{ projection: numbers([30, 10, 20]), dir: 'asc' }], 3);
		expect([...index]).toEqual([1, 2, 0]);
	});

	it('sorts numbers descending', async () => {
		const index = await run([{ projection: numbers([30, 10, 20]), dir: 'desc' }], 3);
		expect([...index]).toEqual([0, 2, 1]);
	});

	it('sorts text by code unit', async () => {
		const index = await run([{ projection: ['banana', 'apple', 'cherry'], dir: 'asc' }], 3);
		expect([...index]).toEqual([1, 0, 2]);
	});

	it('puts NaN (null) last regardless of direction', async () => {
		for (const dir of ['asc', 'desc'] as const) {
			const index = await run([{ projection: numbers([NaN, 5, 1]), dir }], 3);
			expect(index[2]).toBe(0);
		}
	});

	it('breaks ties by source index (stable)', async () => {
		const index = await run([{ projection: numbers([1, 0, 1, 0]), dir: 'asc' }], 4);
		expect([...index]).toEqual([1, 3, 0, 2]);
	});

	it('applies multi-column sort in order', async () => {
		const sector = ['b', 'a', 'b', 'a'];
		const price = numbers([1, 2, 3, 4]);
		const index = await run(
			[
				{ projection: sector, dir: 'asc' },
				{ projection: price, dir: 'desc' }
			],
			4
		);
		expect([...index]).toEqual([3, 1, 2, 0]);
	});

	it('handles empty input', async () => {
		const index = await run([{ projection: numbers([]), dir: 'asc' }], 0);
		expect(index.length).toBe(0);
	});

	it('sorts correctly across many chunk/merge boundaries', async () => {
		const n = 100_000; // > CHUNK * 4, odd tail
		const values = new Float64Array(n);
		let seed = 42;
		for (let i = 0; i < n; i++) {
			seed = (seed * 1103515245 + 12345) & 0x7fffffff;
			values[i] = seed % 10_000;
		}
		const index = await run([{ projection: values, dir: 'asc' }], n);
		expect(index.length).toBe(n);
		for (let i = 1; i < n; i++) {
			expect(values[index[i]!]!).toBeGreaterThanOrEqual(values[index[i - 1]!]!);
		}
		// every index appears exactly once
		expect(new Set(index).size).toBe(n);
	});

	it('aborts at a slice point', async () => {
		const controller = new AbortController();
		controller.abort();
		await expect(
			executor.run(sortIndexJob([{ projection: numbers([2, 1]), dir: 'asc' }], 2), controller.signal)
		).rejects.toThrow('aborted');
	});
});
