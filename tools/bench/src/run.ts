/**
 * Benchmark runner. Drives scenario pages in apps/demo via Playwright,
 * captures in-page measurements + CDP metrics, writes JSON to results/.
 *
 * Usage: pnpm bench [scenario ...] [--grid=aggrid,speedy] [--size=10k|100k|1m] [--repeats=N]
 * Assumes the demo app is built (root `pnpm bench` script builds first).
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { chromium, type CDPSession, type Page } from 'playwright';
import { BASE, startServer, stopServer } from './server.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const RESULTS_DIR = join(ROOT, 'tools', 'bench', 'results');

/** Mirrors the scenario registry in apps/demo/src/lib/scenarios. */
const SCENARIOS: { name: string; size: string }[] = [
	{ name: 'initial-render', size: '1m' },
	{ name: 'sort-1m', size: '1m' },
	{ name: 'filter-1m', size: '1m' },
	{ name: 'enum-filter', size: '1m' },
	{ name: 'scroll-storm', size: '1m' },
	{ name: 'live-updates', size: '1m' },
	{ name: 'wide-grid', size: '10k' }
];

interface RunResult {
	scenario: string;
	grid: string;
	size: string;
	/** Version of the grid under test: core version for speedy, ag-grid-community for aggrid. */
	gridVersion: string;
	repeats: number;
	medians: Record<string, number>;
	raw: Record<string, number>[];
}

function packageVersion(relPath: string): string {
	try {
		return JSON.parse(readFileSync(join(ROOT, relPath, 'package.json'), 'utf8')).version;
	} catch {
		return 'unknown';
	}
}

/** Versions of everything under test — bench results are linked to these. */
const VERSIONS: Record<string, string> = {
	'@speedytables/core': packageVersion('packages/core'),
	'@speedytables/svelte': packageVersion('packages/svelte'),
	'ag-grid-community': packageVersion('apps/demo/node_modules/ag-grid-community')
};

const gridVersion = (grid: string): string =>
	grid === 'aggrid' ? VERSIONS['ag-grid-community']! : VERSIONS['@speedytables/core']!;

function parseArgs(argv: string[]) {
	const flags = new Map<string, string>();
	const names: string[] = [];
	for (const arg of argv) {
		const match = arg.match(/^--([^=]+)=(.*)$/);
		if (match) flags.set(match[1]!, match[2]!);
		else names.push(arg);
	}
	return {
		names: names.length ? names : SCENARIOS.map((s) => s.name),
		grids: (flags.get('grid') ?? 'aggrid').split(','),
		size: flags.get('size'),
		repeats: Number(flags.get('repeats') ?? 3)
	};
}

async function cdpMetrics(client: CDPSession): Promise<Record<string, number>> {
	const { metrics } = await client.send('Performance.getMetrics');
	return Object.fromEntries(metrics.map((m: { name: string; value: number }) => [m.name, m.value]));
}

async function runOnce(page: Page, url: string): Promise<Record<string, number>> {
	await page.goto(url, { waitUntil: 'domcontentloaded' });
	await page.waitForFunction(() => '__scenario' in window, undefined, { timeout: 30_000 });
	const client = await page.context().newCDPSession(page);
	await client.send('Performance.enable');
	const before = await cdpMetrics(client);
	const measurements = (await page.evaluate(() =>
		(window as unknown as { __scenario: { run(): Promise<Record<string, number>> } }).__scenario.run()
	)) as Record<string, number>;
	const after = await cdpMetrics(client);
	await client.detach();
	return {
		...measurements,
		cdpTaskDurationMs: round(((after.TaskDuration ?? 0) - (before.TaskDuration ?? 0)) * 1000),
		cdpJsHeapUsedMB: round((after.JSHeapUsedSize ?? 0) / 1e6)
	};
}

function round(n: number): number {
	return Math.round(n * 100) / 100;
}

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid]! : round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

function medians(raw: Record<string, number>[]): Record<string, number> {
	const keys = Object.keys(raw[0] ?? {});
	return Object.fromEntries(keys.map((k) => [k, median(raw.map((r) => r[k] ?? 0))]));
}

function git(cmd: string): string {
	try {
		return execSync(`git ${cmd}`, { cwd: ROOT }).toString().trim();
	} catch {
		return 'unknown';
	}
}

const args = parseArgs(process.argv.slice(2));
const server = await startServer(ROOT);
const browser = await chromium.launch();
const results: RunResult[] = [];

try {
	for (const name of args.names) {
		const spec = SCENARIOS.find((s) => s.name === name);
		if (!spec) throw new Error(`Unknown scenario: ${name}`);
		const size = args.size ?? spec.size;
		for (const grid of args.grids) {
			const url = `${BASE}/scenarios/${name}?grid=${grid}&size=${size}`;
			const raw: Record<string, number>[] = [];
			for (let i = 0; i < args.repeats; i++) {
				const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
				const page = await context.newPage();
				process.stdout.write(`${name} [${grid}, ${size}] run ${i + 1}/${args.repeats}… `);
				const t0 = Date.now();
				raw.push(await runOnce(page, url));
				console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s`);
				await context.close();
			}
			results.push({
				scenario: name,
				grid,
				size,
				gridVersion: gridVersion(grid),
				repeats: args.repeats,
				medians: medians(raw),
				raw
			});
		}
	}

	const meta = {
		date: new Date().toISOString(),
		versions: VERSIONS,
		commit: git('rev-parse --short HEAD'),
		dirty: git('status --porcelain') !== '',
		browser: browser.version(),
		node: process.version,
		os: `${os.platform()} ${os.release()}`,
		cpu: os.cpus()[0]?.model ?? 'unknown',
		cores: os.cpus().length,
		memoryGB: round(os.totalmem() / 1e9)
	};
	mkdirSync(RESULTS_DIR, { recursive: true });
	const stamp = meta.date.replace(/[:T]/g, '-').slice(0, 19);
	const file = join(RESULTS_DIR, `${stamp}-v${VERSIONS['@speedytables/core']}-${meta.commit}.json`);
	writeFileSync(file, JSON.stringify({ meta, results }, null, '\t'));
	console.log(`\nWrote ${file}`);
} finally {
	await browser.close();
	stopServer(server);
}
