import { ENDPOINTS } from '@/config/endpoints';

import { DashboardPeriod, DashboardStatisticType } from '../enums';
import {
  exportStaticAPI,
  getCustomerStaticAPI,
  getDashboardOperationsAPI,
  getExportHistoryAPI,
  getInquiryStaticAPI,
  getMembersStaticAPI,
  getOrderStaticAPI,
  getPaymentStaticAPI,
  getProductsStaticAPI,
} from './dashboard.api';
import type { DashboardOperationsREQ, DashboardStatisticsREQ } from './dashboard.request';
import type {
  CustomerStaticRESP,
  DashboardOperationsRESP,
  DashboardStatisticSection,
  DashboardStatisticsExportHistory,
  DashboardStatisticsExportRawRESP,
  DashboardStatisticsRESP,
  InquiryStaticRESP,
  MembersStaticRESP,
  OrderStaticRESP,
  PaymentStaticRESP,
  ProductsStaticRESP,
} from './dashboard.response';

// === Operations ===

export async function getDashboardOperations(params: DashboardOperationsREQ): Promise<DashboardOperationsRESP> {
  const body = await getDashboardOperationsAPI(params);
  // Endpoint nests the real payload under data.data; tolerate a flat data too.
  return body.data?.data ?? (body.data as unknown as DashboardOperationsRESP);
}

// === Statistics export ===

// API inconsistency: order-static returns the history fields flat on `data`; customer-static nests
// them under `data.history`.
function normalizeExportHistory(data: DashboardStatisticsExportRawRESP): DashboardStatisticsExportHistory {
  return 'history' in data ? data.history : data;
}

function statisticRequest({ type, period, customer_ids, limit, sales_representative }: DashboardStatisticsREQ) {
  switch (type) {
    case DashboardStatisticType.MEMBERS:
      return { url: ENDPOINTS.DASHBOARD.STATISTICS_MEMBERS, params: { ...dateRange(period), customer_ids } };
    case DashboardStatisticType.PRODUCTS:
      return { url: ENDPOINTS.DASHBOARD.STATISTICS_PRODUCTS, params: { ...dateRange(period), customer_ids, limit: limit ?? 10 } };
    case DashboardStatisticType.ORDERS:
      return { url: ENDPOINTS.DASHBOARD.STATISTICS_ORDERS, params: { period, customer_ids } };
    case DashboardStatisticType.CUSTOMERS:
      return { url: ENDPOINTS.DASHBOARD.STATISTICS_CUSTOMERS, params: { customer_ids, sales_representative } };
    case DashboardStatisticType.INQUIRIES:
      return { url: ENDPOINTS.DASHBOARD.STATISTICS_INQUIRIES, params: { period, customer_ids } };
    case DashboardStatisticType.PAYMENTS:
      return { url: ENDPOINTS.DASHBOARD.STATISTICS_PAYMENTS, params: { ...dateFromTo(period), customer_ids } };
    default:
      return null;
  }
}

export async function exportDashboardStatistics(request: DashboardStatisticsREQ): Promise<DashboardStatisticsExportHistory> {
  const target = statisticRequest(request);
  if (!target) throw new Error(`No statistics endpoint for type "${request.type}"`);

  const body = await exportStaticAPI(target.url, target.params);
  const history = normalizeExportHistory(body.data);

  // A tab whose endpoint ignores `?export=true` answers with its normal statistics payload, which has
  // no id to poll. Fail here rather than hand back a record the progress dialog can never resolve.
  if (typeof history?.id !== 'number') {
    throw new Error(`Export returned no history record for type "${request.type}"`);
  }

  return history;
}

/** The export runs asynchronously; this is polled until the file is ready to download. */
export async function getExportHistory(historyId: number): Promise<DashboardStatisticsExportHistory> {
  const body = await getExportHistoryAPI(historyId);
  return normalizeExportHistory(body.data);
}

// === Statistics helpers ===

function rate(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0;
}

function dateRange(period: DashboardPeriod) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (period === DashboardPeriod.THIRTY_DAYS ? 30 : 7));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start_date: fmt(start), end_date: fmt(end) };
}

function dateFromTo(period: DashboardPeriod) {
  const { start_date, end_date } = dateRange(period);
  return { date_from: start_date, date_to: end_date };
}

// PHP quirk: an empty associative array serializes as `[]`; populated data serializes as a keyed object.
function toArray<T>(value: T[] | Record<string, T> | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : Object.values(value);
}

function sumByDate(points: { date: string; count: number }[]) {
  const byDate = new Map<string, number>();
  for (const point of points ?? []) byDate.set(point.date, (byDate.get(point.date) ?? 0) + point.count);
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value }));
}

function mergeTrendSeries(series: { key: string; points: { label: string; value: number }[] }[]) {
  const byLabel = new Map<string, Record<string, number | string> & { label: string }>();
  for (const { key, points } of series) {
    for (const point of points) {
      const row = byLabel.get(point.label) ?? { label: point.label };
      row[key] = point.value;
      byLabel.set(point.label, row);
    }
  }
  const keys = series.map((s) => s.key);
  for (const row of byLabel.values()) {
    for (const key of keys) row[key] ??= 0;
  }
  return [...byLabel.values()].sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
}

function sumBy<T>(items: T[], key: (item: T) => string, value: (item: T) => number) {
  const map = new Map<string, number>();
  for (const item of items ?? []) map.set(key(item), (map.get(key(item)) ?? 0) + value(item));
  return map;
}

// === Statistics mappers ===

function mapMembers(d: MembersStaticRESP): DashboardStatisticSection[] {
  const s = d.summary;
  // members_by_level's `level` is an opaque numeric id (not the documented basic/premium/vip enum) and is
  // frequently null, so it isn't human-readable — members_by_path (direct/social_login) is used instead.
  const pathMap = sumBy(
    d.members_by_path ?? [],
    (m) => (typeof m.path === 'string' ? m.path : '-'),
    (m) => m.count,
  );
  const pathTotal = [...pathMap.values()].reduce((a, b) => a + b, 0);

  return [
    {
      id: 'member-growth',
      title: 'New / withdrawn members',
      description: '',
      total: s?.total_new_members?.total ?? 0,
      total_label: { key: 'total_new_accounts', fallback: 'Total new accounts' },
      unit: 'count',
      chart: [],
      breakdown: [
        { label: 'New', value: s?.total_new_members?.total ?? 0 },
        { label: 'Active', value: s?.total_active_members?.total ?? 0 },
        { label: 'Withdrawn', value: s?.total_withdrawn_members?.total ?? 0 },
      ],
      extra_stats: [{ key: 'net_growth', label: 'Net growth', value: s?.net_growth?.total ?? 0, unit: 'count' }],
      multiSeries: {
        keys: [
          { key: 'new', label: 'New', color: '#f97316' },
          { key: 'active', label: 'Active', color: '#10b981' },
          { key: 'withdrawn', label: 'Withdrawn', color: '#ef4444' },
        ],
        rows: mergeTrendSeries([
          { key: 'new', points: sumByDate(d.new_members) },
          { key: 'active', points: sumByDate(d.active_members) },
          { key: 'withdrawn', points: sumByDate(d.withdrawn_members) },
        ]).map((row) => ({ ...row, label: row.label.slice(5) })),
      },
    },
    {
      id: 'member-source',
      title: 'Registration path',
      description: '',
      total: pathTotal,
      total_label: { key: 'total_registrations', fallback: 'Total registrations' },
      unit: 'count',
      chart: [],
      breakdown: [...pathMap.entries()].map(([label, value]) => ({ label, value, rate: rate(value, pathTotal) })),
    },
  ];
}

function mapProducts(d: ProductsStaticRESP): DashboardStatisticSection[] {
  const sold = d.statistics_by_status?.sold;
  const hidden = d.statistics_by_status?.hidden;
  const statusTotal = (sold?.product_count ?? 0) + (hidden?.product_count ?? 0);
  const rankedProducts = [...(d.top_n_products ?? [])].sort((a, b) => b.total_quantity - a.total_quantity);

  return [
    {
      id: 'product-sales',
      title: 'Product sales',
      description: '',
      total: d.summary?.total_revenue?.total_amount ?? 0,
      unit: 'amount_full',
      // Per-product revenue is a ranked snapshot, not a time series — no chart, see 'top-products' below instead.
      chart: [],
      breakdown: [
        { label: 'Sold', value: sold?.product_count ?? 0, rate: rate(sold?.product_count ?? 0, statusTotal) },
        { label: 'Hidden', value: hidden?.product_count ?? 0, rate: rate(hidden?.product_count ?? 0, statusTotal) },
      ],
      extra_stats: [{ key: 'items_sold', label: 'Items sold', value: d.summary?.total_sales?.total ?? 0, unit: 'count' }],
    },
    {
      id: 'top-products',
      title: 'Top products',
      description: '',
      total: rankedProducts[0]?.total_quantity ?? 0,
      total_label: { key: 'best_seller', fallback: 'Best seller' },
      unit: 'units',
      chart: [],
      // Quantity and revenue differ by orders of magnitude, so revenue gets its own axis.
      multiSeries: {
        chartType: 'bar',
        keys: [
          { key: 'quantity', label: 'Quantity', color: '#6366f1', axis: 'left' },
          { key: 'revenue', label: 'Revenue', color: '#f59e0b', axis: 'right' },
        ],
        rows: rankedProducts.map((p) => ({ label: p.name, quantity: p.total_quantity, revenue: p.total_revenue })),
      },
      breakdown: rankedProducts.map((p, index) => ({
        label: `#${index + 1} ${p.name}`,
        value: p.total_quantity,
        stats: [{ key: 'revenue', label: 'Revenue', value: p.total_revenue }],
      })),
    },
    // {
    //   id: 'promoted-clicks',
    //   title: 'Top products & CTR',
    //   description: '',
    //   total: d.summary?.avg_ctr?.total ?? 0,
    //   unit: 'percent',
    //   chart: [],
    //   breakdown: (d.promoted_products_ctr ?? []).map((p) => ({
    //     label: p.name,
    //     value: p.click_count,
    //     rate: p.ctr,
    //     stats: [
    //       { key: 'views', label: 'Views', value: p.view_count },
    //       { key: 'exposures', label: 'Exposures', value: p.exposure_count },
    //     ],
    //   })),
    // },
  ];
}

function toNumber(value: number | string | undefined): number {
  return typeof value === 'string' ? Number(value) || 0 : (value ?? 0);
}

function mapOrder(d: OrderStaticRESP): DashboardStatisticSection[] {
  const daily = d.chart?.daily?.data ?? [];
  const ordersSummary = d.summary?.orders;
  const orderTotal = ordersSummary ? ordersSummary.total : daily.reduce((a, p) => a + (p.total ?? 0), 0);

  // Ranked by sales amount — the section title is "Sales by product", not "most units sold".
  const rankedProducts = [...(d.sales_analytics?.product ?? [])].sort((a, b) => toNumber(b.total_amount) - toNumber(a.total_amount));
  const productTotal = rankedProducts.reduce((sum, p) => sum + toNumber(p.total_amount), 0);
  const rankedUsers = [...(d.sales_analytics?.users ?? [])].sort((a, b) => toNumber(b.total_amount) - toNumber(a.total_amount));

  return [
    {
      id: 'order-volume',
      title: 'Order count and sales',
      description: '',
      total: orderTotal,
      total_label: { key: 'total_orders', fallback: 'Total orders' },
      unit: 'count',
      change_rate: ordersSummary?.change,
      chart: daily.map((p) => ({ label: p.date, value: p.total ?? 0 })),
      // Only ratios are available (no absolute counts per status), so value is left undefined.
      // Sorted by rate so the dominant status surfaces first among the ~19 possible statuses.
      breakdown: Object.entries(d.ratios_order_status ?? {})
        .map(([label, pct]) => ({ label, rate: Math.round(pct * 10) / 10 }))
        .sort((a, b) => b.rate - a.rate),
      extra_stats: [
        { key: 'items_sold', label: 'Items sold', value: toNumber(d.summary?.sales?.total), unit: 'count' },
        { key: 'cancelled_returned', label: 'Canceled/Returned', value: toNumber(d.summary?.cancellations_returns?.total), unit: 'count' },
      ],
    },
    {
      id: 'order-products',
      title: 'Sales by product & customer',
      description: '',
      total: productTotal,
      total_label: { key: 'total_sales_amount', fallback: 'Total sales amount' },
      unit: 'amount_full',
      chart: [],
      breakdown: [
        ...rankedProducts.map((p, index) => ({
          label: `#${index + 1} ${p.name}`,
          value: toNumber(p.total_amount),
          stats: [{ key: 'quantity', label: 'Quantity', value: toNumber(p.total_quantity) }],
          group: 'Product',
        })),
        ...rankedUsers.map((u, index) => ({
          label: `#${index + 1} ${u.name}`,
          value: toNumber(u.total_amount),
          stats: [{ key: 'quantity', label: 'Quantity', value: toNumber(u.total_quantity) }],
          group: 'Customer',
        })),
      ],
    },
  ];
}

function mapCustomer(d: CustomerStaticRESP): DashboardStatisticSection[] {
  const activity = d.customer_activity_status ?? {};
  const reps = d.sales_by_representative ?? [];
  const repTotal = reps.reduce((a, r) => a + r.total_sales, 0);
  const topCustomers = [...(d.customer_details ?? [])].sort((a, b) => b.cumulative_sales - a.cumulative_sales).slice(0, 8);

  return [
    {
      id: 'customer-sales',
      title: 'Customer activity',
      description: '',
      total: d.summary?.total_customers?.value ?? 0,
      unit: 'count',
      change_rate: d.summary?.new_customers?.change,
      chart: topCustomers.map((c) => ({ label: c.customer_name, value: c.cumulative_sales })),
      // Raw keys on purpose — translated client-side so EN/KO stays consistent (API labels are mixed-language).
      breakdown: (['active', 'new', 'inactive', 'dormant'] as const).map((k) => ({
        label: k,
        value: activity[k]?.value ?? 0,
        rate: activity[k]?.percentage ?? 0,
      })),
    },
    {
      id: 'sales-representative',
      title: 'Sales representative',
      description: '',
      total: repTotal,
      unit: 'amount_full',
      chart: reps.map((r) => ({ label: r.representative, value: r.total_sales })),
      breakdown: reps.map((r) => ({ label: r.representative, value: r.total_sales, rate: rate(r.total_sales, repTotal) })),
    },
  ];
}

function mapInquiry(d: InquiryStaticRESP): DashboardStatisticSection[] {
  const total = d.total_inquiries ?? d.summary?.total_inquiries?.value ?? 0;

  return [
    {
      id: 'inquiry-type',
      title: 'Inquiry type',
      description: '',
      total,
      total_label: { key: 'total_inquiries', fallback: 'Total inquiries' },
      unit: 'count',
      chart: [],
      breakdown: (d.by_inquiry_type ?? []).map((x) => ({ label: x.label ?? x.type, value: x.count, rate: rate(x.count, total) })),
      extra_stats: [{ key: 'unassigned', label: 'Unassigned', value: d.summary?.unassigned?.value ?? 0, unit: 'count' }],
    },
    {
      id: 'inquiry-owner',
      title: 'Processing status',
      description: '',
      total: d.summary?.resolution_rate?.value ?? 0,
      total_label: { key: 'resolution_rate', fallback: 'Resolution rate' },
      unit: 'percent',
      // by_person_in_charge has no time axis (just per-owner case counts), so a line chart of it isn't
      // meaningful — the section shows total + breakdown only, same as inquiry-type.
      chart: [],
      breakdown: (d.by_processing_status ?? []).map((x) => ({ label: x.label ?? x.status, value: x.count, rate: rate(x.count, total) })),
      extra_stats: [{ key: 'avg_processing_time', label: 'Avg. processing time', value: d.summary?.avg_processing_time?.value ?? 0, unit: 'h' }],
    },
  ];
}

function mapPayment(d: PaymentStaticRESP): DashboardStatisticSection[] {
  const methodRows = toArray(d.sales_statistics);
  const methodTotal = methodRows.reduce((sum, row) => sum + row.total_amount, 0);

  const statusEntries = (['successful', 'failed', 'refunded'] as const).flatMap((key) => {
    const stat = d.payment_status_statistics?.[key];
    return stat ? [{ key, stat }] : [];
  });
  const statusTotal = statusEntries.reduce((sum, { stat }) => sum + stat.count, 0);

  return [
    {
      id: 'payment-revenue',
      title: 'Payment revenue',
      description: '',
      total: methodTotal,
      total_label: { key: 'total_sales_amount', fallback: 'Total sales amount' },
      unit: 'amount_full',
      // Every transaction settles by bank transfer, so a per-method split would always be one 100% row.
      chart: [],
      breakdown: [],
    },
    {
      id: 'payment-result',
      title: 'Payment success / failure',
      description: '',
      total: statusTotal,
      total_label: { key: 'total_transactions', fallback: 'Total transactions' },
      unit: 'count',
      chart: [],
      breakdown: statusEntries.map(({ key, stat }) => ({
        label: key === 'successful' ? 'success' : key,
        value: stat.count,
        rate: rate(stat.count, statusTotal),
      })),
    },
  ];
}

// === Statistics dispatch ===

export async function getDashboardStatistics({
  type,
  period,
  customer_ids,
  limit,
  sales_representative,
}: DashboardStatisticsREQ): Promise<DashboardStatisticsRESP> {
  switch (type) {
    case DashboardStatisticType.MEMBERS: {
      const { data } = await getMembersStaticAPI({ ...dateRange(period), customer_ids });
      return { sections: mapMembers(data) };
    }
    case DashboardStatisticType.PRODUCTS: {
      const { data } = await getProductsStaticAPI({ ...dateRange(period), customer_ids, limit: limit ?? 10 });
      return { sections: mapProducts(data) };
    }
    case DashboardStatisticType.ORDERS: {
      const { data } = await getOrderStaticAPI({ period, customer_ids });
      return { sections: mapOrder(data) };
    }
    case DashboardStatisticType.CUSTOMERS: {
      const { data } = await getCustomerStaticAPI({ customer_ids, sales_representative });
      return { sections: mapCustomer(data) };
    }
    case DashboardStatisticType.INQUIRIES: {
      const { data } = await getInquiryStaticAPI({ period, customer_ids });
      return { sections: mapInquiry(data) };
    }
    case DashboardStatisticType.PAYMENTS: {
      const { data } = await getPaymentStaticAPI({ ...dateFromTo(period), customer_ids });
      return { sections: mapPayment(data) };
    }
    default:
      return { sections: [] };
  }
}
