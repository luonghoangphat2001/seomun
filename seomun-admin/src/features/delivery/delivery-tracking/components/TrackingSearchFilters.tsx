import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import { formatDateOnly } from '@/utils/format-date';

import { DELIVERY_STAGE_TRANSLATION_KEYS } from '../../constants';
import { DeliveryTrackingStage } from '../../enums';
import { EMPTY_TRACKING_SEARCH_FILTER_VALUES, type TrackingSearchFilterValues } from '../schemas';

interface TrackingSearchFiltersProps {
  initialValues: TrackingSearchFilterValues;
  onSearch: (values: TrackingSearchFilterValues) => void;
  onReset: () => void;
}

export function TrackingSearchFilters({ initialValues, onSearch, onReset }: TrackingSearchFiltersProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<TrackingSearchFilterValues>(initialValues);

  const statusOptions = useMemo(
    () =>
      Object.values(DeliveryTrackingStage).map((status) => ({
        value: status,
        label: t(DELIVERY_STAGE_TRANSLATION_KEYS[status]),
      })),
    [t],
  );

  const handleSubmit = () => {
    onSearch(values);
  };

  const handleReset = () => {
    setValues({ ...EMPTY_TRACKING_SEARCH_FILTER_VALUES });
    onReset();
  };

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <AppSearchFilter onSearch={handleSubmit} onReset={handleReset}>
      <AppSearchFilterField label={t('page.delivery.shared.keyword')} htmlFor='tracking-search-term'>
        <AppInput
          id='tracking-search-term'
          value={values.search_term}
          onValueChange={(search_term) => setValues((previous) => ({ ...previous, search_term }))}
          placeholder={t('page.delivery.tracking.search_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.delivery.tracking.fields.delivery_stage')} htmlFor='tracking-status'>
        <AppSelect
          id='tracking-status'
          value={values.delivery_status}
          onValueChange={(delivery_status) => setValues((previous) => ({ ...previous, delivery_status }))}
          options={statusOptions}
          placeholder={t('page.delivery.shared.all_statuses')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.delivery.tracking.fields.invoice_number')} htmlFor='tracking-invoice'>
        <AppInput
          id='tracking-invoice'
          value={values.invoice_number ?? ''}
          onValueChange={(invoice_number) => setValues((previous) => ({ ...previous, invoice_number }))}
          placeholder={t('page.delivery.tracking.invoice_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.delivery.tracking.fields.order_number')} htmlFor='tracking-order'>
        <AppInput
          id='tracking-order'
          value={values.order_number ?? ''}
          onValueChange={(order_number) => setValues((previous) => ({ ...previous, order_number }))}
          placeholder={t('page.delivery.tracking.order_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.delivery.tracking.fields.customer_name')} htmlFor='tracking-customer'>
        <AppInput
          id='tracking-customer'
          value={values.customer_name ?? ''}
          onValueChange={(customer_name) => setValues((previous) => ({ ...previous, customer_name }))}
          placeholder={t('page.delivery.tracking.customer_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.delivery.tracking.fields.product_name')} htmlFor='tracking-product'>
        <AppInput
          id='tracking-product'
          value={values.product_name ?? ''}
          onValueChange={(product_name) => setValues((previous) => ({ ...previous, product_name }))}
          placeholder={t('page.delivery.tracking.product_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.delivery.tracking.fields.waybill_registered_at')} htmlFor='tracking-waybill-range' wide>
        <AppDateRangePicker
          id='tracking-waybill-range'
          value={{ from: values.waybill_registration_date_from, to: values.waybill_registration_date_to }}
          onChange={(range) =>
            setValues((previous) => ({
              ...previous,
              waybill_registration_date_from: formatDateOnly(range?.from ? new Date(range.from) : null),
              waybill_registration_date_to: formatDateOnly(range?.to ? new Date(range.to) : null),
            }))
          }
          placeholder={t('page.delivery.shared.date_range_placeholder')}
          allowClear
          align='end'
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
