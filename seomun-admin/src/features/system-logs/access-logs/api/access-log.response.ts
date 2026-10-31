import type { BaseResponse, PaginationMeta } from '@/types/api';

import type { AccessLogEventType } from '../enums';

export type AccessLogSearchFilterRESP = BaseResponse<{
  filters: {
    event_type_options: {
      value: AccessLogEventType;
      label: string;
    }[];
    ip_address_options: {
      value: string;
      label: string;
    }[];
  };
}>;

export interface AccessLogUserRESP {
  id: number;
  username: string;
  name: string;
  email: string | null;
}

export interface AccessLogRESP {
  id: number;
  login_id: string;
  username: string | null;
  ip_address: string;
  browser_info: string;
  description: string;
  user_id: number | null;
  user_agent: string;
  event_type: AccessLogEventType;
  failure_reason: string | null;
  connection_time: string;
  access_date: string;
  user: AccessLogUserRESP | null;
  created_at: string;
  updated_at: string;
}

export interface AccessLogListRESP extends BaseResponse<{ access_logs: AccessLogRESP[] }> {
  pagination: PaginationMeta;
}

export interface AccessLogExportHistory {
  id: number;
  file_name: string;
  file_path: string;
  status: string;
}

export type AccessLogExportRESP = BaseResponse<{ history: AccessLogExportHistory }>;
