import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import { SortOrder } from '@/enums';
import type { TaskLogListRequest } from '../api';
import { TaskLogSortField } from '../enums';
import type { TaskLogListSearch } from '../schemas';

export type NormalizedTaskLogListParams = TaskLogListRequest & Required<Pick<TaskLogListRequest, 'page' | 'per_page'>>;

export function normalizeTaskLogQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildTaskLogListParams(search: TaskLogListSearch): NormalizedTaskLogListParams {
  return {
    menu: normalizeTaskLogQuery(search.menu),
    worker_name: normalizeTaskLogQuery(search.operator),
    task_type: search.task_type,
    sort_by: search.sort_by,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.DESC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

const TASK_LOG_SORT_FIELD_VALUES = new Set<string>(Object.values(TaskLogSortField));

export function isTaskLogSortField(value: string): value is TaskLogSortField {
  return TASK_LOG_SORT_FIELD_VALUES.has(value);
}
