import type { GridDriver, GridName } from './types';
import { agGridDriver } from './aggrid';
import { speedyDriver } from './speedy';

export type { ColumnSpec, GridDriver, GridName, MountOptions } from './types';

export const drivers: Record<GridName, () => GridDriver> = {
	aggrid: agGridDriver,
	speedy: speedyDriver
};
