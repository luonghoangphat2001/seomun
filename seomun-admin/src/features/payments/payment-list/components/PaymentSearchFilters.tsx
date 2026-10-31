import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { getPaymentStatusOptions } from '../constants';
import type { PaymentSearchFilterValues } from '../schemas';

type PaymentSearchFiltersProps = {
  initialValues: PaymentSearchFilterValues;
  onSearch: (values: PaymentSearchFilterValues) => void;
  onReset: () => void;
};

type DateRange = { from?: number; to?: number } | undefined;

const toDateRange = (from?: string, to?: string): DateRange =>
  from || to ? { from: from ? new Date(from).getTime() : undefined, to: to ? new Date(to).getTime() : undefined } : undefined;

const toDateOnly = (value?: number) => (value ? format(new Date(value), 'yyyy-MM-dd') : undefined);

export function PaymentSearchFilters({ initialValues, onSearch, onReset }: PaymentSearchFiltersProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const [searchTerm, setSearchTerm] = useState<string>(initialValues.search_term ?? '');
  const [status, setStatus] = useState<PaymentSearchFilterValues['status']>(initialValues.status);
  const [orderDateRange, setOrderDateRange] = useState<DateRange>(toDateRange(initialValues.order_date_from, initialValues.order_date_to));
  const [paymentDateRange, setPaymentDateRange] = useState<DateRange>(toDateRange(initialValues.start_date, initialValues.end_date));

  const paymentStatusOptions = getPaymentStatusOptions(t);

  const handleSearch = () => {
    onSearch({
      search_term: searchTerm.trim() || undefined,
      status,
      order_date_from: toDateOnly(orderDateRange?.from),
      order_date_to: toDateOnly(orderDateRange?.to),
      start_date: toDateOnly(paymentDateRange?.from),
      end_date: toDateOnly(paymentDateRange?.to),
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatus(undefined);
    setOrderDateRange(undefined);
    setPaymentDateRange(undefined);
    onReset();
  };

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('payments.list.filters.order_date')} htmlFor='payment-order-date' wide>
        <AppDateRangePicker
          id='payment-order-date'
          value={orderDateRange}
          onChange={setOrderDateRange}
          placeholder={t('payments.list.filters.date_range_placeholder', 'Select date range')}
          allowClear
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('payments.list.filters.date_range', 'Payment Date')} htmlFor='payment-date-range' wide>
        <AppDateRangePicker
          id='payment-date-range'
          value={paymentDateRange}
          onChange={setPaymentDateRange}
          placeholder={t('payments.list.filters.date_range_placeholder', 'Select date range')}
          allowClear
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={tCommon('filter.search_term')} htmlFor='payment-search-term'>
        <AppInput
          id='payment-search-term'
          value={searchTerm}
          onValueChange={setSearchTerm}
          placeholder={t('payments.list.filters.search_term_placeholder')}
          prefix={<Search className='size-4' />}
          clearable
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('payments.list.filters.status', 'Status')} htmlFor='payment-status'>
        <AppSelect
          id='payment-status'
          value={status}
          onValueChange={(v) => setStatus((v || undefined) as PaymentSearchFilterValues['status'])}
          options={paymentStatusOptions}
          placeholder={t('payments.list.filters.all_statuses', 'All statuses')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
