/** Named custom themes, persisted locally (no backend). Shared by the editor and the showcase. */

export interface Draft {
	base: string;
	overrides: Record<string, string>;
	rowHeight: number;
}

export interface SavedTheme extends Draft {
	name: string;
}

const KEY = 'st-editor-saved';

export function listSaved(): SavedTheme[] {
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Draft>;
		return Object.entries(raw).map(([name, draft]) => ({ name, ...draft }));
	} catch {
		return [];
	}
}

export function getSaved(name: string): SavedTheme | null {
	return listSaved().find((t) => t.name === name) ?? null;
}

export function saveTheme(name: string, draft: Draft): void {
	const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Draft>;
	raw[name] = draft;
	localStorage.setItem(KEY, JSON.stringify(raw));
}

export function deleteTheme(name: string): void {
	const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Draft>;
	delete raw[name];
	localStorage.setItem(KEY, JSON.stringify(raw));
}

/** URL-safe draft codec for share links (#d=...). */
export function encodeDraft(draft: Draft): string {
	return btoa(encodeURIComponent(JSON.stringify(draft)))
		.replaceAll('+', '-')
		.replaceAll('/', '_')
		.replaceAll('=', '');
}

export function decodeDraft(encoded: string): Draft | null {
	try {
		const b64 = encoded.replaceAll('-', '+').replaceAll('_', '/');
		const draft = JSON.parse(decodeURIComponent(atob(b64)));
		if (typeof draft.base !== 'string' || typeof draft.overrides !== 'object') return null;
		return { base: draft.base, overrides: draft.overrides ?? {}, rowHeight: draft.rowHeight ?? 32 };
	} catch {
		return null;
	}
}
