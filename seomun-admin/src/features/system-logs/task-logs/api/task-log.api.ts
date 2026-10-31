import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { TaskLogListRequest } from './task-log.request';
import type { TaskLogListRESP, TaskLogSearchFiltersRESP } from './task-log.response';

export function getTaskLogsAPI(params: TaskLogListRequest): Promise<TaskLogListRESP> {
  return api.get(ENDPOINTS.SYSTEM_LOGS.TASK_LIST, { params });
}

export function getTaskLogFiltersAPI(): Promise<TaskLogSearchFiltersRESP> {
  return api.get(ENDPOINTS.SYSTEM_LOGS.TASK_SEARCH_FILTERS);
}
