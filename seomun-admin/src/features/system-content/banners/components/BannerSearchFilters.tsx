import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker/AppDateRangePicker';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import type { BannerFilterFields } from '@/features/system-content/banners/api';
import { BANNER_EXPOSURE_STATUS_OPTIONS } from '@/features/system-content/banners/constants';
import type { BannerSearchFilterValues } from '@/features/system-content/banners/schemas';

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

// === Component ===

interface BannerSearchFiltersProps {
  initialValues: BannerSearchFilterValues;
  filterData?: BannerFilterFields;
  onSearch: (values: BannerSearchFilterValues) => void;
  onReset: () => void;
}

export function BannerSearchFilters({ initialValues, filterData, onSearch, onReset }: BannerSearchFiltersProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  // === State ===
  const [bannerName, setBannerName] = useState<string>(initialValues.banner_name ?? '');
  const [status, setStatus] = useState<BannerSearchFilterValues['status']>(initialValues.status);
  const [exposurePeriod, setExposurePeriod] = useState<RangeValue>(
    toRangeValue(initialValues.exposure_period_from, initialValues.exposure_period_to),
  );

  // === Functions ===

  const handleSearch = () => {
    onSearch({
      banner_name: bannerName.trim() || undefined,
      status,
      exposure_period_from: tsToDateStr(exposurePeriod?.from),
      exposure_period_to: tsToDateStr(exposurePeriod?.to),
    });
  };

  const handleReset = () => {
    setBannerName('');
    setStatus(undefined);
    setExposurePeriod(undefined);
    onReset();
  };

  const statusOptions = (filterData?.status_options ?? []).map((o) => ({
    value: o.value,
    label: BANNER_EXPOSURE_STATUS_OPTIONS[o.value as keyof typeof BANNER_EXPOSURE_STATUS_OPTIONS]?.(t) ?? o.label,
  }));

  // === JSX ===

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('banners.search_filters.search')} htmlFor='banner-search-name'>
        <AppInput
          id='banner-search-name'
          placeholder={t('banners.search_filters.search_placeholder')}
          value={bannerName}
          onValueChange={setBannerName}
          clearable
          prefix={<Search className='size-4' />}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('banners.search_filters.status')} htmlFor='banner-status'>
        <AppSelect
          id='banner-status'
          value={status}
          onValueChange={(v) => setStatus(((v as string) || undefined) as BannerSearchFilterValues['status'])}
          options={statusOptions}
          placeholder={t('banners.search_filters.status_placeholder')}
          emptyText={tCommon('message.no_options_found')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('banners.search_filters.exposure_period')} wide>
        <AppDateRangePicker
          value={exposurePeriod}
          onChange={setExposurePeriod}
          placeholder={t('banners.search_filters.date_range_placeholder')}
          allowClear
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
