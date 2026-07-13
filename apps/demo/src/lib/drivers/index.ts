import type { DriverOptions, GridDriver, GridName } from './types';
import { agGridDriver } from './aggrid';
import { speedyDriver } from './speedy';

export type { ColumnSpec, DriverOptions, GridDriver, GridName, MountOptions } from './types';

export const drivers: Record<GridName, (options?: DriverOptions) => GridDriver> = {
	aggrid: agGridDriver,
	speedy: speedyDriver
};
