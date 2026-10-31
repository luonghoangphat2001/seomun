import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import type { NumberOptions } from '@/types/api';

import { OrderShippingMethod } from '@/features/orders/enums';

import { SHIPMENT_TYPE_TRANSLATION_KEYS } from '../../constants';
import { ShipmentFilterStatus, ShipmentType } from '../../enums';
import { EMPTY_SHIPMENT_SEARCH_FILTER_VALUES, type ShipmentSearchFilterValues } from '../schemas';

// === Type definitions ===

interface ShipmentSearchFiltersProps {
  initialValues: ShipmentSearchFilterValues;
  managerOptions: NumberOptions[];
  onSearch: (values: ShipmentSearchFilterValues) => void;
  onReset: () => void;
}

// === Component ===

export function ShipmentSearchFilters({ initialValues, managerOptions, onSearch, onReset }: ShipmentSearchFiltersProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<ShipmentSearchFilterValues>(initialValues);
  console.log('managerOptions', managerOptions);

  // const dateRangeValue = useMemo(
  //   () => ({
  //     from: values.shipment_date_from ? new Date(values.shipment_date_from).getTime() : undefined,
  //     to: values.shipment_date_to ? new Date(values.shipment_date_to).getTime() : undefined,
  //   }),
  //   [values.shipment_date_from, values.shipment_date_to],
  // );

  const typeOptions = useMemo(
    () => Object.values(ShipmentType).map((type) => ({ value: type, label: t(SHIPMENT_TYPE_TRANSLATION_KEYS[type]) })),
    [t],
  );

  const statusOptions = useMemo(
    () => Object.values(ShipmentFilterStatus).map((status) => ({ value: status, label: t(`page.delivery.shipments.filter_status.${status}`) })),
    [t],
  );

  const shippingMethodOptions = useMemo(
    () => Object.values(OrderShippingMethod).map((method) => ({ value: method, label: t(`page.orders.detail.shipping_method.${method}`) })),
    [t],
  );

  // const handleDateRangeChange = (range: { from?: number; to?: number } | undefined) => {
  //   setValues((prev) => ({
  //     ...prev,
  //     shipment_date_from: range?.from ? format(new Date(range.from), 'yyyy-MM-dd') : undefined,
  //     shipment_date_to: range?.to ? format(new Date(range.to), 'yyyy-MM-dd') : undefined,
  //   }));
  // };

  const handleSearch = () => {
    onSearch(values);
  };

  const handleReset = () => {
    setValues({ ...EMPTY_SHIPMENT_SEARCH_FILTER_VALUES });
    onReset();
  };

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('page.delivery.shipments.fields.shipment_type')} htmlFor='shipment-type'>
        <AppSelect
          id='shipment-type'
          value={values.shipment_type}
          onValueChange={(shipment_type) => setValues((prev) => ({ ...prev, shipment_type }))}
          options={typeOptions}
          placeholder={t('page.delivery.shipments.filters.all_types')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.delivery.shipments.fields.status')} htmlFor='shipment-status'>
        <AppSelect
          id='shipment-status'
          value={values.shipment_status}
          onValueChange={(shipment_status) => setValues((prev) => ({ ...prev, shipment_status }))}
          options={statusOptions}
          placeholder={t('page.delivery.shared.all_statuses')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.delivery.shipments.fields.shipping_method')} htmlFor='shipment-shipping-method'>
        <AppSelect
          id='shipment-shipping-method'
          value={values.shipping_method}
          onValueChange={(shipping_method) => setValues((prev) => ({ ...prev, shipping_method }))}
          options={shippingMethodOptions}
          placeholder={t('page.delivery.shipments.filters.all_shipping_methods')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('common.filter.search_term')} htmlFor='shipment-search-term'>
        <AppInput
          id='shipment-search-term'
          value={values.search_term}
          onValueChange={(search_term) => setValues((prev) => ({ ...prev, search_term }))}
          placeholder={t('page.delivery.shipments.filters.search_term_placeholder')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
