import type { Scenario } from './types';
import { afterPaint, driveFrames, LongTaskRecorder, measure, median, round } from '$lib/bench';
import { generateTicks, generateTrades, generateWide, RATINGS, SECTORS } from '$lib/dataset';
import { TRADE_COLUMNS } from './columns';
import type { ColumnSpec } from '$lib/drivers';

export type { Scenario, ScenarioContext } from './types';

const initialRender: Scenario = {
	name: 'initial-render',
	description: 'Load N rows → time until the first window of rows is painted.',
	defaultSize: '1m',
	async run({ driver, el, size }) {
		const t0 = performance.now();
		const rows = generateTrades(size);
		const generateMs = performance.now() - t0;
		const mountMs = await measure('mount', () => driver.mount(el, TRADE_COLUMNS, rows));
		return { generateMs: round(generateMs), mountMs: round(mountMs) };
	}
};

const sort1m: Scenario = {
	name: 'sort-1m',
	description: 'Header-driven sorts on a numeric and a text column: apply → painted.',
	defaultSize: '1m',
	async run({ driver, el, size }) {
		await driver.mount(el, TRADE_COLUMNS, generateTrades(size));
		const longTasks = new LongTaskRecorder();
		longTasks.start();
		const sortNumberDescMs = await measure('sort-number-desc', () => driver.sortBy('price', 'desc'));
		const sortNumberAscMs = await measure('sort-number-asc', () => driver.sortBy('price', 'asc'));
		const sortTextAscMs = await measure('sort-text-asc', () => driver.sortBy('symbol', 'asc'));
		const clearSortMs = await measure('clear-sort', () => driver.sortBy(null, 'asc'));
		return {
			sortNumberDescMs: round(sortNumberDescMs),
			sortNumberAscMs: round(sortNumberAscMs),
			sortTextAscMs: round(sortTextAscMs),
			clearSortMs: round(clearSortMs),
			...longTasks.stop()
		};
	}
};

const filter1m: Scenario = {
	name: 'filter-1m',
	description: 'Typing a text filter one keystroke at a time: per-keystroke latency.',
	defaultSize: '1m',
	async run({ driver, el, size }) {
		await driver.mount(el, TRADE_COLUMNS, generateTrades(size));
		const longTasks = new LongTaskRecorder();
		longTasks.start();
		const keystrokes: number[] = [];
		const text = 'Pacific';
		for (let i = 1; i <= text.length; i++) {
			keystrokes.push(await measure(`keystroke-${i}`, () => driver.filterContains('company', text.slice(0, i))));
		}
		const clearFilterMs = await measure('clear-filter', () => driver.filterContains('company', ''));
		const result: Record<string, number> = {
			keystrokeMedianMs: round(median(keystrokes)),
			keystrokeMaxMs: round(Math.max(...keystrokes)),
			clearFilterMs: round(clearFilterMs),
			...longTasks.stop()
		};
		keystrokes.forEach((ms, i) => (result[`keystroke${i + 1}Ms`] = round(ms)));
		return result;
	}
};

const enumFilter: Scenario = {
	name: 'enum-filter',
	description: 'Set-style filters on enum columns (sector, rating): apply, widen, narrow, stack, clear.',
	defaultSize: '1m',
	async run({ driver, el, size }) {
		await driver.mount(el, TRADE_COLUMNS, generateTrades(size));
		const longTasks = new LongTaskRecorder();
		longTasks.start();
		const five = SECTORS.slice(0, 5) as unknown as string[];
		const applyOneOf11Ms = await measure('enum-one', () => driver.filterIn('sector', ['Technology']));
		const applyFiveOf11Ms = await measure('enum-five', () => driver.filterIn('sector', five));
		const addValueMs = await measure('enum-add', () => driver.filterIn('sector', [...five, SECTORS[5]!]));
		const removeValueMs = await measure('enum-remove', () => driver.filterIn('sector', five));
		const stackSecondEnumMs = await measure('enum-stack', () =>
			driver.filterIn('rating', RATINGS.slice(0, 3) as unknown as string[])
		);
		const clearAllMs = await measure('enum-clear', async () => {
			await driver.filterIn('rating', null);
			await driver.filterIn('sector', null);
		});
		return {
			applyOneOf11Ms: round(applyOneOf11Ms),
			applyFiveOf11Ms: round(applyFiveOf11Ms),
			addValueMs: round(addValueMs),
			removeValueMs: round(removeValueMs),
			stackSecondEnumMs: round(stackSecondEnumMs),
			clearAllMs: round(clearAllMs),
			...longTasks.stop()
		};
	}
};

const scrollStorm: Scenario = {
	name: 'scroll-storm',
	description: 'Sustained top-to-bottom scroll sweep for 4s: frame timing under pressure.',
	defaultSize: '1m',
	async run({ driver, el, size }) {
		await driver.mount(el, TRADE_COLUMNS, generateTrades(size));
		const scroller = driver.scrollElement();
		const maxScroll = scroller.scrollHeight - scroller.clientHeight;
		const longTasks = new LongTaskRecorder();
		longTasks.start();
		const frames = await driveFrames(4000, (t) => {
			scroller.scrollTop = t * maxScroll;
		});
		await afterPaint();
		return { ...frames, ...longTasks.stop() };
	}
};

const liveUpdates: Scenario = {
	name: 'live-updates',
	description: '1k row updates/sec for 5s into a sorted + filtered grid.',
	defaultSize: '1m',
	async run({ driver, el, size }) {
		const rows = generateTrades(size);
		const rowsById = new Map(rows.map((r) => [r.id, r]));
		await driver.mount(el, TRADE_COLUMNS, rows);
		await driver.sortBy('price', 'desc');
		await driver.filterContains('sector', 'e');

		const durationMs = 5000;
		const ticks = generateTicks(size, (1000 * durationMs) / 1000);
		let fed = 0;
		const longTasks = new LongTaskRecorder();
		longTasks.start();
		const frames = await driveFrames(durationMs, (t) => {
			const target = Math.floor(t * ticks.length);
			if (target <= fed) return;
			const updates = [];
			for (const tick of ticks.slice(fed, target)) {
				const existing = rowsById.get(tick.id);
				if (!existing) continue;
				const updated = { ...existing, price: tick.price, changePct: tick.changePct };
				rowsById.set(tick.id, updated);
				updates.push(updated);
			}
			driver.applyUpdates(updates);
			fed = target;
		});
		await afterPaint();
		return { ticksApplied: fed, ...frames, ...longTasks.stop() };
	}
};

const WIDE_COLS = 150;
const wideColumns: ColumnSpec[] = Array.from({ length: WIDE_COLS }, (_, i) => ({
	id: `col${i}`,
	header: `Col ${i}`,
	type: 'number' as const
}));

const wideGrid: Scenario = {
	name: 'wide-grid',
	description: '150 columns × 10k rows: horizontal sweep + a sort.',
	defaultSize: '10k',
	async run({ driver, el, size }) {
		await driver.mount(el, wideColumns, generateWide(size, WIDE_COLS));
		const scroller = driver.hScrollElement();
		const maxScroll = scroller.scrollWidth - scroller.clientWidth;
		const longTasks = new LongTaskRecorder();
		longTasks.start();
		const frames = await driveFrames(3000, (t) => {
			scroller.scrollLeft = t * maxScroll;
		});
		const sortMs = await measure('wide-sort', () => driver.sortBy('col0', 'desc'));
		return { ...frames, sortMs: round(sortMs), ...longTasks.stop() };
	}
};

export const scenarios: Record<string, Scenario> = Object.fromEntries(
	[initialRender, sort1m, filter1m, enumFilter, scrollStorm, liveUpdates, wideGrid].map((s) => [s.name, s])
);
