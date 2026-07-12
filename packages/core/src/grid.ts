import { SliceEmitter } from './emitter';
import { RowPipeline } from './pipeline';
import { computeWindow } from './viewport';
import type { ColumnDef, GridConfig, PositionSlice, Slice, WindowSlice } from './types';

export class Grid<Row> {
	readonly columns: ColumnDef[];
	readonly rowHeight: number;
	readonly getRowId: (row: Row) => string;

	#pipeline = new RowPipeline<Row>();
	#emitter = new SliceEmitter();
	#overscan: number;
	#scrollTop = 0;
	#viewportHeight = 0;

	#window: WindowSlice<Row> = { firstRow: 0, count: 0, rows: [] };
	#position: PositionSlice = { blockTop: 0, virtualHeight: 0 };

	constructor(config: GridConfig<Row>) {
		this.columns = config.columns;
		this.rowHeight = config.rowHeight ?? 32;
		this.getRowId = config.getRowId;
		this.#overscan = config.overscan ?? 3;
		if (config.data) this.#pipeline.setSource(config.data);
		this.#recompute();
	}

	get window(): WindowSlice<Row> {
		return this.#window;
	}

	get position(): PositionSlice {
		return this.#position;
	}

	get rowCount(): number {
		return this.#pipeline.length;
	}

	setData(rows: Row[]): void {
		this.#pipeline.setSource(rows);
		this.#recompute();
	}

	setScrollTop(px: number): void {
		this.#scrollTop = px;
		this.#recompute();
	}

	setViewportHeight(px: number): void {
		this.#viewportHeight = px;
		this.#recompute();
	}

	subscribe(slice: Slice, listener: () => void): () => void {
		return this.#emitter.subscribe(slice, listener);
	}

	#recompute(): void {
		const next = computeWindow({
			scrollTop: this.#scrollTop,
			viewportHeight: this.#viewportHeight,
			rowHeight: this.rowHeight,
			rowCount: this.#pipeline.length,
			overscan: this.#overscan
		});

		if (next.blockTop !== this.#position.blockTop || next.virtualHeight !== this.#position.virtualHeight) {
			this.#position = { blockTop: next.blockTop, virtualHeight: next.virtualHeight };
			this.#emitter.notify('position');
		}

		// The window slice only changes when different rows come into view —
		// per-pixel scrolling inside the same window notifies 'position' alone.
		if (next.firstRow !== this.#window.firstRow || next.count !== this.#window.count) {
			this.#window = {
				firstRow: next.firstRow,
				count: next.count,
				rows: this.#pipeline.window(next.firstRow, next.count)
			};
			this.#emitter.notify('window');
		}
	}
}

export function createGrid<Row>(config: GridConfig<Row>): Grid<Row> {
	return new Grid(config);
}
