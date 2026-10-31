import type { DashboardPeriod, DashboardStatisticType } from '../enums';

/** Real Operations overview endpoint: only period + customer filter (daily/weekly is a client view toggle). */
export type DashboardOperationsREQ = {
  period: DashboardPeriod;
  customer_ids?: number[];
};

/** Shared filter for the statistics tabs. Each endpoint maps it to its own query params in the service. */
export type DashboardStatisticsFilterREQ = {
  period: DashboardPeriod;
  customer_ids?: number[];
};

export type DashboardStatisticsREQ = DashboardStatisticsFilterREQ & {
  type: DashboardStatisticType;
  /** Only used by the Products tab (top N products / promoted CTR ranking). */
  limit?: number;
  /** Only used by the Customers tab (partial-match filter on sales rep name). */
  sales_representative?: string;
};
