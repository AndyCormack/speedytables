/**
 * tailwind — the utility-class theme (ADR-0005): a part-class preset consumers
 * spread into <Table.Root classes={tailwindTheme}> and edit per part with their
 * own palette. Standalone: do NOT combine with data-speedy-theme/base.css —
 * structure and skin both live in these class strings. Because this pairs with
 * a utilities-only Tailwind entry (no preflight), the preset resets native
 * button/input chrome itself (border-0, [font:inherit]).
 *
 * Tailwind must see this file to generate the utilities: add
 *   @source "../node_modules/@speedytables/svelte/src/themes/tailwind.ts";
 * (or your workspace-relative equivalent) to your Tailwind CSS entry.
 */
import type { PartClasses } from '../parts';

export const tailwindTheme: PartClasses = {
	root: 'rounded-lg border border-zinc-800 bg-zinc-950 text-[13px] text-zinc-100 [color-scheme:dark]',
	header: 'border-b border-zinc-800 bg-zinc-900',
	headerCell: 'group relative',
	headerTop: 'flex items-center',
	headerLabel:
		'flex min-w-0 flex-1 cursor-pointer items-center gap-1 border-0 bg-transparent px-2.5 text-left leading-[30px] font-semibold text-zinc-100 transition-colors [font:inherit] font-semibold hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400/50',
	sortIndicator: 'text-[9px] text-sky-400',
	headerFilter: 'flex min-h-[30px] items-center gap-1 px-1.5 pb-1.5',
	filterContains: 'relative flex w-full min-w-0',
	filterRange: 'flex w-full min-w-0 gap-1',
	filterInput:
		'h-6 w-full min-w-0 appearance-none rounded-md border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-100 transition-colors [font:inherit] text-xs placeholder:text-zinc-500 hover:border-sky-400 focus-visible:border-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40',
	filterClear:
		'absolute top-1/2 right-1 grid h-4 w-4 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[13px] leading-none text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100',
	enumTrigger:
		'flex h-6 w-full min-w-0 cursor-pointer items-center justify-between gap-1.5 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-left text-xs text-zinc-100 transition-colors [font:inherit] text-xs hover:border-sky-400 focus-visible:border-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 data-active:border-sky-400 data-active:bg-sky-950',
	enumPanel:
		'max-h-70 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-1 text-xs text-zinc-100 shadow-xl shadow-black/40',
	enumOption:
		'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 whitespace-nowrap hover:bg-zinc-800 [&_input]:accent-sky-400',
	enumReset:
		'cursor-pointer rounded-sm border-0 bg-transparent px-1 py-0.5 text-[11px] text-sky-400 [font:inherit] text-[11px] hover:bg-sky-950 disabled:cursor-default disabled:text-zinc-600',
	menuTrigger:
		'mr-1.5 h-6 w-5 flex-none cursor-pointer rounded-md border-0 bg-transparent text-zinc-400 opacity-0 transition-opacity [font:inherit] group-hover:opacity-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:opacity-100',
	menuPanel:
		'rounded-lg border border-zinc-700 bg-zinc-900 p-1 text-xs text-zinc-100 shadow-xl shadow-black/40',
	menuItem:
		'flex w-full cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1 text-left whitespace-nowrap [font:inherit] text-xs text-zinc-100 hover:bg-zinc-800',
	resizeHandle:
		'absolute top-0 right-0 h-full w-[7px] cursor-col-resize touch-none hover:bg-gradient-to-r hover:from-transparent hover:from-[4px] hover:to-sky-400 hover:to-[4px]',
	row: 'border-b border-zinc-800/60 bg-zinc-950 data-[parity=odd]:bg-zinc-900/40 hover:bg-zinc-800/60 data-[parity=odd]:hover:bg-zinc-800/60',
	cell: 'flex items-center px-2.5 data-[dtype=number]:justify-end data-[dtype=number]:tabular-nums'
};
