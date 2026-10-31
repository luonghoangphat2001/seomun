import type { PaginationRequest } from '@/types/api';

export interface ReportListREQ extends PaginationRequest {
  start_date?: string;
  end_date?: string;
}

export interface ReportExportExcelREQ {
  start_date?: string;
  end_date?: string;
}
