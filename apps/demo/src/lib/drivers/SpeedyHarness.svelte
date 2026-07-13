<script lang="ts">
	import { createGrid, type ColumnDef } from '@speedytables/core';
	import { Table, type PartClasses } from '@speedytables/svelte';
	import type { ColumnSpec } from './types';

	let {
		columns,
		rows,
		rowHeight,
		compute = 'hybrid',
		classes
	}: {
		columns: ColumnSpec[];
		rows: Record<string, unknown>[];
		rowHeight: number;
		compute?: 'main-thread' | 'worker' | 'hybrid';
		classes?: PartClasses;
	} = $props();

	function toColumnDef(col: ColumnSpec): ColumnDef {
		return {
			id: col.id,
			header: col.header,
			dataType: col.type,
			// enum when values are known; otherwise FilterControl defaults by dataType
			...(col.enumValues ? { filter: 'enum' as const, filterValues: col.enumValues } : {}),
			width: 150,
			format:
				col.type === 'date'
					? (v) => (v == null ? '' : new Date(v as number).toISOString().slice(0, 10))
					: undefined
		};
	}

	// Bench harness: props are fixed for the component's lifetime.
	// svelte-ignore state_referenced_locally
	const grid = createGrid({
		columns: columns.map(toColumnDef),
		getRowId: (row) => row.id as string,
		data: rows,
		rowHeight,
		compute
	});

	export function getGrid() {
		return grid;
	}
</script>

<Table.Root {grid} {classes}>
	<Table.Header />
	<Table.Viewport />
</Table.Root>
