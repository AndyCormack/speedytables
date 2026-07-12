/**
 * Executor seam (ADR-0002): pipeline stages express work as generators that
 * yield at slice points; the executor decides where/how the work runs.
 * M2 ships the time-sliced main-thread executor; the worker executor lands in M5.
 */

/** A unit of pipeline work. Yield frequently (cheap); the executor decides when to actually pause. */
export type Job<T> = Generator<void, T, void>;

export interface Executor {
	run<T>(job: Job<T>, signal?: AbortSignal): Promise<T>;
}

const yieldToBrowser: () => Promise<void> =
	typeof scheduler !== 'undefined' && 'yield' in scheduler
		? () => scheduler.yield()
		: () => new Promise((resolve) => setTimeout(resolve, 0));

declare const scheduler: { yield(): Promise<void> } | undefined;

/**
 * Runs jobs on the main thread in ~`budgetMs` slices, yielding to the browser
 * between slices so no task exceeds the frame budget.
 */
export class MainThreadExecutor implements Executor {
	readonly budgetMs: number;

	constructor(budgetMs = 12) {
		this.budgetMs = budgetMs;
	}

	async run<T>(job: Job<T>, signal?: AbortSignal): Promise<T> {
		let deadline = performance.now() + this.budgetMs;
		for (;;) {
			if (signal?.aborted) throw new DOMException('Job aborted', 'AbortError');
			const step = job.next();
			if (step.done) return step.value;
			if (performance.now() >= deadline) {
				await yieldToBrowser();
				deadline = performance.now() + this.budgetMs;
			}
		}
	}
}
