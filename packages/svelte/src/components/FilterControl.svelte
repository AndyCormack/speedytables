<script lang="ts">
	import type { ColumnDef } from '@speedytables/core';
	import { getTableContext } from './context';
	import { filterKind } from './filter-kind';

	let { column }: { column: ColumnDef } = $props();

	const view = getTableContext();
	const uid = $props.id();
	const panelId = `${uid}-enum`;

	let trigger = $state<HTMLElement>();
	let panel = $state<HTMLElement>();

	const kind = $derived(filterKind(column));

	// The enum panel uses the native Popover API: it renders in the top layer, so
	// no overflow/stacking context in the grid can clip it, and light-dismiss +
	// Esc come for free. Position is anchored to the trigger on open.
	function positionPanel(open: boolean) {
		if (!open || !panel || !trigger) return;
		const rect = trigger.getBoundingClientRect();
		panel.style.position = 'fixed';
		panel.style.margin = '0';
		panel.style.minWidth = `${Math.max(rect.width, 160)}px`;
		panel.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - panel.offsetWidth - 8))}px`;
		panel.style.top = `${rect.bottom + 4}px`;
	}

	function toggleValue(value: string, checked: boolean) {
		const current = view.inValues(column.id) ?? [];
		view.setIn(column.id, checked ? [...current, value] : current.filter((v) => v !== value));
	}

	function parseBound(raw: string): number | undefined {
		if (raw.trim() === '') return undefined;
		const n = Number(raw);
		return Number.isNaN(n) ? undefined : n;
	}

	function onRangeInput(event: Event) {
		const cellEl = (event.currentTarget as HTMLElement).closest('[data-speedy-header-filter]');
		const inputs = cellEl?.querySelectorAll('input');
		view.setRange(
			column.id,
			parseBound(inputs?.item(0)?.value ?? ''),
			parseBound(inputs?.item(1)?.value ?? '')
		);
	}
</script>

{#if kind === 'enum'}
	{@const selected = view.inValues(column.id)}
	<button
		type="button"
		data-speedy-enum-trigger
		class={view.classes.enumTrigger}
		data-active={selected ? '' : undefined}
		aria-label="Filter {column.header ?? column.id}"
		popovertarget={panelId}
		bind:this={trigger}
	>
		<span>{selected ? `${selected.length} of ${column.filterValues?.length ?? 0}` : 'All'}</span>
		<span data-speedy-enum-chevron aria-hidden="true"></span>
	</button>
	<div
		id={panelId}
		popover="auto"
		data-speedy-enum-panel
		class={view.classes.enumPanel}
		bind:this={panel}
		ontoggle={(e) => positionPanel(e.newState === 'open')}
	>
		<div data-speedy-enum-head>
			<span>{column.header ?? column.id}</span>
			<button
				type="button"
				data-speedy-enum-reset
				class={view.classes.enumReset}
				disabled={!selected}
				onclick={() => view.setIn(column.id, null)}
			>
				Reset
			</button>
		</div>
		{#each column.filterValues ?? [] as value (value)}
			{@const checked = view.inValues(column.id)?.includes(value) ?? false}
			<label data-speedy-enum-option class={view.classes.enumOption}>
				<input type="checkbox" {checked} onchange={(e) => toggleValue(value, e.currentTarget.checked)} />
				<span>{value}</span>
			</label>
		{/each}
	</div>
{:else if kind === 'range'}
	{@const range = view.rangeValue(column.id)}
	<div data-speedy-range data-active={range ? '' : undefined}>
		<input
			data-speedy-filter-input
			class={view.classes.filterInput}
			type="number"
			inputmode="decimal"
			placeholder="Min"
			aria-label="Minimum {column.header ?? column.id}"
			value={range?.min ?? ''}
			oninput={onRangeInput}
		/>
		<input
			data-speedy-filter-input
			class={view.classes.filterInput}
			type="number"
			inputmode="decimal"
			placeholder="Max"
			aria-label="Maximum {column.header ?? column.id}"
			value={range?.max ?? ''}
			oninput={onRangeInput}
		/>
	</div>
{:else if kind === 'text'}
	{@const value = view.containsValue(column.id)}
	<div data-speedy-contains data-active={value !== '' ? '' : undefined} style="position:relative;">
		<input
			data-speedy-filter-input
			class={view.classes.filterInput}
			type="text"
			placeholder="Filter…"
			aria-label="Filter {column.header ?? column.id}"
			{value}
			oninput={(e) => view.setContains(column.id, e.currentTarget.value)}
		/>
		{#if value !== ''}
			<button
				type="button"
				data-speedy-filter-clear
				class={view.classes.filterClear}
				aria-label="Clear {column.header ?? column.id} filter"
				onclick={() => view.setContains(column.id, '')}
			>
				×
			</button>
		{/if}
	</div>
{/if}
