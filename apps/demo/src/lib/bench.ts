/**
 * In-page instrumentation for benchmark scenarios.
 * The bench runner reads the returned numbers; performance marks/measures are
 * also emitted so results are inspectable in DevTools.
 */

/** Resolves after the browser has had a chance to paint (double rAF). */
export function afterPaint(): Promise<void> {
	return new Promise((resolve) =>
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
	);
}

/** Runs `fn`, waits for paint, returns elapsed ms. Emits a performance.measure. */
export async function measure(name: string, fn: () => void | Promise<void>): Promise<number> {
	performance.mark(`${name}:start`);
	const start = performance.now();
	await fn();
	await afterPaint();
	const elapsed = performance.now() - start;
	performance.measure(name, `${name}:start`);
	return elapsed;
}

export interface LongTaskStats {
	longTaskCount: number;
	longTaskTotalMs: number;
	longTaskMaxMs: number;
}

/** Records main-thread tasks >50ms (the platform 'longtask' threshold) while active. */
export class LongTaskRecorder {
	#durations: number[] = [];
	#observer: PerformanceObserver | null = null;

	start(): void {
		this.#durations = [];
		this.#observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) this.#durations.push(entry.duration);
		});
		this.#observer.observe({ type: 'longtask' });
	}

	stop(): LongTaskStats {
		this.#observer?.disconnect();
		this.#observer = null;
		return {
			longTaskCount: this.#durations.length,
			longTaskTotalMs: round(this.#durations.reduce((a, b) => a + b, 0)),
			longTaskMaxMs: round(Math.max(0, ...this.#durations))
		};
	}
}

export interface FrameStats {
	frames: number;
	frameAvgMs: number;
	frameP95Ms: number;
	frameMaxMs: number;
	framesOver16Pct: number;
	framesOver33Pct: number;
}

/**
 * Drives an animation for `totalMs`, calling `onFrame(progress 0..1)` every frame,
 * and records frame-to-frame durations.
 */
export function driveFrames(totalMs: number, onFrame: (progress: number) => void): Promise<FrameStats> {
	const deltas: number[] = [];
	return new Promise((resolve, reject) => {
		const start = performance.now();
		let last = start;
		const tick = () => {
			const now = performance.now();
			deltas.push(now - last);
			last = now;
			const elapsed = now - start;
			if (elapsed >= totalMs) {
				resolve(frameStats(deltas.slice(1))); // first delta measures setup, not a frame
				return;
			}
			// an onFrame throw must reject (not escape the rAF callback), or the
			// scenario hangs at "Running…" with only a console error to show for it
			try {
				onFrame(Math.min(elapsed / totalMs, 1));
			} catch (error) {
				reject(error);
				return;
			}
			requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	});
}

function frameStats(deltas: number[]): FrameStats {
	if (deltas.length === 0) {
		return { frames: 0, frameAvgMs: 0, frameP95Ms: 0, frameMaxMs: 0, framesOver16Pct: 0, framesOver33Pct: 0 };
	}
	const sorted = [...deltas].sort((a, b) => a - b);
	const sum = deltas.reduce((a, b) => a + b, 0);
	return {
		frames: deltas.length,
		frameAvgMs: round(sum / deltas.length),
		frameP95Ms: round(sorted[Math.floor(sorted.length * 0.95)] ?? 0),
		frameMaxMs: round(sorted[sorted.length - 1] ?? 0),
		framesOver16Pct: round((deltas.filter((d) => d > 17).length / deltas.length) * 100),
		framesOver33Pct: round((deltas.filter((d) => d > 33).length / deltas.length) * 100)
	};
}

export function round(n: number): number {
	return Math.round(n * 100) / 100;
}

export function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}
