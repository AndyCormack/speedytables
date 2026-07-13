/**
 * Page-side worker-heap attribution via performance.measureUserAgentSpecificMemory.
 * Requires cross-origin isolation (served by hooks.server.ts + the vite COI
 * plugin) AND real site isolation — works in headed Chrome; headless/automation
 * refuses it, where the bench runner measures over CDP instead. Best-effort:
 * resolves null rather than ever blocking a run.
 */
interface MemoryBreakdown {
	bytes: number;
	breakdown: { bytes: number; attribution: { scope?: string }[] }[];
}

export async function measureWorkerHeapMB(): Promise<number | null> {
	const perf = performance as unknown as {
		measureUserAgentSpecificMemory?: () => Promise<MemoryBreakdown>;
	};
	if (!globalThis.crossOriginIsolated || !perf.measureUserAgentSpecificMemory) return null;
	try {
		let settled = false;
		const measured = perf.measureUserAgentSpecificMemory().then((m) => {
			settled = true;
			return m;
		});
		// the promise resolves at the next GC; churn short-lived allocations to provoke one
		void (async () => {
			for (let i = 0; i < 100 && !settled; i++) {
				void new Array(500_000).fill(i);
				await new Promise((r) => setTimeout(r, 20));
			}
		})();
		const result = await Promise.race([
			measured,
			new Promise<null>((r) => setTimeout(() => r(null), 5000))
		]);
		if (!result) return null;
		const workerBytes = result.breakdown
			.filter((b) => b.attribution.some((a) => a.scope === 'DedicatedWorkerGlobalScope'))
			.reduce((sum, b) => sum + b.bytes, 0);
		return workerBytes > 0 ? Math.round((workerBytes / 1e6) * 100) / 100 : null;
	} catch {
		return null;
	}
}
