import { BaseResponse } from '@/types';

export type ExportExcelHistoryRESP = {
  id: number;
  user_id: number;
  module: string;
  file_name: string;
  file_path: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | string;
  filters: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ExportExcelProgressStatusRESP = BaseResponse<{
  history: ExportExcelHistoryRESP;
}>;

export type ExportExcelDownloadRESP = Blob;
