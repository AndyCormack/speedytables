/**
 * Named stylable parts (ADR-0005): every part is addressable by its
 * data-speedy-* attribute (CSS) and by the `classes` map on Table.Root
 * (utility classes / Tailwind). Class strings are static — applied once at
 * element creation, never per frame.
 */
export type Part =
	| 'root'
	| 'header'
	| 'headerCell'
	| 'headerLabel'
	| 'sortIndicator'
	| 'headerFilter'
	| 'filterInput'
	| 'filterClear'
	| 'enumTrigger'
	| 'enumPanel'
	| 'enumOption'
	| 'enumReset'
	| 'menuTrigger'
	| 'menuPanel'
	| 'menuItem'
	| 'resizeHandle'
	| 'viewport'
	| 'canvas'
	| 'rows'
	| 'row'
	| 'cell';

export type PartClasses = Partial<Record<Part, string>>;
