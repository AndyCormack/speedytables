/** OKLCH parsing and slider-ramp helpers for the theme editor. */

export interface Oklch {
	l: number; // 0..1
	c: number; // 0..~0.4
	h: number; // 0..360
	a: number; // 0..1
}

const OKLCH_RE =
	/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i;

export function parseOklch(value: string): Oklch | null {
	const m = value.trim().match(OKLCH_RE);
	if (!m) return null;
	const num = (raw: string, pct: number) => (raw.endsWith('%') ? parseFloat(raw) / pct : parseFloat(raw));
	return {
		l: num(m[1]!, 100),
		c: parseFloat(m[2]!),
		h: parseFloat(m[3]!),
		a: m[4] ? num(m[4]!, 100) : 1
	};
}

export function formatOklch({ l, c, h, a }: Oklch): string {
	const round = (n: number, p: number) => Math.round(n * 10 ** p) / 10 ** p;
	const base = `${round(l, 3)} ${round(c, 3)} ${round(h, 1)}`;
	return a < 1 ? `oklch(${base} / ${round(a, 2)})` : `oklch(${base})`;
}

/** CSS gradient for a slider track, varying one channel across its range. */
export function channelRamp(color: Oklch, channel: 'l' | 'c' | 'h' | 'a'): string {
	const stops: string[] = [];
	const steps = channel === 'h' ? 12 : 6;
	const max = { l: 1, c: 0.37, h: 360, a: 1 }[channel];
	for (let i = 0; i <= steps; i++) {
		const v = (i / steps) * max;
		const sample = { ...color, [channel]: v };
		stops.push(formatOklch({ ...sample, a: channel === 'a' ? sample.a : 1 }));
	}
	return `linear-gradient(to right, ${stops.join(', ')})`;
}

export const CHANNEL_MAX = { l: 1, c: 0.37, h: 360, a: 1 } as const;
export const CHANNEL_STEP = { l: 0.005, c: 0.002, h: 1, a: 0.01 } as const;
