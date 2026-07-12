import type { ColumnDef } from '@speedytables/core';

/** Filter UI kind, defaulting by dataType: number → range, date → none, text → contains. */
export function filterKind(column: ColumnDef): 'text' | 'enum' | 'range' | 'none' {
	if (column.filter) return column.filter;
	if (column.dataType === 'number') return 'range';
	if (column.dataType === 'date') return 'none';
	return 'text';
}
