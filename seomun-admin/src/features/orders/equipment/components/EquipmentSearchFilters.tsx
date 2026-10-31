import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { getEquipmentStatusOptions, getEquipmentWorkProcessOptions } from '../constants/equipment-options';
import { EMPTY_EQUIPMENT_SEARCH_FILTERS, EQUIPMENT_STATUS_ALL, type EquipmentSearchFilterValues } from '../schemas/equipment-list-search.schema';

type EquipmentSearchFiltersProps = {
  initialValues: EquipmentSearchFilterValues;
  onSearch: (values: EquipmentSearchFilterValues) => void;
  onReset: () => void;
};

export function EquipmentSearchFilters({ initialValues, onSearch, onReset }: EquipmentSearchFiltersProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const workProcessOptions = getEquipmentWorkProcessOptions(t);
  const statusOptions = [
    { value: EQUIPMENT_STATUS_ALL, label: t('orders.equipment.filters.all_statuses', 'All statuses') },
    ...getEquipmentStatusOptions(t),
  ];

  const form = useForm<EquipmentSearchFilterValues>({
    defaultValues: EMPTY_EQUIPMENT_SEARCH_FILTERS,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <AppSearchFilter
      onSearch={() => void form.handleSubmit(onSearch)()}
      onReset={() => {
        form.reset(EMPTY_EQUIPMENT_SEARCH_FILTERS);
        onReset();
      }}
    >
      <AppSearchFilterField>
        <AppSelectFormField
          name='work_process'
          control={form.control}
          label={t('orders.equipment.filters.work_process', 'Work Process')}
          placeholder={t('orders.equipment.filters.all_processes', 'All processes')}
          options={workProcessOptions}
          clearable
        />
      </AppSearchFilterField>
      <AppSearchFilterField>
        <AppInputFormField
          name='keyword'
          control={form.control}
          label={tCommon('filter.search_term')}
          placeholder={t('orders.equipment.filters.search_term_placeholder')}
          clearable
        />
      </AppSearchFilterField>
      <AppSearchFilterField>
        <AppSelectFormField name='status' control={form.control} label={t('orders.equipment.filters.status', 'Status')} options={statusOptions} />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
