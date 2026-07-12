import { describe, expect, it } from 'vitest';
import { computeWindow, MAX_CANVAS_PX, virtualHeight } from './viewport';

const base = { viewportHeight: 600, rowHeight: 32, overscan: 3 };

describe('virtualHeight', () => {
	it('is exact below the cap', () => {
		expect(virtualHeight(1000, 32)).toBe(32_000);
	});

	it('caps at MAX_CANVAS_PX (1m × 32px would exceed browser limits)', () => {
		expect(virtualHeight(1_000_000, 32)).toBe(MAX_CANVAS_PX);
	});
});

describe('computeWindow — uncompressed (content fits the canvas)', () => {
	const input = { ...base, rowCount: 1000, scrollTop: 0 };

	it('starts at row 0 with no offset', () => {
		const w = computeWindow(input);
		expect(w.firstRow).toBe(0);
		expect(w.blockTop).toBe(0);
		expect(w.virtualHeight).toBe(32_000);
	});

	it('renders viewport rows plus overscan', () => {
		const w = computeWindow(input);
		// ceil(600/32)+1 visible + 3 trailing overscan (none leading at the top)
		expect(w.count).toBe(20 + 3);
	});

	it('maps scrollTop 1:1 to rows, block anchored on a row boundary', () => {
		const w = computeWindow({ ...input, scrollTop: 3200 }); // exactly row 100
		expect(w.firstRow).toBe(100 - 3);
		expect(w.blockTop).toBe((100 - 3) * 32);
	});

	it('keeps blockTop = firstRow × rowHeight at arbitrary scroll offsets', () => {
		for (const scrollTop of [1, 31, 33, 1000, 12345]) {
			const w = computeWindow({ ...input, scrollTop });
			expect(w.blockTop).toBe(w.firstRow * 32);
		}
	});

	it('clamps overscroll and still reaches the last row', () => {
		const w = computeWindow({ ...input, scrollTop: 99_999_999 });
		expect(w.firstRow + w.count).toBe(1000);
	});
});

describe('computeWindow — compressed (1m rows, canvas capped)', () => {
	const input = { ...base, rowCount: 1_000_000, scrollTop: 0 };
	const maxScroll = MAX_CANVAS_PX - 600;

	it('caps the canvas', () => {
		expect(computeWindow(input).virtualHeight).toBe(MAX_CANVAS_PX);
	});

	it('bottom of scroll shows the last row', () => {
		const w = computeWindow({ ...input, scrollTop: maxScroll });
		expect(w.firstRow + w.count).toBe(1_000_000);
		// the block must cover the viewport bottom: blockTop + count*32 >= scrollTop + 600
		expect(w.blockTop + w.count * 32).toBeGreaterThanOrEqual(maxScroll + 600);
	});

	it('midpoint of scroll lands near the middle row', () => {
		const w = computeWindow({ ...input, scrollTop: maxScroll / 2 });
		expect(w.firstRow).toBeGreaterThan(490_000);
		expect(w.firstRow).toBeLessThan(510_000);
	});

	it('anchors the exact fractional row at the viewport top', () => {
		for (const scrollTop of [1, 4_000_000, maxScroll - 1]) {
			const w = computeWindow({ ...input, scrollTop });
			// viewport top must sit inside the rendered block
			expect(w.blockTop).toBeLessThanOrEqual(scrollTop);
			expect(w.blockTop + w.count * 32).toBeGreaterThanOrEqual(scrollTop + 600);
		}
	});
});

describe('computeWindow — edge cases', () => {
	it('empty grid renders nothing', () => {
		const w = computeWindow({ ...base, rowCount: 0, scrollTop: 0 });
		expect(w).toEqual({ firstRow: 0, count: 0, blockTop: 0, virtualHeight: 0 });
	});

	it('fewer rows than the viewport renders them all, unscrolled', () => {
		const w = computeWindow({ ...base, rowCount: 5, scrollTop: 100 });
		expect(w.firstRow).toBe(0);
		expect(w.count).toBe(5);
		expect(w.blockTop).toBe(0);
	});

	it('zero viewport height (unmeasured) renders minimal overscan only', () => {
		const w = computeWindow({ ...base, viewportHeight: 0, rowCount: 1000, scrollTop: 0 });
		expect(w.firstRow).toBe(0);
		expect(w.count).toBeLessThanOrEqual(4);
	});
});
