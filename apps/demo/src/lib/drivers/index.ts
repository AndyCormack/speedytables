import type { GridDriver, GridName } from './types';
import { agGridDriver } from './aggrid';

export type { ColumnSpec, GridDriver, GridName, MountOptions } from './types';

export const drivers: Record<GridName, () => GridDriver> = {
	aggrid: agGridDriver,
	speedy: () => {
		throw new Error('SpeedyTables driver lands in M1 (see .wip/plan.md)');
	}
};
