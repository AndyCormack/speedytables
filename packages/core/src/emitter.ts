import type { Slice } from './types';

/** Per-slice subscriptions (ADR-0003): adapters subscribe to exactly what they render. */
export class SliceEmitter {
	#listeners = new Map<Slice, Set<() => void>>();

	subscribe(slice: Slice, listener: () => void): () => void {
		let set = this.#listeners.get(slice);
		if (!set) this.#listeners.set(slice, (set = new Set()));
		set.add(listener);
		return () => set.delete(listener);
	}

	notify(slice: Slice): void {
		this.#listeners.get(slice)?.forEach((listener) => listener());
	}
}
