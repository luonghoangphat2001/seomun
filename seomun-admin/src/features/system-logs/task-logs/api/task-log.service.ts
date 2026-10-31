import type { TaskLogListRequest } from './task-log.request';
import type { TaskLogListRESP, TaskLogSearchFiltersRESP } from './task-log.response';
import { getTaskLogFiltersAPI, getTaskLogsAPI } from './task-log.api';

export async function getTaskLogList(params: TaskLogListRequest): Promise<TaskLogListRESP> {
  return getTaskLogsAPI(params);
}

export async function getTaskLogFilters(): Promise<TaskLogSearchFiltersRESP> {
  return getTaskLogFiltersAPI();
}
