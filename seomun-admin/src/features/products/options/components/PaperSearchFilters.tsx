import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { getPaperCategoryOptions, getPaperStatusLabel } from '../constants/option.constants';
import { PaperStatusValue } from '../enums';
import { PAPER_SEARCH_FILTER_DEFAULT_VALUES, type PaperSearchFilterFormValues } from '../schemas/paper-search-filter-form';

interface PaperSearchFiltersProps {
  initialValues: PaperSearchFilterFormValues;
  onSearch: (values: PaperSearchFilterFormValues) => void;
  onReset: () => void;
}

export function PaperSearchFilters({ initialValues, onSearch, onReset }: PaperSearchFiltersProps) {
  const { t } = useTranslation();
  const form = useForm<PaperSearchFilterFormValues>({
    defaultValues: PAPER_SEARCH_FILTER_DEFAULT_VALUES,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const isActiveOptions = [
    { value: 'true', label: getPaperStatusLabel(t, PaperStatusValue.ACTIVE) },
    { value: 'false', label: getPaperStatusLabel(t, PaperStatusValue.HIDDEN) },
  ];

  return (
    <AppSearchFilter
      onSearch={() => void form.handleSubmit(onSearch)()}
      onReset={() => {
        form.reset(PAPER_SEARCH_FILTER_DEFAULT_VALUES);
        onReset();
      }}
    >
      <AppSearchFilterField>
        <AppSelectFormField
          name='category'
          control={form.control}
          label={t('page.products.options.paper_dialog.category')}
          placeholder={t('page.products.options.filters.all_categories')}
          options={getPaperCategoryOptions(t)}
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppInputFormField
          name='name'
          control={form.control}
          label={t('page.products.options.paper_dialog.name')}
          placeholder={t('page.products.options.filters.paper_name_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppSelectFormField
          name='is_active'
          control={form.control}
          label={t('page.products.options.paper_dialog.is_active')}
          placeholder={t('page.products.options.filters.all_status')}
          options={isActiveOptions}
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
