/**
 * Prints a markdown report of a results file (default: the newest one).
 * Usage: pnpm bench:report [path/to/results.json]
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RESULTS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'results');

interface ResultsFile {
	meta: Record<string, string | number | boolean>;
	results: {
		scenario: string;
		grid: string;
		size: string;
		repeats: number;
		medians: Record<string, number>;
	}[];
}

const fileArg = process.argv[2];
const file =
	fileArg ??
	readdirSync(RESULTS_DIR)
		.filter((f) => f.endsWith('.json'))
		.sort()
		.map((f) => join(RESULTS_DIR, f))
		.at(-1);

if (!file) {
	console.error('No results files found. Run `pnpm bench` first.');
	process.exit(1);
}

const { meta, results } = JSON.parse(readFileSync(file, 'utf8')) as ResultsFile;

console.log(`# Benchmark report`);
console.log(`\n${meta.date} · commit ${meta.commit}${meta.dirty ? ' (dirty)' : ''} · ${meta.cpu} (${meta.cores} cores) · Chromium ${meta.browser}\n`);

for (const run of results) {
	console.log(`## ${run.scenario} — ${run.grid}, ${run.size} rows (median of ${run.repeats})\n`);
	console.log('| metric | value |');
	console.log('| --- | ---: |');
	for (const [key, value] of Object.entries(run.medians)) {
		console.log(`| ${key} | ${value} |`);
	}
	console.log('');
}
