import type { AdministratorRole } from '@/features/administrators/enums';
import type { PaginationResponse } from '@/types/api';

import type { TaskType } from '../enums';

export interface LocalizedLabel {
  en: string;
  ko: string;
  ja: string;
  [key: string]: string;
}

export interface WorkerInfo {
  id: number;
  username: string;
  name: string;
  email: string;
  // Not sent by BE yet — the role line stays hidden until it is
  role?: AdministratorRole;
}

export interface ChangedField {
  value: string;
  label: LocalizedLabel;
}

export interface ValueWithLabel {
  value: any;
  label: LocalizedLabel;
}

export interface TaskLogRESP {
  id: number;
  menu: string;
  task_type: TaskType;
  description: string;
  worker: WorkerInfo | null;
  target_menu: string;
  data_identifier: string | number;
  changed_fields: ChangedField[];
  before_values: Record<string, ValueWithLabel> | unknown[];
  after_values: Record<string, ValueWithLabel> | unknown[];
  created_at: string;
  updated_at: string;
  no?: number;
}

export type TaskLogListRESP = PaginationResponse<{
  task_logs: TaskLogRESP[];
}>;

export interface TaskLogFilterOption {
  value: string;
  label?: string;
}

export interface TaskLogSearchFiltersRESP {
  success: boolean;
  message: string;
  data: {
    filters: {
      menu_options: TaskLogFilterOption[];
      task_type_options: TaskLogFilterOption[];
    };
  };
}
