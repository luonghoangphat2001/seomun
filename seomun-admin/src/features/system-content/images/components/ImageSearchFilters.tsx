import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker/AppDateRangePicker';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import { FileType } from '@/enums';

import type { ImageFilterFields } from '../api/image.response';
import { IMAGE_CATEGORY_LABELS } from '../constants';
import type { ImageSearchFilterValues } from '../schemas';

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

const FILE_TYPE_VALUES = new Set<string>(Object.values(FileType));

// === Types ===

type ImageSearchFiltersProps = {
  initialValues: ImageSearchFilterValues;
  filterData?: ImageFilterFields;
  onSearch: (values: ImageSearchFilterValues) => void;
  onReset: () => void;
};

// === Component ===

export function ImageSearchFilters({ initialValues, filterData, onSearch, onReset }: ImageSearchFiltersProps) {
  const { t } = useTranslation('page');

  // === State ===

  const [name, setName] = useState<string>(initialValues.name ?? '');
  const [type, setType] = useState<string | undefined>(initialValues.type);
  const [registrantId, setRegistrantId] = useState<number | undefined>(initialValues.created_by);
  const [dateRange, setDateRange] = useState<RangeValue>(toRangeValue(initialValues.start_date, initialValues.end_date));

  const typeOptions = (filterData?.type_options ?? [])
    .filter((option) => FILE_TYPE_VALUES.has(option.value))
    .map((option) => ({ value: option.value, label: IMAGE_CATEGORY_LABELS[option.value as FileType](t) }));
  const registrantOptions = (filterData?.author_options ?? []).map((o) => ({ value: String(o.value), label: o.label }));

  // === Functions ===

  const handleSearch = () => {
    onSearch({
      name: name.trim() || undefined,
      type: type || undefined,
      created_by: registrantId,
      start_date: tsToDateStr(dateRange?.from),
      end_date: tsToDateStr(dateRange?.to),
    });
  };

  const handleReset = () => {
    setName('');
    setType(undefined);
    setRegistrantId(undefined);
    setDateRange(undefined);
    onReset();
  };

  // === JSX ===

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('images.search_filters.name')} htmlFor='image-name'>
        <AppInput
          id='image-name'
          placeholder={t('images.search_filters.name_placeholder')}
          value={name}
          onValueChange={setName}
          clearable
          prefix={<Search className='size-4' />}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('images.search_filters.type')} htmlFor='image-type'>
        <AppSelect
          id='image-type'
          value={type}
          onValueChange={setType}
          options={typeOptions}
          placeholder={t('images.search_filters.type_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('images.search_filters.registrant')} htmlFor='image-registrant'>
        <AppSelect
          id='image-registrant'
          value={registrantId !== undefined ? String(registrantId) : undefined}
          onValueChange={(v) => setRegistrantId(v ? Number(v) : undefined)}
          options={registrantOptions}
          placeholder={t('images.search_filters.registrant_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('images.search_filters.upload_date')} wide>
        <AppDateRangePicker value={dateRange} onChange={setDateRange} placeholder={t('images.search_filters.date_range_placeholder')} allowClear />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
