import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { PeriodFilter } from '@/enums/common';
import { OrderActionFilter, OrderFilterLabel } from '@/enums/order';
import { getProductOptionGroupName, ProductOptionGroupNameTranslator } from '@/lib/product-option-labels';
import { endOfDay, format, startOfDay, subDays, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { OrderHistoryListREQ } from './order.request';
import { OrderHistoryOptionRESP, OrderHistoryRESP, OrderOptionItem } from './order.response';

export const getInitFilterOrderHistory = (searchParams: URLSearchParams): OrderHistoryListREQ => ({
  page: Number(searchParams.get('page')) || PAGINATION.DEFAULT_PAGE,
  per_page: Number(searchParams.get('per_page')) || PAGINATION.DEFAULT_PAGE_SIZE,
  filter_label: (searchParams.get('filter_label') as OrderFilterLabel | null) ?? OrderFilterLabel.ALL,
  date_from: searchParams.get('date_from') || undefined,
  date_to: searchParams.get('date_to') || undefined,
  order_number_keyword: searchParams.get('order_number_keyword') || undefined,
  product_name_keyword: searchParams.get('product_name_keyword') || undefined,
});

export const getDateRangeByOrderPeriod = (period: string): DateRange | undefined => {
  const today = new Date();

  switch (period) {
    case PeriodFilter.ONE_WEEK:
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
    case PeriodFilter.ONE_MONTH:
      return { from: startOfDay(subMonths(today, 1)), to: endOfDay(today) };
    case PeriodFilter.THREE_MONTHS:
      return { from: startOfDay(subMonths(today, 3)), to: endOfDay(today) };
    case PeriodFilter.SIX_MONTHS:
      return { from: startOfDay(subMonths(today, 6)), to: endOfDay(today) };
    default:
      return undefined;
  }
};

export const getOrderFilterLabel = (filter: string): OrderFilterLabel => {
  switch (filter) {
    case OrderActionFilter.EXCLUDE_CANCELLED:
      return OrderFilterLabel.EXCLUDE_CANCELLED;
    case OrderActionFilter.FILE_ERROR:
      return OrderFilterLabel.FILE_ERROR;
    default:
      return OrderFilterLabel.ALL;
  }
};

export const getOrderActionFilter = (filter?: OrderFilterLabel): OrderActionFilter => {
  switch (filter) {
    case OrderFilterLabel.EXCLUDE_CANCELLED:
      return OrderActionFilter.EXCLUDE_CANCELLED;
    case OrderFilterLabel.FILE_ERROR:
      return OrderActionFilter.FILE_ERROR;
    default:
      return OrderActionFilter.ALL;
  }
};

export const getOrderHistoryDateParams = (dateRange?: DateRange) => ({
  dateRange,
  date_from: dateRange?.from ? format(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
  date_to: dateRange?.to ? format(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
});

export const getOrderHistoryDescription = (order: OrderHistoryRESP, translateGroupName?: ProductOptionGroupNameTranslator) =>
  (Array.isArray(order.product_spec?.options) ? order.product_spec.options : [])
    .map((item) => [getProductOptionGroupName(item?.group, translateGroupName), item?.option?.label].filter(Boolean).join(' '))
    .filter(Boolean)
    .join(' / ');

export const getOrderOptionDescription = (
  options?: (OrderHistoryOptionRESP | OrderOptionItem | null)[],
  translateGroupName?: ProductOptionGroupNameTranslator,
) =>
  (Array.isArray(options) ? options : [])
    .map((item) => {
      const groupName = getProductOptionGroupName(item?.group, translateGroupName)?.trim();
      const optionLabel = item?.option?.label?.trim() || item?.option?.value?.trim();

      if (groupName && optionLabel) return `${groupName} ${optionLabel}`;

      return groupName || optionLabel || '';
    })
    .filter((item): item is string => Boolean(item))
    .join(' / ');
