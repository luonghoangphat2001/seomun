import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker/AppDateRangePicker';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import type { PopupFilterFields } from '../api/popup.response';
import { POPUP_EXPOSURE_STATUS_OPTIONS } from '../constants';
import type { PopupSearchFilterValues } from '../schemas';

// === Variables ===

type RangeValue = { from?: number; to?: number } | undefined;

const toRangeValue = (from?: string, to?: string): RangeValue => {
  if (!from && !to) return undefined;
  return {
    from: from ? parseISO(from).getTime() : undefined,
    to: to ? parseISO(to).getTime() : undefined,
  };
};

const tsToDateStr = (ts?: number): string | undefined => (ts ? format(new Date(ts), 'yyyy-MM-dd') : undefined);

// === Types ===

interface PopupSearchFiltersProps {
  initialValues: PopupSearchFilterValues;
  filterData?: PopupFilterFields;
  onSearch: (values: PopupSearchFilterValues) => void;
  onReset: () => void;
}

// === Component ===

export function PopupSearchFilters({ initialValues, filterData, onSearch, onReset }: PopupSearchFiltersProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const noOptionsText = tCommon('message.no_options_found');

  // === State ===

  const [popupName, setPopupName] = useState<string>(initialValues.popup_name ?? '');
  const [exposureLocation, setExposureLocation] = useState<string | undefined>(initialValues.exposure_location);
  const [status, setStatus] = useState<string | undefined>(initialValues.status);
  const [registrantId, setRegistrantId] = useState<number | undefined>(initialValues.registrant_id);
  const [exposurePeriod, setExposurePeriod] = useState<RangeValue>(
    toRangeValue(initialValues.exposure_period_from, initialValues.exposure_period_to),
  );

  // === Functions ===

  const handleSearch = () => {
    onSearch({
      popup_name: popupName.trim() || undefined,
      exposure_location: exposureLocation || undefined,
      status: status as PopupSearchFilterValues['status'],
      registrant_id: registrantId,
      exposure_period_from: tsToDateStr(exposurePeriod?.from),
      exposure_period_to: tsToDateStr(exposurePeriod?.to),
    });
  };

  const handleReset = () => {
    setPopupName('');
    setExposureLocation(undefined);
    setStatus(undefined);
    setRegistrantId(undefined);
    setExposurePeriod(undefined);
    onReset();
  };

  //const exposureLocationOptions = getPopupExposureLocationOptions(t);
  const statusOptions = (filterData?.status_options ?? []).map((o) => ({
    value: o.value,
    label: POPUP_EXPOSURE_STATUS_OPTIONS[o.value as keyof typeof POPUP_EXPOSURE_STATUS_OPTIONS]?.(t) ?? o.label,
  }));
  //const registrantOptions = (filterData?.registrant_options ?? []).map((o) => ({ value: String(o.value), label: o.label }));

  // === JSX ===

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('popups.search_filters.status')} htmlFor='popup-status'>
        <AppSelect
          id='popup-status'
          value={status}
          onValueChange={(v) => setStatus((v as string) || undefined)}
          options={statusOptions}
          placeholder={t('popups.search_filters.status_placeholder')}
          emptyText={noOptionsText}
          clearable
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('popups.search_filters.exposure_period')} wide>
        <AppDateRangePicker
          value={exposurePeriod}
          onChange={setExposurePeriod}
          placeholder={t('popups.search_filters.date_range_placeholder')}
          allowClear
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('popups.search_filters.search')} htmlFor='popup-search-name'>
        <AppInput
          id='popup-search-name'
          placeholder={t('popups.search_filters.search_placeholder')}
          value={popupName}
          onValueChange={setPopupName}
          clearable
          prefix={<Search className='size-4' />}
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
