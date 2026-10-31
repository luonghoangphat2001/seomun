import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';

import type { TaskLogSearchFiltersRESP } from '../api';
import { EMPTY_TASK_LOG_SEARCH_FILTER_VALUES, type TaskLogSearchFilterValues } from '../schemas';
import { useForm } from 'react-hook-form';
import type { AppSelectOption } from '@/components/shared/app-select';
import { AppDateRangePickerFormField } from '@/components/shared/form-fields/AppDateRangePickerFormField';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

interface TaskLogSearchFiltersProps {
  filters?: TaskLogSearchFiltersRESP['data']['filters'];
  initialValues: TaskLogSearchFilterValues;
  isLoading?: boolean;
  onSearch: (values: TaskLogSearchFilterValues) => void;
  onReset: () => void;
}

export function TaskLogSearchFilters({ filters, initialValues, isLoading = false, onSearch, onReset }: TaskLogSearchFiltersProps) {
  const { t } = useTranslation('page');
  const form = useForm<TaskLogSearchFilterValues>({
    defaultValues: EMPTY_TASK_LOG_SEARCH_FILTER_VALUES,
  });

  const menuOptions = useMemo<AppSelectOption[]>(
    () => filters?.menu_options.map((option) => ({ value: option.value, label: option.label ?? option.value })) ?? [],
    [filters?.menu_options],
  );

  const taskTypeOptions = useMemo<AppSelectOption[]>(
    () =>
      filters?.task_type_options.map((option) => ({
        value: option.value,
        label: option.label ?? option.value,
      })) ?? [],
    [filters?.task_type_options],
  );

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const handleSubmit = (values: TaskLogSearchFilterValues) => {
    onSearch(values);
  };

  const handleReset = () => {
    form.reset(EMPTY_TASK_LOG_SEARCH_FILTER_VALUES);
    onReset();
  };

  return (
    <AppSearchFilter onSearch={() => void form.handleSubmit(handleSubmit)()} onReset={handleReset}>
      <AppSearchFilterField>
        <AppSelectFormField
          name='menu'
          control={form.control}
          label={t('system_logs.tasks.filters.menu')}
          id='task-log-menu'
          options={menuOptions}
          placeholder={t('system_logs.tasks.filters.menu_placeholder')}
          searchable
          clearable
          disabled={isLoading}
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppInputFormField
          name='operator'
          control={form.control}
          label={t('system_logs.tasks.filters.operator')}
          id='task-log-operator'
          placeholder={t('system_logs.tasks.filters.operator_placeholder')}
          clearable
          disabled={isLoading}
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppSelectFormField
          name='task_type'
          control={form.control}
          label={t('system_logs.tasks.filters.task_type')}
          id='task-log-type'
          options={taskTypeOptions}
          placeholder={t('system_logs.tasks.filters.task_type_placeholder')}
          clearable
          disabled={isLoading}
        />
      </AppSearchFilterField>
      <AppSearchFilterField wide>
        <AppDateRangePickerFormField
          control={form.control}
          fromName='date_from'
          toName='date_to'
          label={t('system_logs.tasks.filters.date_range')}
          id='task-log-date-range'
          placeholder={t('system_logs.tasks.filters.date_range_placeholder')}
          allowClear
          disabled={isLoading}
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
