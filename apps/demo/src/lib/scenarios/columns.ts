import type { ColumnSpec } from '$lib/drivers';
import { EXCHANGES, RATINGS, SECTORS } from '$lib/dataset';

export const TRADE_COLUMNS: ColumnSpec[] = [
	{ id: 'symbol', header: 'Symbol', type: 'text' },
	{ id: 'company', header: 'Company', type: 'text' },
	{ id: 'sector', header: 'Sector', type: 'text', enumValues: [...SECTORS] },
	{ id: 'exchange', header: 'Exchange', type: 'text', enumValues: [...EXCHANGES] },
	{ id: 'price', header: 'Price', type: 'number' },
	{ id: 'quantity', header: 'Quantity', type: 'number' },
	{ id: 'changePct', header: 'Change %', type: 'number' },
	{ id: 'marketCap', header: 'Market Cap', type: 'number' },
	{ id: 'rating', header: 'Rating', type: 'text', enumValues: [...RATINGS] },
	{ id: 'lastUpdated', header: 'Last Updated', type: 'date' }
];
