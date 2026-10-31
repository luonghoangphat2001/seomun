import { z } from 'zod';

import { SortOrder } from '@/enums';

import { TaskLogSortField, TaskType } from '../enums';

export const taskLogListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(TaskLogSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  menu: z.coerce.string().optional().catch(undefined),
  operator: z.coerce.string().optional().catch(undefined),
  task_type: z.enum(TaskType).optional().catch(undefined),
  date_from: z.string().date().optional().catch(undefined),
  date_to: z.string().date().optional().catch(undefined),
});

export type TaskLogListSearch = z.infer<typeof taskLogListSearchSchema>;
export type TaskLogSearchFilterValues = {
  menu: string;
  operator: string;
  task_type?: TaskLogListSearch['task_type'];
  date_from: Date | null;
  date_to: Date | null;
};

export const EMPTY_TASK_LOG_SEARCH_FILTER_VALUES: TaskLogSearchFilterValues = {
  menu: '',
  operator: '',
  task_type: undefined,
  date_from: null,
  date_to: null,
};
