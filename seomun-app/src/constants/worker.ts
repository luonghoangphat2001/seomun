import { TabOption } from '@/components/common';
import { WorkerFilterTab } from '@/enums/worker';

export const WORKER_TAB_OPTIONS: TabOption[] = [
  { label: 'common.entire', value: WorkerFilterTab.ALL },
  { label: 'common.worker', value: WorkerFilterTab.WORKER },
  { label: 'auth.cellphone', value: WorkerFilterTab.CELL_PHONE },
];
