import type { BaseResponse } from '@/types/api';

export type DashboardCustomerOption = {
  id: string;
  name: string;
  manager: string;
};

export type DashboardTrendPoint = {
  label: string;
  value: number;
};

export type DashboardSummaryMetric = {
  key: string;
  label: string;
  value: number;
  unit?: string;
  change_rate: number;
  trend: DashboardTrendPoint[];
};

export type DashboardNotification = {
  id: string;
  title: string;
  description: string;
  count: number;
  severity: 'info' | 'warning' | 'critical';
};

export type DashboardStatusBreakdown = {
  label: string;
  value?: number;
  // Omit when the items aren't mutually exclusive shares of a whole (e.g. a member can be both
  // "new" and "active" in the same period) — a percentage would be misleading there.
  rate?: number;
  /** Small supplementary numbers shown next to the row (e.g. views, impressions). */
  stats?: { key: string; label: string; value: number }[];
  /** Groups rows under a header when this differs from the previous row's group (e.g. "Product" vs "Customer"). */
  group?: string;
};

// === Real Operations overview endpoint (GET /admin/dashboard/overview/operation) ===

export type OperationMetricUnit = 'amount' | 'count' | (string & {});

export type OperationMetricValue = {
  label: string;
  current: number;
  previous: number;
  change: number;
  unit: OperationMetricUnit;
};

export type OperationPaymentMetrics = {
  success: OperationMetricValue;
  outstanding: { label: string; current: number; unit: string };
  rate: { label: string; current: number; unit: string };
};

export type OperationMetrics = {
  sales: OperationMetricValue;
  members: OperationMetricValue;
  orders: OperationMetricValue;
  payments: OperationPaymentMetrics;
  reviews: OperationMetricValue;
};

export type OperationNotificationsHot = {
  customer_unapproved: number;
  inquiries_in_progress: number;
  product_out_stock_total: number;
};

export type OperationGraphMetricKey = 'sales' | 'members' | 'orders' | 'payments' | 'reviews';

export type OperationGraphPoint = {
  date: string;
  week?: number;
  total: number;
  total_amount?: number;
};

export type OperationDailyMetric = {
  // API inconsistency: `data` is sometimes a date-keyed object instead of an array (varies by metric/day).
  data: OperationGraphPoint[] | Record<string, OperationGraphPoint>;
  total: number;
  total_amount?: number;
};

export type OperationGraphData = {
  // weekly buckets are wrapped the same way as daily (`{data, total, total_amount}`), not raw arrays.
  daily: Record<OperationGraphMetricKey, OperationDailyMetric>;
  weekly: Record<OperationGraphMetricKey, OperationDailyMetric>;
};

export type DashboardOperationsRESP = {
  metric: OperationMetrics;
  notifications_hot: OperationNotificationsHot;
  graph_data: OperationGraphData;
};

export type DashboardStatisticSection = {
  id: string;
  title: string;
  description: string;
  total: number;
  /** Label above the total number; falls back to a generic "Total" when omitted. */
  total_label?: { key: string; fallback: string };
  unit?: string;
  change_rate?: number;
  chart: DashboardTrendPoint[];
  breakdown: DashboardStatusBreakdown[];
  /** Small supplementary numbers shown as badges next to the total (e.g. items sold, cancellations). */
  extra_stats?: { key: string; label: string; value: number; unit?: string }[];
  /** When set, rendered instead of `chart` (e.g. new/active/withdrawn per day, or quantity vs revenue per product). */
  multiSeries?: {
    /** `line` for time series; `bar` for ranked categories, which a line would imply a trend across. */
    chartType?: 'line' | 'bar';
    /** `right` moves the series to a second Y axis — needed when two series differ by orders of magnitude. */
    keys: { key: string; label: string; color: string; axis?: 'left' | 'right' }[];
    rows: (Record<string, number | string> & { label: string })[];
  };
};

/** View model rendered by StatisticsContent; the service maps each real endpoint into sections. */
export type DashboardStatisticsRESP = {
  sections: DashboardStatisticSection[];
};

// === Statistics endpoints (real, under /admin/dashboard/statics) ===

type StatTotal = { total: number; total_amount?: number; unit?: string };
type StatSummaryValue = { value: number; label?: string; unit?: string; description?: string; change?: number };

type MemberDatePoint = { customer_id: number | null; customer_name: string | null; date: string; count: number };
// level is a numeric membership-level id in practice (not the documented basic/premium/vip enum) and is
// frequently null — not human-readable on its own, so it's kept loosely typed and unused for now.
type MemberLevelPoint = { customer_id: number | null; customer_name: string | null; level: number | string | null; count: number };
type MemberPathPoint = { customer_id: number | null; customer_name: string | null; path: string | null; count: number };

export type MembersStaticRESP = {
  new_members: MemberDatePoint[];
  withdrawn_members: MemberDatePoint[];
  active_members: MemberDatePoint[];
  members_by_level: MemberLevelPoint[];
  members_by_path: MemberPathPoint[];
  summary: {
    total_new_members: StatTotal;
    total_withdrawn_members: StatTotal;
    total_active_members: StatTotal;
    total_members: StatTotal;
    avg_new_members_per_day: StatTotal;
    avg_withdrawn_members_per_day: StatTotal;
    avg_active_members_per_day: StatTotal;
    net_growth: StatTotal;
  };
};

type ProductSalesRow = { product_id: number; name: string; total_quantity: number; total_revenue: number; unit?: string };
type ProductStatusStat = { product_count: number; total_quantity: number; total_revenue: number; avg_price: number };
type ProductCtrRow = {
  product_id: number;
  name: string;
  view_count: number;
  exposure_count: number;
  click_count: number;
  ctr: number;
  unit?: string;
};

export type ProductsStaticRESP = {
  sales_volume: ProductSalesRow[];
  top_n_products: (ProductSalesRow & { rank: number })[];
  promoted_products_ctr: ProductCtrRow[];
  statistics_by_status: Record<'sold' | 'hidden', ProductStatusStat>;
  summary: {
    total_products: StatTotal;
    active_products: StatTotal;
    best_seller: { total: number; total_amount: number; product_name: string; unit?: string };
    avg_ctr: StatTotal;
    hidden_sold_out: StatTotal;
    total_sales: StatTotal;
    total_revenue: StatTotal;
  };
};

type OrderChartBucket = { data: { date: string; week?: number; total: number; total_amount?: number }[]; total_amount?: number };
// total_amount is sometimes a numeric string ("53130.00") and sometimes a number (0) depending on the row.
type OrderSummaryStat = { total: number; total_amount: number | string; change?: number; unit?: string };
type OrderAnalyticsRow = { id: number; name: string; total_quantity: number | string; total_amount: number | string };

export type OrderStaticRESP = {
  summary?: {
    orders: OrderSummaryStat;
    sales: OrderSummaryStat;
    cancellations_returns: OrderSummaryStat;
  };
  sales_analytics?: {
    product: OrderAnalyticsRow[];
    category: OrderAnalyticsRow[];
    users: OrderAnalyticsRow[];
  };
  ratios_order_status: Record<string, number>;
  chart: { daily: OrderChartBucket; weekly: OrderChartBucket };
};

type CustomerDetailRow = {
  customer_id: number;
  customer_name: string;
  status: 'active' | 'inactive' | 'new' | 'dormant' | (string & {});
  orders: number;
  cumulative_sales: number;
  aov: number;
  sales_rep?: string;
  last_order?: string;
};

export type CustomerStaticRESP = {
  summary: {
    total_customers: StatSummaryValue;
    new_customers: StatSummaryValue;
    active_rate: StatSummaryValue;
    avg_ltv: StatSummaryValue;
  };
  sales_by_representative: { representative: string; total_sales: number; total_orders: number }[];
  // `dormant` (and in principle any status) can be entirely absent when no customer has that status,
  // not just zero-valued — so every key here is optional.
  customer_activity_status: Partial<Record<'active' | 'new' | 'inactive' | 'dormant', { value: number; percentage: number; label?: string }>>;
  customer_details: CustomerDetailRow[];
};

export type InquiryStaticRESP = {
  total_inquiries: number;
  summary: {
    total_inquiries: StatSummaryValue;
    resolution_rate: StatSummaryValue;
    avg_processing_time: StatSummaryValue;
    unassigned: StatSummaryValue;
  };
  by_inquiry_type: { type: string; label: string; count: number }[];
  by_processing_status: { status: string; label: string; count: number }[];
  by_person_in_charge: { person_in_charge: { id: number; name: string; email?: string }; cases_processed: number; avg_processing_time: number }[];
};

type PaymentStatusStat = { count: number; amount: number; percentage_count: number; percentage_amount: number };

type PaymentMethodStat = {
  payment_method: string;
  payment_method_label?: string;
  total_count: number;
  successful_count: number;
  failed_count: number;
  refunded_count: number;
  successful_amount: number;
  failed_amount: number;
  refunded_amount: number;
  total_amount: number;
  amount_percentage: number;
};

export type PaymentStaticRESP = {
  start_date: string;
  end_date: string;
  sales_statistics: PaymentMethodStat[] | Record<string, PaymentMethodStat>;
  payment_status_statistics: {
    successful: PaymentStatusStat;
    failed: PaymentStatusStat;
    refunded: PaymentStatusStat;
  };
};

export type DashboardStatisticsExportHistory = {
  id: number;
  file_name: string;
  file_path: string;
  status: string;
  created_at: string;
};

// `?export=true` on order-static / customer-static returns this instead of the normal data payload.
// API inconsistency: order-static returns the history fields flat on `data`; customer-static nests
// them under `data.history`.
export type DashboardStatisticsExportRawRESP = DashboardStatisticsExportHistory | { history: DashboardStatisticsExportHistory };

// Endpoint double-nests the payload under data.data.
export type DashboardOperationsBaseRESP = BaseResponse<{ data: DashboardOperationsRESP }>;
