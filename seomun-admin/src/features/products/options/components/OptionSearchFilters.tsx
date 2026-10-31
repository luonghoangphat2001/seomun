import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDateRangePickerFormField, AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { getErpOptionGroupTypeOptions } from '../constants/option.constants';
import { OPTION_SEARCH_FILTER_DEFAULT_VALUES, type OptionSearchFilterFormValues } from '../schemas/option-search-filter-form';

interface OptionSearchFiltersProps {
  initialValues: OptionSearchFilterFormValues;
  onSearch: (values: OptionSearchFilterFormValues) => void;
  onReset: () => void;
}

export function OptionSearchFilters({ initialValues, onSearch, onReset }: OptionSearchFiltersProps) {
  const { t } = useTranslation();
  const form = useForm<OptionSearchFilterFormValues>({
    defaultValues: OPTION_SEARCH_FILTER_DEFAULT_VALUES,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <AppSearchFilter
      onSearch={() => void form.handleSubmit(onSearch)()}
      onReset={() => {
        form.reset(OPTION_SEARCH_FILTER_DEFAULT_VALUES);
        onReset();
      }}
    >
      <AppSearchFilterField>
        <AppInputFormField
          name='label'
          control={form.control}
          label={t('page.products.options.filters.label')}
          id='option-group-search-label'
          placeholder={t('page.products.options.filters.label_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppInputFormField
          name='code'
          control={form.control}
          label={t('page.products.options.filters.code')}
          id='option-group-search-code'
          placeholder={t('page.products.options.filters.code_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppSelectFormField
          name='type'
          control={form.control}
          label={t('page.products.options.filters.type')}
          id='option-group-search-type'
          placeholder={t('page.products.options.filters.all_types')}
          options={getErpOptionGroupTypeOptions(t)}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField wide>
        <AppDateRangePickerFormField
          control={form.control}
          fromName='created_from'
          toName='created_to'
          label={t('page.products.options.filters.created_range')}
          id='option-group-search-created-range'
          placeholder={t('page.products.options.filters.created_range_placeholder')}
          allowClear
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
