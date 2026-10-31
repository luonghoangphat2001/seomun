import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import { AppInput } from '@/components/shared/app-input';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { OrderStatusFilterSelect } from './OrderStatusFilterSelect';
import { EMPTY_ORDER_SEARCH_FILTER_VALUES, type OrderSearchFilterValues } from '../schemas';

interface OrderSearchFiltersProps {
  initialValues: OrderSearchFilterValues;
  onSearch: (values: OrderSearchFilterValues) => void;
  onReset: () => void;
}

export function OrderSearchFilters({ initialValues, onSearch, onReset }: OrderSearchFiltersProps) {
  const { t } = useTranslation('page');
  const [values, setValues] = useState<OrderSearchFilterValues>(initialValues);
  const [dateRange, setDateRange] = useState<{ from?: number; to?: number } | undefined>(
    initialValues.order_date_from || initialValues.order_date_to
      ? {
          from: initialValues.order_date_from ? new Date(initialValues.order_date_from).getTime() : undefined,
          to: initialValues.order_date_to ? new Date(initialValues.order_date_to).getTime() : undefined,
        }
      : undefined,
  );

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
      {/* Full-width first row, so the search input shares the second row with the buttons. */}
      <div className='flex w-full flex-wrap gap-3'>
        <AppSearchFilterField wide>
          <AppDateRangePicker value={dateRange} onChange={setDateRange} placeholder={t('orders.list.filters.date_range_placeholder')} allowClear />
        </AppSearchFilterField>
        <AppSearchFilterField>
          <OrderStatusFilterSelect
            id='order-search-status'
            value={values}
            onChange={(statusFilter) => setValues((previous) => ({ ...previous, ...statusFilter }))}
            placeholder={t('orders.list.filters.all_statuses')}
            aria-label={t('orders.list.filters.status')}
          />
        </AppSearchFilterField>
      </div>
      <AppSearchFilterField className='sm:max-w-none'>
        <AppInput
          id='order-search-term'
          value={values.search_term}
          onValueChange={(search_term) => setValues((previous) => ({ ...previous, search_term }))}
          placeholder={t('orders.list.filters.search_term_placeholder')}
          aria-label={t('orders.list.filters.search_term')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
