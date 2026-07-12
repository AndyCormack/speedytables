import type { Job } from './executor';
import type { ColumnDef } from './types';

/**
 * Columnar projection: per-column arrays of sort keys, so pipeline stages never
 * walk row objects. Numbers/dates project to Float64Array (null → NaN, sorted
 * last); text projects to string[] (null → '').
 */
export type Projection = Float64Array | string[];

const YIELD_EVERY = 32_768;

export function* buildProjection<Row>(rows: Row[], column: ColumnDef): Job<Projection> {
	const read = (row: Row): unknown => (row as Record<string, unknown>)[column.id];
	const n = rows.length;

	if ((column.dataType ?? 'text') === 'text') {
		const out = new Array<string>(n);
		for (let i = 0; i < n; i++) {
			const value = read(rows[i]!);
			out[i] = value == null ? '' : String(value);
			if (i % YIELD_EVERY === 0) yield;
		}
		return out;
	}

	const out = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		const value = read(rows[i]!);
		out[i] = value == null ? NaN : Number(value);
		if (i % YIELD_EVERY === 0) yield;
	}
	return out;
}
