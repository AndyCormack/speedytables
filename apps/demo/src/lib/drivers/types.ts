/**
 * GridDriver — the contract every benchmarked grid implements, so scenario
 * pages run identically against AG Grid and SpeedyTables.
 * Methods apply the operation; scenarios wrap calls in `measure()` to time
 * apply + paint uniformly.
 */

export type ColumnType = 'text' | 'number' | 'date';

export interface ColumnSpec {
	id: string;
	header: string;
	type: ColumnType;
	/** When set, the column gets an enum/set filter UI over these values. */
	enumValues?: string[];
}

export interface MountOptions {
	rowHeight?: number;
}

export interface GridDriver {
	/** Resolves once the first window of rows has rendered. */
	mount(el: HTMLElement, columns: ColumnSpec[], rows: object[], opts?: MountOptions): Promise<void>;
	/** Single-column sort; null clears sorting. */
	sortBy(columnId: string | null, dir: 'asc' | 'desc'): Promise<void>;
	/** Text 'contains' filter on one column; empty string clears it. */
	filterContains(columnId: string, text: string): Promise<void>;
	/** Enum/set filter: keep rows whose column value is one of `values`; null clears it. */
	filterIn(columnId: string, values: string[] | null): Promise<void>;
	/** Update existing rows (matched by `id`). Full row objects. */
	applyUpdates(rows: object[]): void;
	/** Vertical scroll container. */
	scrollElement(): HTMLElement;
	/** Horizontal scroll container. */
	hScrollElement(): HTMLElement;
	destroy(): void;
}

export type GridName = 'aggrid' | 'speedy';

export interface DriverOptions {
	/** speedy only: where pipeline compute runs. aggrid ignores it. */
	compute?: 'main-thread' | 'worker' | 'hybrid';
	/** speedy only: part-class theme (e.g. the Tailwind preset). aggrid ignores it. */
	classes?: import('@speedytables/svelte').PartClasses;
	/** Default row height for mounts that don't set one. Applied to both grids, so a picked theme's density never skews a comparison. */
	rowHeight?: number;
}
