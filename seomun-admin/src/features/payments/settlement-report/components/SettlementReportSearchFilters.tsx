import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import type { SettlementReportSearchFilterValues } from '../schemas';

type SettlementReportSearchFiltersProps = {
  initialValues: SettlementReportSearchFilterValues;
  onSearch: (values: SettlementReportSearchFilterValues) => void;
  onReset: () => void;
};

export function SettlementReportSearchFilters({ initialValues, onSearch, onReset }: SettlementReportSearchFiltersProps) {
  const { t } = useTranslation('page');

  const [dateRange, setDateRange] = useState<{ from?: number; to?: number } | undefined>(
    initialValues.start_date || initialValues.end_date
      ? {
          from: initialValues.start_date ? new Date(initialValues.start_date).getTime() : undefined,
          to: initialValues.end_date ? new Date(initialValues.end_date).getTime() : undefined,
        }
      : undefined,
  );

  const handleSearch = () => {
    onSearch({
      start_date: dateRange?.from ? format(new Date(dateRange.from), 'yyyy-MM-dd') : undefined,
      end_date: dateRange?.to ? format(new Date(dateRange.to), 'yyyy-MM-dd') : undefined,
    });
  };

  const handleReset = () => {
    setDateRange(undefined);
    onReset();
  };

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('payments.settlement_report.filters.date_range', 'Settlement Date')} htmlFor='settlement-date-range' wide>
        <AppDateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder={t('payments.settlement_report.filters.date_range_placeholder', 'Select date range')}
          allowClear
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
