import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppInputFormField } from '@/components/shared/form-fields';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { SIZE_SEARCH_FILTER_DEFAULT_VALUES, type SizeSearchFilterFormValues } from '../schemas/size-search-filter-form';

interface SizeSearchFiltersProps {
  initialValues: SizeSearchFilterFormValues;
  onSearch: (values: SizeSearchFilterFormValues) => void;
  onReset: () => void;
}

export function SizeSearchFilters({ initialValues, onSearch, onReset }: SizeSearchFiltersProps) {
  const { t } = useTranslation();
  const form = useForm<SizeSearchFilterFormValues>({
    defaultValues: SIZE_SEARCH_FILTER_DEFAULT_VALUES,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <AppSearchFilter
      onSearch={() => void form.handleSubmit(onSearch)()}
      onReset={() => {
        form.reset(SIZE_SEARCH_FILTER_DEFAULT_VALUES);
        onReset();
      }}
    >
      <AppSearchFilterField>
        <AppInputFormField
          name='search'
          control={form.control}
          label={t('page.products.options.filters.search')}
          placeholder={t('page.products.options.filters.search_placeholder')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
