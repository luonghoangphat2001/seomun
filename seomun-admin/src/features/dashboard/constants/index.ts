import { AlertCircle, Bell, Check, CreditCard, DollarSign, MessageSquare, ShoppingCart, Star, TrendingUp, User, type LucideIcon } from 'lucide-react';

import type { AppSelectOption } from '@/components/shared/app-select';
import type { TFunction } from 'i18next';

import { DashboardGroupBy, DashboardPeriod, DashboardStatisticType, type DashboardNotification } from '../api';

export const PERIOD_VALUES = [DashboardPeriod.SEVEN_DAYS, DashboardPeriod.THIRTY_DAYS] as const satisfies readonly DashboardPeriod[];
export const GROUP_BY_VALUES = [DashboardGroupBy.DAILY, DashboardGroupBy.WEEKLY] as const satisfies readonly DashboardGroupBy[];
export const STATISTIC_TYPE_VALUES = [
  DashboardStatisticType.MEMBERS,
  DashboardStatisticType.ORDERS,
  DashboardStatisticType.PRODUCTS,
  DashboardStatisticType.INQUIRIES,
  DashboardStatisticType.PAYMENTS,
] as const satisfies readonly DashboardStatisticType[];

export function getPeriodOptions(t: TFunction): AppSelectOption<DashboardPeriod>[] {
  return PERIOD_VALUES.map((value) => ({
    value,
    label: t(`page.dashboard.filters.period.${value}`),
  }));
}

export function getGroupByOptions(t: TFunction): AppSelectOption<DashboardGroupBy>[] {
  return GROUP_BY_VALUES.map((value) => ({
    value,
    label: t(`page.dashboard.filters.group_by.${value}`),
  }));
}

export function getStatisticTypeOptions(t: TFunction): AppSelectOption<DashboardStatisticType>[] {
  return STATISTIC_TYPE_VALUES.map((value) => ({
    value,
    label: t(`page.dashboard.statistic_types.${value}`),
  }));
}

export const OPERATION_METRIC_ORDER = ['sales', 'members', 'orders', 'payment_success', 'outstanding'] as const;
export const OPERATION_METRIC_KEY_SET: ReadonlySet<string> = new Set(OPERATION_METRIC_ORDER);

export const METRIC_CONFIG: Record<string, { icon: LucideIcon; color: string; lineColor: string }> = {
  sales: { icon: DollarSign, color: 'from-orange-500 to-orange-600', lineColor: '#f97316' },
  members: { icon: User, color: 'from-cyan-500 to-cyan-600', lineColor: '#06b6d4' },
  orders: { icon: ShoppingCart, color: 'from-indigo-500 to-indigo-600', lineColor: '#6366f1' },
  payment_success: { icon: Check, color: 'from-emerald-500 to-emerald-600', lineColor: '#10b981' },
  outstanding: { icon: CreditCard, color: 'from-amber-500 to-amber-600', lineColor: '#f59e0b' },
  reviews: { icon: Star, color: 'from-yellow-500 to-yellow-600', lineColor: '#eab308' },
  default: { icon: TrendingUp, color: 'from-slate-500 to-slate-600', lineColor: '#64748b' },
};

export const NOTIFICATION_CONFIG: Record<DashboardNotification['severity'], { icon: LucideIcon; color: string; badgeClassName: string }> = {
  critical: { icon: AlertCircle, color: 'text-orange-500', badgeClassName: 'bg-orange-50 text-orange-700' },
  warning: { icon: MessageSquare, color: 'text-pink-500', badgeClassName: 'bg-pink-50 text-pink-700' },
  info: { icon: Bell, color: 'text-blue-500', badgeClassName: 'bg-blue-50 text-blue-700' },
};
