/**
 * Structural smoke tests for the speedy grid: invariants that benchmarks and
 * unit tests can't see, caught only by real DOM geometry.
 *
 * Usage: pnpm smoke (root; builds demo first) or node src/smoke.ts
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { BASE, startServer, stopServer } from './server.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

let failures = 0;
function check(name: string, ok: boolean, detail = ''): void {
	console.log(`${ok ? '  ok ' : 'FAIL '}${name}${detail ? ` — ${detail}` : ''}`);
	if (!ok) failures++;
}

interface Box {
	x: number;
	w: number;
}

const server = await startServer(ROOT);
const browser = await chromium.launch();

try {
	const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
	page.on('pageerror', (e) => check('no page errors', false, String(e).slice(0, 200)));
	await page.goto(`${BASE}/scenarios/initial-render?grid=speedy&size=10k`);
	await page.waitForFunction(() => '__scenario' in window);
	await page.evaluate(() => (window as unknown as { __scenario: { run(): Promise<unknown> } }).__scenario.run());
	await page.waitForTimeout(150);

	const geometry = () =>
		page.evaluate(() => {
			const box = (el: Element): { x: number; w: number } => {
				const r = el.getBoundingClientRect();
				return { x: Math.round(r.x * 10) / 10, w: Math.round(r.width * 10) / 10 };
			};
			return {
				headers: [...document.querySelectorAll('[data-speedy-header-cell]')].map(box),
				cells: [...(document.querySelector('[data-speedy-row]')?.querySelectorAll('[data-speedy-cell]') ?? [])].map(box)
			};
		});

	const assertAligned = (label: string, headers: Box[], cells: Box[]) => {
		check(`${label}: column counts match`, headers.length === cells.length, `${headers.length} vs ${cells.length}`);
		for (let i = 0; i < Math.min(headers.length, cells.length); i++) {
			const dx = Math.abs(headers[i]!.x - cells[i]!.x);
			const dw = Math.abs(headers[i]!.w - cells[i]!.w);
			if (dx > 0.5 || dw > 0.5) {
				check(`${label}: column ${i} aligned`, false, `x drift ${dx}px, width drift ${dw}px`);
			}
		}
		check(`${label}: all columns aligned`, true);
	};

	// 1. header/cell alignment at rest (the border-box regression)
	const rest = await geometry();
	check('grid rendered', rest.headers.length > 0 && rest.cells.length > 0);
	assertAligned('at rest', rest.headers, rest.cells);

	// 2. alignment under horizontal scroll (header transform sync)
	await page.$eval('[data-speedy-viewport]', (el) => (el.scrollLeft = 300));
	await page.waitForTimeout(150);
	const scrolled = await geometry();
	assertAligned('h-scrolled', scrolled.headers, scrolled.cells);

	// 3. enum popover renders in the top layer, above the grid, and Esc closes it
	await page.locator('[data-speedy-enum-trigger]').first().click();
	await page.waitForTimeout(200);
	const panel = page.locator('[data-speedy-enum-panel]:popover-open');
	check('enum popover opens visibly', await panel.isVisible());
	const overlap = await page.evaluate(() => {
		const p = document.querySelector('[data-speedy-enum-panel]:popover-open')?.getBoundingClientRect();
		const row = document.querySelector('[data-speedy-row]')?.getBoundingClientRect();
		if (!p || !row) return false;
		const el = document.elementFromPoint(p.left + 10, Math.min(p.top + 10, innerHeight - 1));
		return document.querySelector('[data-speedy-enum-panel]')?.contains(el) ?? false;
	});
	check('popover paints above rows', overlap);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(100);
	check('Esc closes popover', (await panel.count()) === 0);

	// 4. vertical scroll shows in-window rows (blank-viewport regression)
	await page.$eval('[data-speedy-viewport]', (el) => (el.scrollTop = 100_000));
	await page.waitForTimeout(200);
	const covered = await page.evaluate(() => {
		const viewport = document.querySelector('[data-speedy-viewport]')!.getBoundingClientRect();
		const probeY = viewport.top + viewport.height / 2;
		const el = document.elementFromPoint(viewport.left + 40, probeY);
		return el?.closest('[data-speedy-row]') !== null;
	});
	check('rows visible after scroll jump', covered);
} finally {
	await browser.close();
	stopServer(server);
}

console.log(failures === 0 ? '\nsmoke: all checks passed' : `\nsmoke: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
