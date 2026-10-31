import type { TFunction } from 'i18next';

const compactFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
/** For axis ticks, where a full `2,419,478` would eat the plot area. */
export const dashboardCompactFormatter = compactFormatter;
export const dashboardNumberFormatter = new Intl.NumberFormat('en');

export function formatDashboardValue(value: number, unit?: string, t?: TFunction) {
  const won = () => (t ? String(t('page.dashboard.statistics.unit_suffix.won', { defaultValue: 'Won' })) : 'Won');

  if (unit === 'amount' || unit === 'KRW') {
    return `${compactFormatter.format(value)} ${won()}`;
  }

  if (unit === 'amount_full') {
    return `${dashboardNumberFormatter.format(value)} ${won()}`;
  }

  if (unit === 'percent' || unit === '%') {
    return `${dashboardNumberFormatter.format(value)}%`;
  }

  if (unit === 'h') {
    return `${dashboardNumberFormatter.format(value)}h`;
  }

  if (unit === 'units') {
    const suffix = t ? t('page.dashboard.statistics.unit_suffix.units', { defaultValue: 'units' }) : 'units';
    return `${dashboardNumberFormatter.format(value)} ${suffix}`;
  }

  return dashboardNumberFormatter.format(value);
}
