import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDateRangePickerFormField, AppInputFormField } from '@/components/shared/form-fields';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { OPTION_DETAIL_SEARCH_FILTER_DEFAULT_VALUES, type OptionDetailSearchFilterFormValues } from '../schemas/option-search-filter-form';

interface OptionDetailSearchFiltersProps {
  initialValues: OptionDetailSearchFilterFormValues;
  onSearch: (values: OptionDetailSearchFilterFormValues) => void;
  onReset: () => void;
}

export function OptionDetailSearchFilters({ initialValues, onSearch, onReset }: OptionDetailSearchFiltersProps) {
  const { t } = useTranslation();
  const form = useForm<OptionDetailSearchFilterFormValues>({
    defaultValues: OPTION_DETAIL_SEARCH_FILTER_DEFAULT_VALUES,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <AppSearchFilter
      onSearch={() => void form.handleSubmit(onSearch)()}
      onReset={() => {
        form.reset(OPTION_DETAIL_SEARCH_FILTER_DEFAULT_VALUES);
        onReset();
      }}
    >
      <AppSearchFilterField>
        <AppInputFormField
          name='option_code'
          control={form.control}
          label={t('page.products.options.filters.option_code')}
          id='option-value-search-code'
          placeholder={t('page.products.options.filters.option_code_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppInputFormField
          name='option_label'
          control={form.control}
          label={t('page.products.options.filters.option_label')}
          id='option-value-search-label'
          placeholder={t('page.products.options.filters.option_label_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField wide>
        <AppDateRangePickerFormField
          control={form.control}
          fromName='created_from'
          toName='created_to'
          label={t('page.products.options.filters.created_range')}
          id='option-value-search-created-range'
          placeholder={t('page.products.options.filters.created_range_placeholder')}
          allowClear
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
