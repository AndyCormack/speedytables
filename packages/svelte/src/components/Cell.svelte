<script lang="ts">
	import type { ColumnDef } from '@speedytables/core';
	import type { RowData } from '../view.svelte';

	let { row, column }: { row: RowData; column: ColumnDef } = $props();

	const text = $derived.by(() => {
		const value = row[column.id];
		if (column.format) return column.format(value);
		return value == null ? '' : String(value);
	});
</script>

<div
	data-speedy-cell
	data-dtype={column.dataType ?? 'text'}
	role="gridcell"
	style="width:{column.width ?? 150}px; box-sizing:border-box; flex:none; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
>
	{text}
</div>
