/**
 * Theme editor state (M8 grill): an overrides map layered over a picked base
 * theme, with snapshot undo/redo, localStorage autosave, and share encoding.
 * Base token values arrive from the computed-style probe (set by the page).
 */
import { TOKENS } from '@speedytables/svelte';
import { encodeDraft, type Draft } from './saved';

const DRAFT_KEY = 'st-editor-draft';

export class EditorState {
	base = $state('graphite');
	overrides = $state.raw<Record<string, string>>({});
	rowHeight = $state(32);
	/** Resolved token values of the current base theme (probe-fed). */
	baseValues = $state.raw<Record<string, string>>({});
	baseColorScheme = $state('dark');

	#undo = $state.raw<Draft[]>([]);
	#redo = $state.raw<Draft[]>([]);

	constructor() {
		try {
			const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') as Draft | null;
			if (draft) this.loadDraft(draft);
		} catch {
			/* fresh start */
		}
	}

	get dirty(): boolean {
		return Object.keys(this.overrides).length > 0;
	}

	get canUndo(): boolean {
		return this.#undo.length > 0;
	}

	get canRedo(): boolean {
		return this.#redo.length > 0;
	}

	/** Effective value: override, else base, else manifest default. */
	value(token: string): string {
		return (
			this.overrides[token] ??
			this.baseValues[token] ??
			TOKENS.find((t) => t.name === token)?.default ??
			''
		);
	}

	isOverridden(token: string): boolean {
		return token in this.overrides;
	}

	/** Inline style layering the overrides over the base theme. */
	get styleString(): string {
		return Object.entries(this.overrides)
			.map(([k, v]) => `${k}: ${v}`)
			.join('; ');
	}

	draft(): Draft {
		return { base: this.base, overrides: { ...this.overrides }, rowHeight: this.rowHeight };
	}

	#snapshot(): void {
		this.#undo = [...this.#undo.slice(-49), this.draft()];
		this.#redo = [];
	}

	#autosave(): void {
		localStorage.setItem(DRAFT_KEY, JSON.stringify(this.draft()));
	}

	setToken(token: string, value: string): void {
		this.#snapshot();
		this.overrides = { ...this.overrides, [token]: value };
		this.#autosave();
	}

	clearToken(token: string): void {
		if (!(token in this.overrides)) return;
		this.#snapshot();
		const next = { ...this.overrides };
		delete next[token];
		this.overrides = next;
		this.#autosave();
	}

	setRowHeight(px: number): void {
		this.#snapshot();
		this.rowHeight = Math.max(20, Math.min(64, Math.round(px)));
		this.#autosave();
	}

	/** Base switch keeps overrides (re-layering is a feature; Reset is the clean slate). */
	switchBase(id: string): void {
		if (id === this.base) return;
		this.#snapshot();
		this.base = id;
		this.#autosave();
	}

	reset(): void {
		if (!this.dirty) return;
		this.#snapshot();
		this.overrides = {};
		this.#autosave();
	}

	loadDraft(draft: Draft): void {
		this.base = draft.base;
		this.overrides = { ...draft.overrides };
		this.rowHeight = draft.rowHeight;
		this.#autosave();
	}

	#apply(draft: Draft): void {
		this.base = draft.base;
		this.overrides = draft.overrides;
		this.rowHeight = draft.rowHeight;
		this.#autosave();
	}

	undo(): void {
		const prev = this.#undo.at(-1);
		if (!prev) return;
		this.#undo = this.#undo.slice(0, -1);
		this.#redo = [...this.#redo, this.draft()];
		this.#apply(prev);
	}

	redo(): void {
		const next = this.#redo.at(-1);
		if (!next) return;
		this.#redo = this.#redo.slice(0, -1);
		this.#undo = [...this.#undo, this.draft()];
		this.#apply(next);
	}

	shareHash(): string {
		return `#d=${encodeDraft(this.draft())}`;
	}

	/** Complete CSS export: every token resolved, ready to paste into any app. */
	exportCss(name: string): string {
		const safe = name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-') || 'custom';
		const lines = TOKENS.map((t) => `\t${t.name}: ${this.value(t.name)};`);
		return [
			`/* SpeedyTables theme: ${safe} (base: ${this.base}) */`,
			`/* recommended row height: ${this.rowHeight}px */`,
			`/* usage:`,
			` *   import '@speedytables/svelte/themes/base.css';`,
			` *   <div data-speedy-theme="${safe}"> <Table.Root ... /> </div>`,
			` */`,
			`[data-speedy-theme='${safe}'] {`,
			`\tcolor-scheme: ${this.baseColorScheme};`,
			...lines,
			`}`
		].join('\n');
	}
}
