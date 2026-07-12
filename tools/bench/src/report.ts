/**
 * Builds a markdown report from the results history: the newest run per
 * (scenario, grid, size) across all results files, with provenance per entry.
 * Metric definitions and caveats: docs/benchmarking.md.
 *
 * Usage: pnpm bench:report            # print to stdout
 *        pnpm bench:report --write    # also update results/REPORT.md
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RESULTS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'results');

interface Meta {
	date: string;
	commit: string;
	dirty: boolean;
	browser: string;
	cpu: string;
	cores: number;
}

interface Run {
	scenario: string;
	grid: string;
	size: string;
	repeats: number;
	medians: Record<string, number>;
}

const files = readdirSync(RESULTS_DIR)
	.filter((f) => f.endsWith('.json'))
	.sort(); // timestamped names → chronological

if (files.length === 0) {
	console.error('No results files found. Run `pnpm bench` first.');
	process.exit(1);
}

// Later files overwrite earlier ones per key.
const latest = new Map<string, { run: Run; meta: Meta; file: string }>();
for (const file of files) {
	const { meta, results } = JSON.parse(readFileSync(join(RESULTS_DIR, file), 'utf8')) as {
		meta: Meta;
		results: Run[];
	};
	for (const run of results) {
		latest.set(`${run.scenario}|${run.grid}|${run.size}`, { run, meta, file });
	}
}

const lines: string[] = [];
lines.push('# Benchmark report');
lines.push('');
lines.push('Newest recorded run per scenario/grid/size. Regenerate with `pnpm bench:report --write`.');
lines.push('Metric definitions and caveats: [docs/benchmarking.md](../../docs/benchmarking.md).');
lines.push('');

for (const { run, meta } of [...latest.values()].sort((a, b) =>
	a.run.scenario.localeCompare(b.run.scenario) || a.run.grid.localeCompare(b.run.grid)
)) {
	lines.push(
		`## ${run.scenario} — ${run.grid}, ${run.size} rows (median of ${run.repeats})`
	);
	lines.push('');
	lines.push(
		`_${meta.date} · commit ${meta.commit}${meta.dirty ? ' (dirty)' : ''} · ${meta.cpu.trim()} (${meta.cores} cores) · Chromium ${meta.browser}_`
	);
	lines.push('');
	lines.push('| metric | value |');
	lines.push('| --- | ---: |');
	for (const [key, value] of Object.entries(run.medians)) {
		lines.push(`| ${key} | ${value} |`);
	}
	lines.push('');
}

const report = lines.join('\n');
console.log(report);

if (process.argv.includes('--write')) {
	const path = join(RESULTS_DIR, 'REPORT.md');
	writeFileSync(path, report + '\n');
	console.error(`\nWrote ${path}`);
}
