import { mount, unmount } from 'svelte';
import type { FilterSpec, Grid } from '@speedytables/core';
import type { DriverOptions, GridDriver } from './types';
import SpeedyHarness from './SpeedyHarness.svelte';

const notYet = (feature: string, milestone: string) => () => {
	throw new Error(`speedy: ${feature} lands in ${milestone} (see .wip/plan.md)`);
};

export function speedyDriver(options?: DriverOptions): GridDriver {
	let app: { getGrid(): Grid<Record<string, unknown>> } | null = null;
	let container: HTMLElement | null = null;
	// GridDriver filter ops are per-column merges (AG Grid semantics); the grid
	// takes the whole declarative model, so track specs per column here.
	const filters = new Map<string, FilterSpec>();
	const applyFilters = () => app?.getGrid().setFilterModel([...filters.values()]) ?? Promise.resolve();

	const viewport = (): HTMLElement => {
		const el = container?.querySelector<HTMLElement>('[data-speedy-viewport]');
		if (!el) throw new Error('speedy viewport not found');
		return el;
	};

	return {
		async mount(el, columns, rows, opts) {
			container = el;
			app = mount(SpeedyHarness, {
				target: el,
				props: {
					columns,
					rows: rows as Record<string, unknown>[],
					rowHeight: opts?.rowHeight ?? 32,
					compute: options?.compute ?? 'main-thread'
				}
			});
			// parity with the AG Grid driver's onFirstDataRendered: resolve after paint
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			);
		},

		async sortBy(columnId, dir) {
			await app?.getGrid().setSortModel(columnId ? [{ columnId, dir }] : []);
		},
		async filterContains(columnId, text) {
			if (text === '') filters.delete(columnId);
			else filters.set(columnId, { columnId, type: 'contains', value: text });
			await applyFilters();
		},

		async filterIn(columnId, values) {
			if (values === null) filters.delete(columnId);
			else filters.set(columnId, { columnId, type: 'in', values });
			await applyFilters();
		},
		applyUpdates(rows) {
			void app?.getGrid().applyDelta({ update: rows as Record<string, unknown>[] });
		},

		scrollElement: viewport,
		hScrollElement: viewport,

		destroy() {
			app?.getGrid().destroy(); // releases the worker in worker mode
			if (app) unmount(app);
			app = null;
		}
	};
}
