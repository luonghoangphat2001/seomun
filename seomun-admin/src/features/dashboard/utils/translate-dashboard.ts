import type { TFunction } from 'i18next';

const TREND_LABEL_KEYS: Record<string, string> = {
  Mon: 'page.dashboard.trend_labels.mon',
  Tue: 'page.dashboard.trend_labels.tue',
  Wed: 'page.dashboard.trend_labels.wed',
  Thu: 'page.dashboard.trend_labels.thu',
  Fri: 'page.dashboard.trend_labels.fri',
  Sat: 'page.dashboard.trend_labels.sat',
  Sun: 'page.dashboard.trend_labels.sun',
  W1: 'page.dashboard.trend_labels.w1',
  W2: 'page.dashboard.trend_labels.w2',
  W3: 'page.dashboard.trend_labels.w3',
  W4: 'page.dashboard.trend_labels.w4',
  W5: 'page.dashboard.trend_labels.w5',
  W6: 'page.dashboard.trend_labels.w6',
  W7: 'page.dashboard.trend_labels.w7',
  W8: 'page.dashboard.trend_labels.w8',
};

const BREAKDOWN_LABEL_KEYS: Record<string, string> = {
  Paid: 'page.dashboard.breakdown.paid',
  Producing: 'page.dashboard.breakdown.producing',
  Shipping: 'page.dashboard.breakdown.shipping',
  'Canceled/Returned': 'page.dashboard.breakdown.canceled_returned',
  New: 'page.dashboard.breakdown.new',
  Active: 'page.dashboard.breakdown.active',
  Withdrawn: 'page.dashboard.breakdown.withdrawn',
  'Direct signup': 'page.dashboard.breakdown.direct_signup',
  'Customer invitation': 'page.dashboard.breakdown.customer_invitation',
  'Manager registration': 'page.dashboard.breakdown.manager_registration',
  Completed: 'page.dashboard.breakdown.completed',
  'In production': 'page.dashboard.breakdown.in_production',
  Canceled: 'page.dashboard.breakdown.canceled',
  Returned: 'page.dashboard.breakdown.returned',
  'Business cards': 'page.dashboard.breakdown.business_cards',
  Leaflets: 'page.dashboard.breakdown.leaflets',
  Banners: 'page.dashboard.breakdown.banners',
  Stickers: 'page.dashboard.breakdown.stickers',
  Card: 'page.dashboard.breakdown.card',
  'Tax invoice': 'page.dashboard.breakdown.tax_invoice',
  Postpaid: 'page.dashboard.breakdown.postpaid',
  Success: 'page.dashboard.breakdown.success',
  Failed: 'page.dashboard.breakdown.failed',
  'Top 10': 'page.dashboard.breakdown.top_10',
  'Top 30': 'page.dashboard.breakdown.top_30',
  'Long tail': 'page.dashboard.breakdown.long_tail',
  Sold: 'page.dashboard.breakdown.sold',
  Hidden: 'page.dashboard.breakdown.hidden',
  'Promoted clicked': 'page.dashboard.breakdown.promoted_clicked',
  Existing: 'page.dashboard.breakdown.existing',
  Dormant: 'page.dashboard.breakdown.dormant',
  'Kim Minjun': 'page.dashboard.breakdown.kim_minjun',
  'Park Jisoo': 'page.dashboard.breakdown.park_jisoo',
  'Lee Hana': 'page.dashboard.breakdown.lee_hana',
  Product: 'page.dashboard.breakdown.product',
  Payment: 'page.dashboard.breakdown.payment',
  Delivery: 'page.dashboard.breakdown.delivery',
  Account: 'page.dashboard.breakdown.account',
  Received: 'page.dashboard.breakdown.received',
  // Chart series names reuse the badge labels these already have.
  Quantity: 'page.dashboard.statistics.extra_stats.quantity',
  Revenue: 'page.dashboard.statistics.extra_stats.revenue',
  Processing: 'page.dashboard.breakdown.processing',
  Customer: 'page.dashboard.breakdown.customer',
  // Raw API enum keys (customer activity status, membership levels, payment method/status)
  active: 'page.dashboard.breakdown.active',
  new: 'page.dashboard.breakdown.new',
  inactive: 'page.dashboard.breakdown.inactive',
  dormant: 'page.dashboard.breakdown.dormant',
  basic: 'page.dashboard.breakdown.basic',
  premium: 'page.dashboard.breakdown.premium',
  vip: 'page.dashboard.breakdown.vip',
  card: 'page.dashboard.breakdown.card',
  tax_invoice: 'page.dashboard.breakdown.tax_invoice',
  postpaid: 'page.dashboard.breakdown.postpaid',
  success: 'page.dashboard.breakdown.success',
  failed: 'page.dashboard.breakdown.failed',
  refunded: 'page.dashboard.breakdown.refunded',
  direct: 'page.dashboard.breakdown.direct_signup',
  social_login: 'page.dashboard.breakdown.social_login',
};

function translate(t: TFunction, key: string, fallback?: string) {
  return String(t(key as never, fallback ? ({ defaultValue: fallback } as never) : undefined));
}

export function translateDashboardMetric(t: TFunction, key: string, fallback: string) {
  return translate(t, `page.dashboard.metrics.${key}`, fallback);
}

export function translateDashboardStatLabel(t: TFunction, key: string, fallback: string) {
  return translate(t, `page.dashboard.statistics.extra_stats.${key}`, fallback);
}

/** Short series name for single-line charts (Count / Amount / Rate), keyed by the section's unit. */
export function translateDashboardChartLabel(t: TFunction, unit: string | undefined) {
  const key = unit === 'amount' || unit === 'currency' ? 'amount' : unit === 'percent' ? 'rate' : 'count';
  return translate(t, `page.dashboard.statistics.chart_label.${key}`, key);
}

export function translateDashboardNotificationTitle(t: TFunction, id: string, fallback: string) {
  return translate(t, `page.dashboard.notifications.items.${id}.title`, fallback);
}

export function translateDashboardNotificationDescription(t: TFunction, id: string, fallback: string) {
  return translate(t, `page.dashboard.notifications.items.${id}.description`, fallback);
}

export function translateDashboardSectionTitle(t: TFunction, id: string, fallback: string) {
  return translate(t, `page.dashboard.sections.${id}.title`, fallback);
}

export function translateDashboardSectionDescription(t: TFunction, id: string, fallback: string) {
  return translate(t, `page.dashboard.sections.${id}.description`, fallback);
}

export function translateDashboardBreakdownLabel(t: TFunction, label: string) {
  // API responses don't always match the documented string type (e.g. numeric enum values).
  const text = typeof label === 'string' ? label : String(label ?? '');
  const key = BREAKDOWN_LABEL_KEYS[text];
  if (key) return translate(t, key);

  // API enum keys (e.g. order statuses): reuse the orders feature translations, humanize as last resort.
  if (/^[a-z0-9_]+$/.test(text)) {
    const humanized = text.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    return translate(t, `page.orders.status.${text}`, humanized);
  }

  return text;
}

export function translateDashboardTrendLabel(t: TFunction, label: string) {
  const key = TREND_LABEL_KEYS[label];

  return key ? translate(t, key) : label;
}
