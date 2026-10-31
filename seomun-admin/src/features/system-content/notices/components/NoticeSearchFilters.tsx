import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import type { NoticeFilterFields } from '@/features/system-content/notices/api';
import { getNoticeTypeOptions } from '@/features/system-content/notices/constants';
import type { NoticeSearchFilterValues } from '@/features/system-content/notices/schemas';

// === Component ===

interface NoticeSearchFiltersProps {
  initialValues: NoticeSearchFilterValues;
  filterData?: NoticeFilterFields;
  onSearch: (values: NoticeSearchFilterValues) => void;
  onReset: () => void;
}

export function NoticeSearchFilters({ initialValues, filterData, onSearch, onReset }: NoticeSearchFiltersProps) {
  const { t } = useTranslation('page');

  // === State ===
  const [searchTerm, setSearchTerm] = useState<string>(initialValues.search_term ?? '');
  const [authorId, setAuthorId] = useState<string | undefined>(initialValues.author_id);
  const [type, setType] = useState<string | undefined>(initialValues.type);
  const [exposureStatus, setExposureStatus] = useState<string | undefined>(initialValues.exposure_status);

  // === Functions ===

  const handleSearch = () => {
    onSearch({
      search_term: searchTerm.trim() || undefined,
      author_id: authorId || undefined,
      type: type as NoticeSearchFilterValues['type'],
      exposure_status: exposureStatus as NoticeSearchFilterValues['exposure_status'],
      exposure_location: undefined,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setAuthorId(undefined);
    setType(undefined);
    setExposureStatus(undefined);
    onReset();
  };

  const exposureStatusOptions = [
    { value: 'exposed', label: t('notices.exposure_status_option.exposed') },
    { value: 'non-exposed', label: t('notices.exposure_status_option.non_exposed') },
  ];
  const authorOptions = filterData?.author_options?.map((o) => ({ value: String(o.value), label: o.label })) ?? [];
  const typeOptions = getNoticeTypeOptions(t);

  // === JSX ===

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('notices.search_filters.search')} htmlFor='notice-search-term'>
        <AppInput
          id='notice-search-term'
          placeholder={t('notices.search_filters.search_placeholder')}
          value={searchTerm}
          onValueChange={setSearchTerm}
          clearable
          prefix={<Search className='size-4' />}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notices.search_filters.author')} htmlFor='notice-author'>
        <AppSelect
          id='notice-author'
          value={authorId}
          onValueChange={(v) => setAuthorId((v as string) || undefined)}
          options={authorOptions}
          placeholder={t('notices.search_filters.author_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notices.search_filters.type')} htmlFor='notice-type'>
        <AppSelect
          id='notice-type'
          value={type}
          onValueChange={(v) => setType((v as string) || undefined)}
          options={typeOptions}
          placeholder={t('notices.search_filters.type_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('notices.search_filters.exposure_status')} htmlFor='notice-exposure-status'>
        <AppSelect
          id='notice-exposure-status'
          value={exposureStatus}
          onValueChange={(v) => setExposureStatus((v as string) || undefined)}
          options={exposureStatusOptions}
          placeholder={t('notices.search_filters.exposure_status_placeholder')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
