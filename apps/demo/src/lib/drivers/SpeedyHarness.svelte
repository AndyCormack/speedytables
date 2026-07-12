<script lang="ts">
	import { createGrid, type ColumnDef } from '@speedytables/core';
	import { Table } from '@speedytables/svelte';
	import type { ColumnSpec } from './types';

	let {
		columns,
		rows,
		rowHeight
	}: { columns: ColumnSpec[]; rows: Record<string, unknown>[]; rowHeight: number } = $props();

	function toColumnDef(col: ColumnSpec): ColumnDef {
		return {
			id: col.id,
			header: col.header,
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
		rowHeight
	});
</script>

<Table.Root {grid}>
	<Table.Header />
	<Table.Viewport />
</Table.Root>
