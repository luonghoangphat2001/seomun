import { z } from 'zod';

export const settlementReportListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  start_date: z.string().optional().catch(undefined),
  end_date: z.string().optional().catch(undefined),
});

export type SettlementReportListSearch = z.infer<typeof settlementReportListSearchSchema>;

export type SettlementReportSearchFilterValues = {
  start_date?: string;
  end_date?: string;
};
