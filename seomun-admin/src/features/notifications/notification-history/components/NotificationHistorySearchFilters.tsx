import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import type { AppSelectOption } from '@/components/shared/app-select';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { useNotificationHistorySearchFiltersQuery } from '../api';
import { EMPTY_NOTIFICATION_HISTORY_SEARCH_FILTER_VALUES, type NotificationHistorySearchFilterValues } from '../schemas';

interface NotificationHistorySearchFiltersProps {
  initialValues: NotificationHistorySearchFilterValues;
  onSearch: (values: NotificationHistorySearchFilterValues) => void;
  onReset: () => void;
}

export function NotificationHistorySearchFilters({ initialValues, onSearch, onReset }: NotificationHistorySearchFiltersProps) {
  const { t } = useTranslation('page');
  const [values, setValues] = useState<NotificationHistorySearchFilterValues>(initialValues);
  const { data: filterResponse } = useNotificationHistorySearchFiltersQuery();

  const notificationTypeOptions = useMemo<AppSelectOption[]>(
    () => filterResponse?.data.filters.notification_type_options ?? [],
    [filterResponse?.data.filters.notification_type_options],
  );

  const sendingResultOptions = useMemo<AppSelectOption[]>(
    () => filterResponse?.data.filters.sending_result_options ?? [],
    [filterResponse?.data.filters.sending_result_options],
  );

  const notificationTemplateNumberOptions = useMemo<AppSelectOption[]>(
    () => filterResponse?.data.filters.template_number_options ?? [],
    [filterResponse?.data.filters.template_number_options],
  );

  const senderOptions = useMemo<AppSelectOption[]>(
    () =>
      filterResponse?.data.filters.sender_options.map((option) => ({
        value: String(option.value),
        label: option.label,
      })) ?? [],
    [filterResponse?.data.filters.sender_options],
  );
  const notificationRecipientNameOptions = useMemo<AppSelectOption[]>(
    () => filterResponse?.data.filters.recipient_name_options ?? [],
    [filterResponse?.data.filters.recipient_name_options],
  );
  const handleSubmit = () => {
    onSearch(values);
  };

  const handleReset = () => {
    setValues({ ...EMPTY_NOTIFICATION_HISTORY_SEARCH_FILTER_VALUES });
    onReset();
  };

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <AppSearchFilter onSearch={handleSubmit} onReset={handleReset}>
      <AppSearchFilterField label={t('notifications.history.filters.template_number')} htmlFor='notification-template-number'>
        <AppSelect
          id='notification-template-number'
          value={values.template_number}
          onValueChange={(template_number) => setValues((previous) => ({ ...previous, template_number }))}
          options={notificationTemplateNumberOptions}
          placeholder={t('notifications.history.filters.all_template_numbers')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notifications.history.filters.notification_type')} htmlFor='notification-type'>
        <AppSelect
          id='notification-type'
          value={values.notification_type}
          onValueChange={(notification_type) => setValues((previous) => ({ ...previous, notification_type }))}
          options={notificationTypeOptions}
          placeholder={t('notifications.history.filters.all_notification_types')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notifications.history.filters.recipient_name')} htmlFor='notification-recipient-name'>
        <AppSelect
          id='notification-recipient-name'
          value={values.recipient_name}
          onValueChange={(recipient_name) => setValues((previous) => ({ ...previous, recipient_name }))}
          options={notificationRecipientNameOptions}
          placeholder={t('notifications.history.filters.recipient_name_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notifications.history.filters.sending_result')} htmlFor='notification-sending-result'>
        <AppSelect
          id='notification-sending-result'
          value={values.sending_result}
          onValueChange={(sending_result) => setValues((previous) => ({ ...previous, sending_result }))}
          options={sendingResultOptions}
          placeholder={t('notifications.history.filters.all_results')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notifications.history.filters.sender')} htmlFor='notification-sender-id'>
        <AppSelect
          id='notification-sender-id'
          value={values.sender_id}
          onValueChange={(sender_id) => setValues((previous) => ({ ...previous, sender_id }))}
          options={senderOptions}
          placeholder={t('notifications.history.filters.all_senders')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notifications.history.filters.sending_date')} htmlFor='notification-sending-date' wide>
        <AppDateRangePicker
          id='notification-sending-date'
          value={{ from: values.sending_date_from ?? undefined, to: values.sending_date_to ?? undefined }}
          onChange={(range) =>
            setValues((previous) => ({
              ...previous,
              sending_date_from: range?.from ? new Date(range.from) : null,
              sending_date_to: range?.to ? new Date(range.to) : null,
            }))
          }
          placeholder={t('notifications.history.filters.sending_date_placeholder')}
          allowClear
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
