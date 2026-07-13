<script lang="ts">
	import type { ColumnDef } from '@speedytables/core';
	import { getTableContext } from './context';

	let { column }: { column: ColumnDef } = $props();

	const view = getTableContext();
	const uid = $props.id();
	const panelId = `${uid}-colmenu`;

	let trigger = $state<HTMLElement>();
	let panel = $state<HTMLElement>();

	// top-layer popover, same pattern as the enum filter panel; toggle fires a task
	// after the popover paints, so hide at beforetoggle and reveal once placed
	function position(e: ToggleEvent) {
		if (!panel || !trigger || e.newState !== 'open') return;
		if (e.type === 'beforetoggle') {
			panel.style.visibility = 'hidden';
			return;
		}
		const rect = trigger.getBoundingClientRect();
		panel.style.position = 'fixed';
		panel.style.margin = '0';
		panel.style.left = `${Math.max(8, Math.min(rect.right - 160, window.innerWidth - panel.offsetWidth - 8))}px`;
		panel.style.top = `${rect.bottom + 4}px`;
		panel.style.visibility = 'visible';
	}
</script>

<button
	type="button"
	data-speedy-colmenu-trigger
	class={view.classes.menuTrigger}
	aria-label="Column menu: {column.header ?? column.id}"
	popovertarget={panelId}
	bind:this={trigger}
>
	⋮
</button>
<div
	id={panelId}
	popover="auto"
	data-speedy-menu-panel
	class={view.classes.menuPanel}
	bind:this={panel}
	onbeforetoggle={position}
	ontoggle={position}
>
	<button
		type="button"
		data-speedy-menu-item
		class={view.classes.menuItem}
		onclick={() => {
			panel?.hidePopover();
			view.setColumnVisible(column.id, false);
		}}
	>
		Hide column
	</button>
	{#if view.hiddenCount > 0}
		<button
			type="button"
			data-speedy-menu-item
			class={view.classes.menuItem}
			onclick={() => {
				panel?.hidePopover();
				view.showAllColumns();
			}}
		>
			Show all columns ({view.hiddenCount} hidden)
		</button>
	{/if}
</div>
