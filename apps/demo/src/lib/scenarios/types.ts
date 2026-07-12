import type { GridDriver } from '$lib/drivers';
import type { SizeKey } from '$lib/dataset';

export interface ScenarioContext {
	driver: GridDriver;
	el: HTMLElement;
	/** Row count resolved from the ?size= param. */
	size: number;
}

export interface Scenario {
	name: string;
	description: string;
	defaultSize: SizeKey;
	/** Generates data, mounts the grid, exercises it. Returns flat named measurements (ms unless suffixed otherwise). */
	run(ctx: ScenarioContext): Promise<Record<string, number>>;
}
