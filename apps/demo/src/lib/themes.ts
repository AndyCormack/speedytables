/** The shipped theme catalog, as shown on /themes. */
export interface ThemeEntry {
	id: string;
	name: string;
	blurb: string;
	/** 'tokens' themes activate via data-speedy-theme; 'classes' via the part-class preset. */
	mechanism: 'tokens' | 'classes';
	/** Page background behind the pane, so light themes render as proper islands. */
	paneBg: string;
	paneScheme: 'light' | 'dark';
	/** Recommended fixed row height for this theme's density. */
	rowHeight: number;
}

export const THEMES: ThemeEntry[] = [
	{
		id: 'graphite',
		name: 'Graphite',
		blurb: 'Deep blue-gray instrument, steel-teal state accents. The default.',
		mechanism: 'tokens',
		paneBg: 'oklch(0.16 0.01 255)',
		paneScheme: 'dark',
		rowHeight: 32
	},
	{
		id: 'porcelain',
		name: 'Porcelain',
		blurb: 'True neutral daylight, cobalt accents. Reads like a printed data sheet.',
		mechanism: 'tokens',
		paneBg: 'oklch(0.94 0.003 250)',
		paneScheme: 'light',
		rowHeight: 38
	},
	{
		id: 'oxide',
		name: 'Oxide',
		blurb: 'Warm near-black, verdigris copper. Patina on hot metal.',
		mechanism: 'tokens',
		paneBg: 'oklch(0.15 0.012 45)',
		paneScheme: 'dark',
		rowHeight: 32
	},
	{
		id: 'ledger',
		name: 'Ledger',
		blurb: 'Dense cool paper, oxblood accents. The accountant’s grid.',
		mechanism: 'tokens',
		paneBg: 'oklch(0.925 0.005 250)',
		paneScheme: 'light',
		rowHeight: 26
	},
	{
		id: 'aurora',
		name: 'Aurora',
		blurb: 'Drenched violet night sky, auroral green. The expressive one.',
		mechanism: 'tokens',
		paneBg: 'oklch(0.19 0.05 300)',
		paneScheme: 'dark',
		rowHeight: 42
	},
	{
		id: 'tailwind',
		name: 'Tailwind',
		blurb: 'A part-class preset (zinc + sky) that composes with your own Tailwind config.',
		mechanism: 'classes',
		paneBg: 'oklch(0.14 0.005 285)',
		paneScheme: 'dark',
		rowHeight: 34
	}
];
