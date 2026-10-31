import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import { AppInputFormField, AppSelectFormField, AppFieldLabel } from '@/components/shared/form-fields';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { getTemplateStatusOptions } from '../constants';
import { TEMPLATE_SEARCH_FILTER_DEFAULT_VALUES, type TemplateSearchFilterValues } from '../schemas';

interface TemplateSearchFiltersProps {
  initialValues: TemplateSearchFilterValues;
  isLoading?: boolean;
  onSearch: (values: TemplateSearchFilterValues) => void;
  onReset: () => void;
}

export function TemplateSearchFilters({ initialValues, isLoading = false, onSearch, onReset }: TemplateSearchFiltersProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const form = useForm<TemplateSearchFilterValues>({
    defaultValues: TEMPLATE_SEARCH_FILTER_DEFAULT_VALUES,
  });

  const statusOptions = getTemplateStatusOptions(tCommon);

  const modifiedFrom = useWatch({
    control: form.control,
    name: 'modified_from',
  });
  const modifiedTo = useWatch({
    control: form.control,
    name: 'modified_to',
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <AppSearchFilter
      onSearch={() => void form.handleSubmit(onSearch)()}
      onReset={() => {
        form.reset(TEMPLATE_SEARCH_FILTER_DEFAULT_VALUES);
        onReset();
      }}
    >
      <AppSearchFilterField>
        <AppInputFormField
          name='template_name'
          control={form.control}
          label={t('products.templates.list.filters.template_name', 'Template Name')}
          id='template-search-name'
          placeholder={t('products.templates.list.filters.template_name_placeholder', 'Search by template name')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppInputFormField
          name='specification'
          control={form.control}
          label={t('products.templates.list.filters.specification', 'Specification')}
          id='template-search-specifications'
          placeholder={t('products.templates.list.filters.specification_placeholder', 'e.g. 90x50mm, 300gsm, A4')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppSelectFormField
          name='status'
          control={form.control}
          label={t('products.templates.list.filters.status', 'Status')}
          id='template-search-status'
          placeholder={t('products.templates.list.filters.all_statuses', 'All statuses')}
          options={statusOptions}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppInputFormField
          name='registrant'
          control={form.control}
          label={t('products.templates.list.filters.registrant', 'Registrant')}
          id='template-search-registrant'
          placeholder={t('products.templates.list.filters.registrant_placeholder', 'Username, name, or email')}
          clearable
        />
      </AppSearchFilterField>

      <div className='flex flex-col gap-1.5'>
        <AppFieldLabel htmlFor='template-search-modified-range' label={t('products.templates.list.filters.modified_range', 'Last Modified Date')} />
        <AppDateRangePicker
          value={{
            from: modifiedFrom ?? undefined,
            to: modifiedTo ?? undefined,
          }}
          onChange={(range) => {
            form.setValue('modified_from', range?.from ? new Date(range.from) : null, { shouldDirty: true });
            form.setValue('modified_to', range?.to ? new Date(range.to) : null, { shouldDirty: true });
          }}
          placeholder={t('products.templates.list.filters.modified_range_placeholder', 'Select modified date range')}
          allowClear
          disabled={isLoading}
        />
      </div>
    </AppSearchFilter>
  );
}
