import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { getOrderStatusOptions } from '../constants';
import { OrderStatus, OrderStatusGroup } from '../enums';
import { EMPTY_ORDER_SEARCH_FILTER_VALUES, type OrderSearchFilterValues } from '../schemas';

const PRODUCTION_STATUSES: readonly OrderStatus[] = [
  OrderStatus.TYPESETTING,
  OrderStatus.OUTPUT_OF_POWER,
  OrderStatus.PRINT,
  OrderStatus.POST_PROCESSING,
  OrderStatus.PRODUCTION_DONE,
];

const DESIGN_STATUSES: readonly OrderStatus[] = [
  OrderStatus.DESIGN_IN_PROGRESS,
  OrderStatus.DESIGN_CONFIRMATION_REQUESTED,
  OrderStatus.DESIGN_CONFIRMED,
];

// One select holds both single statuses and whole groups; groups are prefixed so they can't collide.
const GROUP_PREFIX = 'group:';

function toStatusSelectValue(values: OrderSearchFilterValues) {
  return values.status_group ? `${GROUP_PREFIX}${values.status_group}` : values.status;
}

function fromStatusSelectValue(value?: string): Pick<OrderSearchFilterValues, 'status' | 'status_group'> {
  if (value?.startsWith(GROUP_PREFIX)) return { status: undefined, status_group: value.slice(GROUP_PREFIX.length) as OrderStatusGroup };
  return { status: value as OrderStatus | undefined, status_group: undefined };
}

interface OrderProductionSearchFiltersProps {
  initialValues: OrderSearchFilterValues;
  onSearch: (values: OrderSearchFilterValues) => void;
  onReset: () => void;
}

export function OrderProductionSearchFilters({ initialValues, onSearch, onReset }: OrderProductionSearchFiltersProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const [values, setValues] = useState<OrderSearchFilterValues>(initialValues);
  const [dateRange, setDateRange] = useState<{ from?: number; to?: number } | undefined>(
    initialValues.order_date_from || initialValues.order_date_to
      ? {
          from: initialValues.order_date_from ? new Date(initialValues.order_date_from).getTime() : undefined,
          to: initialValues.order_date_to ? new Date(initialValues.order_date_to).getTime() : undefined,
        }
      : undefined,
  );

  const orderStatusOptions = getOrderStatusOptions(t);
  const pickStatuses = (statuses: readonly OrderStatus[]) => orderStatusOptions.filter((option) => statuses.includes(option.value));
  const statusOptions = [
    { value: `${GROUP_PREFIX}${OrderStatusGroup.PRODUCTION}`, label: t('orders.list.filters.status_group.production') },
    ...pickStatuses(PRODUCTION_STATUSES),
    { value: `${GROUP_PREFIX}${OrderStatusGroup.DESIGN}`, label: t('orders.list.filters.status_group.design') },
    ...pickStatuses(DESIGN_STATUSES),
  ];

  const handleSubmit = () => {
    onSearch({
      ...values,
      order_date_from: dateRange?.from ? format(new Date(dateRange.from), 'yyyy-MM-dd') : undefined,
      order_date_to: dateRange?.to ? format(new Date(dateRange.to), 'yyyy-MM-dd') : undefined,
    });
  };

  const handleReset = () => {
    setValues({ ...EMPTY_ORDER_SEARCH_FILTER_VALUES });
    setDateRange(undefined);
    onReset();
  };

  return (
    <AppSearchFilter onSearch={handleSubmit} onReset={handleReset}>
      <AppSearchFilterField label={t('orders.list.filters.order_period')} htmlFor='production-order-period' wide>
        <AppDateRangePicker
          id='production-order-period'
          value={dateRange}
          onChange={setDateRange}
          placeholder={t('orders.list.filters.date_range_placeholder')}
          allowClear
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={tCommon('filter.search_term')} htmlFor='production-order-search-term'>
        <AppInput
          id='production-order-search-term'
          value={values.search_term}
          onValueChange={(search_term) => setValues((previous) => ({ ...previous, search_term }))}
          placeholder={t('orders.list.filters.search_term_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('orders.list.filters.status')} htmlFor='production-order-search-status'>
        <AppSelect
          id='production-order-search-status'
          value={toStatusSelectValue(values)}
          onValueChange={(value) => setValues((previous) => ({ ...previous, ...fromStatusSelectValue(value) }))}
          options={statusOptions}
          placeholder={t('orders.list.filters.all_statuses')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
