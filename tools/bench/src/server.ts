/** Preview-server lifecycle shared by the bench runner and smoke tests. */
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';

export const PORT = 4173;
export const BASE = `http://localhost:${PORT}`;

export async function serverUp(): Promise<boolean> {
	try {
		const res = await fetch(BASE, { signal: AbortSignal.timeout(2000) });
		return res.ok;
	} catch {
		return false;
	}
}

export async function startServer(root: string): Promise<ChildProcess | null> {
	if (await serverUp()) {
		console.log(`Reusing server at ${BASE}`);
		return null;
	}
	console.log('Starting preview server…');
	// spawn vite directly: pnpm's `--` forwarding is unreliable and non-strict
	// port fallback would leave us polling a port vite silently abandoned
	const child = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
		cwd: join(root, 'apps', 'demo'),
		shell: true,
		stdio: 'ignore'
	});
	for (let i = 0; i < 60; i++) {
		if (await serverUp()) return child;
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error('Preview server did not come up on ' + BASE);
}

export function stopServer(server: ChildProcess | null): void {
	if (!server) return;
	if (process.platform === 'win32' && server.pid) {
		execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' });
	} else {
		server.kill();
	}
}
