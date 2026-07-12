import {
	ClientSideRowModelApiModule,
	ClientSideRowModelModule,
	ColumnApiModule,
	createGrid,
	ModuleRegistry,
	NumberFilterModule,
	TextFilterModule,
	themeQuartz,
	type ColDef,
	type GridApi
} from 'ag-grid-community';
import type { ColumnSpec, GridDriver, MountOptions } from './types';

// Minimal production module set — only what the scenarios exercise. Deliberately
// NOT AllCommunityModule: that bundles ValidationModule (dev-mode option
// validation), which AG Grid's own docs say to exclude in production.
ModuleRegistry.registerModules([
	ClientSideRowModelModule,
	ClientSideRowModelApiModule, // applyTransactionAsync
	ColumnApiModule, // applyColumnState (sorting)
	TextFilterModule,
	NumberFilterModule
]);

export const AG_GRID_VERSION = '34.3.1';

function toColDef(col: ColumnSpec): ColDef {
	return {
		field: col.id,
		headerName: col.header,
		filter: col.type === 'number' ? 'agNumberColumnFilter' : 'agTextColumnFilter',
		floatingFilter: true, // per-column filter inputs, matching speedy's Table.FilterRow
		// enum filters are OR-of-equals conditions (Community has no set filter — Enterprise only)
		filterParams: { maxNumConditions: 50 },
		valueFormatter:
			col.type === 'date'
				? (p) => (p.value == null ? '' : new Date(p.value).toISOString().slice(0, 10))
				: undefined
	};
}

export function agGridDriver(): GridDriver {
	let api: GridApi | null = null;
	let container: HTMLElement | null = null;

	const viewport = (selector: string): HTMLElement => {
		const el = container?.querySelector<HTMLElement>(selector);
		if (!el) throw new Error(`AG Grid viewport not found: ${selector}`);
		return el;
	};

	return {
		mount(el, columns, rows, opts?: MountOptions) {
			container = el;
			return new Promise<void>((resolve) => {
				api = createGrid(el, {
					theme: themeQuartz,
					columnDefs: columns.map(toColDef),
					rowData: rows,
					getRowId: (p) => (p.data as { id: string }).id,
					rowHeight: opts?.rowHeight ?? 32,
					headerHeight: 32,
					animateRows: false,
					rowBuffer: 3, // match speedy's overscan: 3 (AG default is 10)
					onFirstDataRendered: () => resolve()
				});
			});
		},

		async sortBy(columnId, dir) {
			api?.applyColumnState({
				state: columnId ? [{ colId: columnId, sort: dir }] : [],
				defaultState: { sort: null }
			});
		},

		async filterContains(columnId, text) {
			if (!api) return;
			await api.setColumnFilterModel(
				columnId,
				text === '' ? null : { filterType: 'text', type: 'contains', filter: text }
			);
			api.onFilterChanged();
		},

		async filterIn(columnId, values) {
			if (!api) return;
			await api.setColumnFilterModel(
				columnId,
				values === null
					? null
					: {
							filterType: 'text',
							operator: 'OR',
							conditions: values.map((v) => ({ filterType: 'text', type: 'equals', filter: v }))
						}
			);
			api.onFilterChanged();
		},

		applyUpdates(rows) {
			api?.applyTransactionAsync({ update: rows });
		},

		scrollElement: () => viewport('.ag-body-viewport'),
		hScrollElement: () => viewport('.ag-center-cols-viewport'),

		destroy() {
			api?.destroy();
			api = null;
		}
	};
}
