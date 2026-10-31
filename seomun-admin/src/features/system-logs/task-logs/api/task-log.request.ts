import type { PaginationRequest, SortRequest } from '@/types/api';

import type { TaskLogSortField, TaskType } from '../enums';

export interface TaskLogListRequest extends PaginationRequest, SortRequest<TaskLogSortField> {
  menu?: string;
  worker_name?: string;
  task_type?: TaskType;
  subject_type?: string;
  date_from?: string;
  date_to?: string;
}
