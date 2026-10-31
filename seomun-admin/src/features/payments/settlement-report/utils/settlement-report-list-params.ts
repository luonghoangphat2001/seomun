import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import type { ReportListREQ } from '../api/settlement-report.request';
import type { SettlementReportListSearch } from '../schemas';

export type NormalizedReportListParams = ReportListREQ & Required<Pick<ReportListREQ, 'page' | 'per_page'>>;

export function buildSettlementReportListParams(search: SettlementReportListSearch): NormalizedReportListParams {
  return {
    start_date: search.start_date,
    end_date: search.end_date,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}
