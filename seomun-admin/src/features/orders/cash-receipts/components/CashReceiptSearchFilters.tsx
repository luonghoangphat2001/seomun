import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { getCashReceiptIssueStatusOptions } from '../constants';
import { CashReceiptTab } from '../enums';
import type { CashReceiptSearchFilterValues } from '../schemas';

type CashReceiptSearchFiltersProps = {
  initialValues: CashReceiptSearchFilterValues;
  mode: CashReceiptTab;
  onSearch: (values: CashReceiptSearchFilterValues) => void;
  onReset: () => void;
};

export function CashReceiptSearchFilters({ initialValues, mode, onSearch, onReset }: CashReceiptSearchFiltersProps) {
  const { t } = useTranslation('page');

  const [orderNumber, setOrderNumber] = useState(initialValues.order_number ?? '');
  const [issueStatus, setIssueStatus] = useState<CashReceiptSearchFilterValues['issue_status']>(initialValues.issue_status);
  const [isGenerated, setIsGenerated] = useState<CashReceiptSearchFilterValues['is_generated']>(initialValues.is_generated);
  const [dateRange, setDateRange] = useState<{ from?: number; to?: number } | undefined>(
    initialValues.date_from || initialValues.date_to
      ? {
          from: initialValues.date_from ? new Date(initialValues.date_from).getTime() : undefined,
          to: initialValues.date_to ? new Date(initialValues.date_to).getTime() : undefined,
        }
      : undefined,
  );

  const statusOptions = getCashReceiptIssueStatusOptions(t);
  const isOriginalMode = mode === CashReceiptTab.ORIGINAL;

  const handleSearch = () => {
    onSearch({
      order_code: undefined,
      order_number: orderNumber.trim() || undefined,
      issue_status: isOriginalMode ? undefined : issueStatus,
      is_generated: isOriginalMode ? isGenerated : undefined,
      date_from: dateRange?.from ? format(new Date(dateRange.from), 'yyyy-MM-dd') : undefined,
      date_to: dateRange?.to ? format(new Date(dateRange.to), 'yyyy-MM-dd') : undefined,
    });
  };

  const handleReset = () => {
    setOrderNumber('');
    setIssueStatus(undefined);
    setIsGenerated(undefined);
    setDateRange(undefined);
    onReset();
  };

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('orders.cash_receipts.filters.order_number')} htmlFor='cash-receipt-order-number'>
        <AppInput
          id='cash-receipt-order-number'
          placeholder={t('orders.cash_receipts.filters.order_number_placeholder')}
          value={orderNumber}
          onValueChange={setOrderNumber}
          clearable
          prefix={<Search className='size-4' />}
        />
      </AppSearchFilterField>

      {!isOriginalMode ? (
        <AppSearchFilterField label={t('orders.cash_receipts.filters.issue_status')} htmlFor='cash-receipt-status'>
          <AppSelect
            id='cash-receipt-status'
            value={issueStatus}
            onValueChange={(value) => setIssueStatus(value)}
            options={statusOptions}
            placeholder={t('orders.cash_receipts.filters.all_statuses')}
            clearable
          />
        </AppSearchFilterField>
      ) : null}

      <AppSearchFilterField label={t('orders.cash_receipts.filters.date_range')} htmlFor='cash-receipt-date-range' wide>
        <AppDateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder={t('orders.cash_receipts.filters.date_range_placeholder')}
          allowClear
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
