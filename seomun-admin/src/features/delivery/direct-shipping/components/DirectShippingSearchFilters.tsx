import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDateRangePickerFormField, AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { DIRECT_SHIPPING_STATUS_TRANSLATION_KEYS } from '../constants';
import { DirectShippingStatus } from '../enums';
import { EMPTY_DIRECT_SHIPPING_SEARCH_FILTER_VALUES, type DirectShippingSearchFilterValues } from '../schemas';

// === Type definitions ===

interface DirectShippingSearchFiltersProps {
  initialValues: DirectShippingSearchFilterValues;
  onSearch: (values: DirectShippingSearchFilterValues) => void;
  onReset: () => void;
}

// === Component ===

export function DirectShippingSearchFilters({ initialValues, onSearch, onReset }: DirectShippingSearchFiltersProps) {
  const { t } = useTranslation();

  // === Hooks ===

  const form = useForm<DirectShippingSearchFilterValues>({
    defaultValues: EMPTY_DIRECT_SHIPPING_SEARCH_FILTER_VALUES,
  });

  // === Variables ===

  const statusOptions = useMemo(
    () => Object.values(DirectShippingStatus).map((status) => ({ value: status, label: t(DIRECT_SHIPPING_STATUS_TRANSLATION_KEYS[status]) })),
    [t],
  );

  // === Functions ===

  const handleReset = () => {
    form.reset(EMPTY_DIRECT_SHIPPING_SEARCH_FILTER_VALUES);
    onReset();
  };

  // === Effects ===

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  // === JSX return ===

  return (
    <AppSearchFilter onSearch={() => void form.handleSubmit(onSearch)()} onReset={handleReset}>
      <AppSearchFilterField wide>
        <AppDateRangePickerFormField
          control={form.control}
          fromName='date_from'
          toName='date_to'
          label={t('page.delivery.direct_shipping.fields.created_at')}
          placeholder={t('page.delivery.direct_shipping.filters.date_range_placeholder')}
          allowClear
        />
      </AppSearchFilterField>
      <AppSearchFilterField>
        <AppInputFormField
          name='search_term'
          control={form.control}
          label={t('common.filter.search_term')}
          placeholder={t('page.delivery.direct_shipping.search_placeholder')}
          clearable
        />
      </AppSearchFilterField>
      <AppSearchFilterField>
        <AppSelectFormField
          name='status'
          control={form.control}
          label={t('page.delivery.direct_shipping.fields.status')}
          placeholder={t('page.delivery.shared.all_statuses')}
          options={statusOptions}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
