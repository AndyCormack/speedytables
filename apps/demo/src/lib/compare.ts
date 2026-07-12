/**
 * Per-grid result persistence + comparison math for scenario pages.
 * Results are stored per (scenario, size, grid) so runs survive grid switches
 * and page reloads, enabling a side-by-side diff.
 */
import type { GridName } from './drivers';

export interface StoredRun {
	results: Record<string, number>;
	date: string;
}

const storageKey = (scenario: string, size: string, grid: GridName) =>
	`st-results:${scenario}:${size}:${grid}`;

export function loadRun(scenario: string, size: string, grid: GridName): StoredRun | null {
	try {
		return JSON.parse(localStorage.getItem(storageKey(scenario, size, grid)) ?? 'null');
	} catch {
		return null;
	}
}

export function saveRun(
	scenario: string,
	size: string,
	grid: GridName,
	results: Record<string, number>
): void {
	localStorage.setItem(
		storageKey(scenario, size, grid),
		JSON.stringify({ results, date: new Date().toISOString() } satisfies StoredRun)
	);
}

export function clearRuns(scenario: string, size: string): void {
	localStorage.removeItem(storageKey(scenario, size, 'speedy'));
	localStorage.removeItem(storageKey(scenario, size, 'aggrid'));
}

/** Higher is better only for throughput metrics; everything else is time/blocking/memory. */
export function higherIsBetter(metric: string): boolean {
	return metric === 'ticksApplied' || metric === 'frames';
}

export interface Delta {
	winner: 'speedy' | 'aggrid' | 'tie';
	/** "12.3×" for large gaps, "+18%" for small ones, "—" when not comparable. */
	label: string;
}

export function compareMetric(metric: string, speedy: number, aggrid: number): Delta {
	if (speedy === aggrid) return { winner: 'tie', label: '—' };
	const speedyWins = higherIsBetter(metric) ? speedy > aggrid : speedy < aggrid;
	const winner = speedyWins ? 'speedy' : 'aggrid';
	const [better, worse] = speedyWins ? [speedy, aggrid] : [aggrid, speedy];
	const ratio = higherIsBetter(metric) ? better / worse : worse / better;
	if (!Number.isFinite(ratio) || ratio <= 0) return { winner, label: '—' };
	return { winner, label: ratio >= 2 ? `${ratio >= 10 ? ratio.toFixed(0) : ratio.toFixed(1)}×` : `+${Math.round((ratio - 1) * 100)}%` };
}

/** Union of metric keys, preserving first-seen order. */
export function metricKeys(a?: Record<string, number>, b?: Record<string, number>): string[] {
	return [...new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])];
}

export function relativeTime(iso: string): string {
	const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
	if (seconds < 60) return 'just now';
	if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
	if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
	return `${Math.round(seconds / 86400)}d ago`;
}
