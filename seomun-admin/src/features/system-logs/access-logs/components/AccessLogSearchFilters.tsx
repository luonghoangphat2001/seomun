import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import { AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import type { AppSelectOption } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import type { AccessLogSearchFilterRESP } from '../api';
import { EMPTY_ACCESS_LOG_SEARCH_FILTER_VALUES, type AccessLogSearchFilterValues } from '../schemas';

interface AccessLogSearchFiltersProps {
  filters?: AccessLogSearchFilterRESP['data']['filters'];
  initialValues: AccessLogSearchFilterValues;
  isLoading?: boolean;
  onSearch: (values: AccessLogSearchFilterValues) => void;
  onReset: () => void;
}

export function AccessLogSearchFilters({ filters, initialValues, isLoading = false, onSearch, onReset }: AccessLogSearchFiltersProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const form = useForm<AccessLogSearchFilterValues>({
    defaultValues: EMPTY_ACCESS_LOG_SEARCH_FILTER_VALUES,
  });

  const accessDateFrom = useWatch({
    control: form.control,
    name: 'access_date_from',
  });
  const accessDateTo = useWatch({
    control: form.control,
    name: 'access_date_to',
  });

  const eventTypeOptions = useMemo<AppSelectOption[]>(() => filters?.event_type_options ?? [], [filters?.event_type_options]);

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <AppSearchFilter
      onSearch={() => void form.handleSubmit(onSearch)()}
      onReset={() => {
        form.reset(EMPTY_ACCESS_LOG_SEARCH_FILTER_VALUES);
        onReset();
      }}
    >
      <AppSearchFilterField label={t('system_logs.access.filters.access_datetime')} htmlFor='access-log-access-date-range' wide>
        <AppDateRangePicker
          id='access-log-access-date-range'
          value={{
            from: accessDateFrom ?? undefined,
            to: accessDateTo ?? undefined,
          }}
          onChange={(range) => {
            form.setValue('access_date_from', range?.from ? new Date(range.from) : null, { shouldDirty: true });
            form.setValue('access_date_to', range?.to ? new Date(range.to) : null, { shouldDirty: true });
          }}
          placeholder={t('system_logs.access.filters.access_date_range_placeholder')}
          allowClear
          disabled={isLoading}
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppSelectFormField
          name='event_type'
          control={form.control}
          label={t('system_logs.access.filters.access_type')}
          placeholder={t('system_logs.access.filters.event_type_placeholder')}
          options={eventTypeOptions}
          clearable
          disabled={isLoading}
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppInputFormField
          name='search_term'
          control={form.control}
          label={tCommon('filter.search_term')}
          placeholder={t('system_logs.access.filters.search_term_placeholder')}
          clearable
          disabled={isLoading}
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
