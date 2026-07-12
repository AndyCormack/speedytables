import type { ColumnSpec } from '$lib/drivers';

export const TRADE_COLUMNS: ColumnSpec[] = [
	{ id: 'symbol', header: 'Symbol', type: 'text' },
	{ id: 'company', header: 'Company', type: 'text' },
	{ id: 'sector', header: 'Sector', type: 'text' },
	{ id: 'exchange', header: 'Exchange', type: 'text' },
	{ id: 'price', header: 'Price', type: 'number' },
	{ id: 'quantity', header: 'Quantity', type: 'number' },
	{ id: 'changePct', header: 'Change %', type: 'number' },
	{ id: 'marketCap', header: 'Market Cap', type: 'number' },
	{ id: 'rating', header: 'Rating', type: 'text' },
	{ id: 'lastUpdated', header: 'Last Updated', type: 'date' }
];
