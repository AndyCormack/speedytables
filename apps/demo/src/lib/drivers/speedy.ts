import { mount, unmount } from 'svelte';
import type { Grid } from '@speedytables/core';
import type { GridDriver } from './types';
import SpeedyHarness from './SpeedyHarness.svelte';

const notYet = (feature: string, milestone: string) => () => {
	throw new Error(`speedy: ${feature} lands in ${milestone} (see .wip/plan.md)`);
};

export function speedyDriver(): GridDriver {
	let app: { getGrid(): Grid<Record<string, unknown>> } | null = null;
	let container: HTMLElement | null = null;

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
				props: { columns, rows: rows as Record<string, unknown>[], rowHeight: opts?.rowHeight ?? 32 }
			});
			// parity with the AG Grid driver's onFirstDataRendered: resolve after paint
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			);
		},

		async sortBy(columnId, dir) {
			await app?.getGrid().setSortModel(columnId ? [{ columnId, dir }] : []);
		},
		filterContains: notYet('filtering', 'M3'),
		filterIn: notYet('enum filtering', 'M3'),
		applyUpdates: notYet('deltas', 'M4'),

		scrollElement: viewport,
		hScrollElement: viewport,

		destroy() {
			if (app) unmount(app);
			app = null;
		}
	};
}
