import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppSelect, type AppSelectOption } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import type { NotificationTemplateSearchFiltersRESP } from '../api';
import type { NotificationType } from '../../enums';
import type { NotificationUsageStatus } from '../enums';
import { EMPTY_NOTIFICATION_TEMPLATE_SEARCH_FILTER_VALUES, type NotificationTemplateSearchFilterValues } from '../schemas';

interface NotificationTemplateSearchFiltersProps {
  filters?: NotificationTemplateSearchFiltersRESP['data']['filters'];
  initialValues: NotificationTemplateSearchFilterValues;
  isLoading?: boolean;
  onSearch: (values: NotificationTemplateSearchFilterValues) => void;
  onReset: () => void;
}

export function NotificationTemplateSearchFilters({
  filters,
  initialValues,
  isLoading = false,
  onSearch,
  onReset,
}: NotificationTemplateSearchFiltersProps) {
  const { t } = useTranslation('page');
  const [values, setValues] = useState<NotificationTemplateSearchFilterValues>(initialValues);

  const templateNameOptions: AppSelectOption<string>[] = filters?.template_name_options ?? [];
  const templateNumberOptions: AppSelectOption<string>[] = filters?.template_number_options ?? [];
  const notificationTypeOptions: AppSelectOption<NotificationType>[] = filters?.notification_type_options ?? [];
  const usageStatusOptions: AppSelectOption<NotificationUsageStatus>[] = filters?.usage_status_options ?? [];
  const registrantOptions: AppSelectOption<string>[] =
    filters?.registrant_options.map((option) => ({
      value: String(option.value),
      label: option.label,
    })) ?? [];

  const updateValue = useCallback(
    <K extends keyof NotificationTemplateSearchFilterValues>(key: K, value: NotificationTemplateSearchFilterValues[K]) => {
      setValues((previous) => ({
        ...previous,
        [key]: value,
      }));
    },
    [],
  );

  const handleSubmit = () => {
    onSearch(values);
  };

  const handleReset = () => {
    setValues({ ...EMPTY_NOTIFICATION_TEMPLATE_SEARCH_FILTER_VALUES });
    onReset();
  };

  return (
    <AppSearchFilter onSearch={handleSubmit} onReset={handleReset}>
      <AppSearchFilterField label={t('notifications.templates.filters.template_name')} htmlFor='notification-template-name'>
        <AppSelect
          id='notification-template-name'
          value={values.template_name}
          onValueChange={(template_name) => updateValue('template_name', template_name)}
          options={templateNameOptions}
          placeholder={t('notifications.templates.filters.all_template_names')}
          clearable
          searchable
          disabled={isLoading}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notifications.templates.filters.template_number')} htmlFor='notification-template-number'>
        <AppSelect
          id='notification-template-number'
          value={values.template_number}
          onValueChange={(template_number) => updateValue('template_number', template_number)}
          options={templateNumberOptions}
          placeholder={t('notifications.templates.filters.all_template_numbers')}
          clearable
          searchable
          disabled={isLoading}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notifications.templates.filters.sending_type')} htmlFor='notification-template-type'>
        <AppSelect
          id='notification-template-type'
          value={values.notification_type}
          onValueChange={(notification_type) => updateValue('notification_type', notification_type)}
          options={notificationTypeOptions}
          placeholder={t('notifications.templates.filters.all_sending_types')}
          clearable
          disabled={isLoading}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notifications.templates.filters.usage_status')} htmlFor='notification-template-usage-status'>
        <AppSelect
          id='notification-template-usage-status'
          value={values.usage_status}
          onValueChange={(usage_status) => updateValue('usage_status', usage_status)}
          options={usageStatusOptions}
          placeholder={t('notifications.templates.filters.all_statuses')}
          clearable
          disabled={isLoading}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notifications.templates.filters.registrant')} htmlFor='notification-template-registrant'>
        <AppSelect
          id='notification-template-registrant'
          value={values.registrant_id != null ? String(values.registrant_id) : undefined}
          onValueChange={(registrant_id) => updateValue('registrant_id', registrant_id ? Number(registrant_id) : undefined)}
          options={registrantOptions}
          placeholder={t('notifications.templates.filters.all_registrants')}
          clearable
          searchable
          disabled={isLoading}
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
