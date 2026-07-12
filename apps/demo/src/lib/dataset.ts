/**
 * Deterministic dataset generator for benchmark scenarios.
 * Same seed + size → identical rows, so every bench run (and both grids) sees the same data.
 */

export interface TradeRow {
	id: string;
	symbol: string;
	company: string;
	sector: string;
	exchange: string;
	price: number;
	quantity: number;
	changePct: number;
	marketCap: number;
	rating: string;
	lastUpdated: number; // epoch ms
}

export const SIZES = { '10k': 10_000, '100k': 100_000, '1m': 1_000_000 } as const;
export type SizeKey = keyof typeof SIZES;

export const SECTORS = [
	'Technology',
	'Healthcare',
	'Financials',
	'Energy',
	'Utilities',
	'Materials',
	'Industrials',
	'Consumer Staples',
	'Consumer Discretionary',
	'Real Estate',
	'Communication'
] as const;

export const EXCHANGES = ['NYSE', 'NASDAQ', 'LSE', 'TSE', 'HKEX'] as const;
export const RATINGS = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC'] as const;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const COMPANY_A = ['Global', 'United', 'Pacific', 'Northern', 'Apex', 'Quantum', 'Sterling', 'Summit', 'Vertex', 'Pioneer'];
const COMPANY_B = ['Dynamics', 'Holdings', 'Systems', 'Industries', 'Partners', 'Capital', 'Logistics', 'Energy', 'Materials', 'Networks'];

const BASE_DATE = Date.UTC(2026, 0, 1);

/** mulberry32 — tiny, fast, good-enough seeded PRNG for synthetic data. */
export function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function generateTrades(count: number, seed = 42): TradeRow[] {
	const rand = mulberry32(seed);
	const rows: TradeRow[] = new Array(count);
	for (let i = 0; i < count; i++) {
		const symbol =
			LETTERS[Math.floor(rand() * 26)]! +
			LETTERS[Math.floor(rand() * 26)]! +
			LETTERS[Math.floor(rand() * 26)]! +
			LETTERS[Math.floor(rand() * 26)]!;
		rows[i] = {
			id: `r${i}`,
			symbol,
			company: `${COMPANY_A[Math.floor(rand() * COMPANY_A.length)]} ${COMPANY_B[Math.floor(rand() * COMPANY_B.length)]} ${Math.floor(rand() * 900) + 100}`,
			sector: SECTORS[Math.floor(rand() * SECTORS.length)]!,
			exchange: EXCHANGES[Math.floor(rand() * EXCHANGES.length)]!,
			price: Math.round(rand() * 99_900 + 100) / 100, // 1.00 .. 1000.00
			quantity: Math.floor(rand() * 100_000),
			changePct: Math.round((rand() * 20 - 10) * 100) / 100, // -10.00 .. +10.00
			marketCap: Math.floor(rand() * 2_000_000_000_000),
			rating: RATINGS[Math.floor(rand() * RATINGS.length)]!,
			lastUpdated: BASE_DATE + Math.floor(rand() * 31_536_000_000) // within 2026
		};
	}
	return rows;
}

/** Wide dataset: id + `cols` numeric columns (col0..colN). For the wide-grid scenario. */
export function generateWide(count: number, cols: number, seed = 42): Record<string, number | string>[] {
	const rand = mulberry32(seed);
	const rows: Record<string, number | string>[] = new Array(count);
	for (let i = 0; i < count; i++) {
		const row: Record<string, number | string> = { id: `r${i}` };
		for (let c = 0; c < cols; c++) row[`col${c}`] = Math.round(rand() * 1_000_000) / 100;
		rows[i] = row;
	}
	return rows;
}

/**
 * Deterministic stream of row updates for the live-updates scenario.
 * Returns `count` price ticks against random existing rows.
 */
export function generateTicks(
	rowCount: number,
	count: number,
	seed = 1337
): { id: string; price: number; changePct: number }[] {
	const rand = mulberry32(seed);
	const ticks = new Array(count);
	for (let i = 0; i < count; i++) {
		ticks[i] = {
			id: `r${Math.floor(rand() * rowCount)}`,
			price: Math.round(rand() * 99_900 + 100) / 100,
			changePct: Math.round((rand() * 20 - 10) * 100) / 100
		};
	}
	return ticks;
}
