import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import type { GuideFilterFields } from '../api/guide.response';
import { getGuideExposureStatusOptions } from '../constants';
import type { GuideSearchFilterValues } from '../schemas';

// === Types ===

type GuideSearchFiltersProps = {
  initialValues: GuideSearchFilterValues;
  filterData?: GuideFilterFields;
  onSearch: (values: GuideSearchFilterValues) => void;
  onReset: () => void;
};

// === Component ===

export function GuideSearchFilters({ initialValues, filterData, onSearch, onReset }: GuideSearchFiltersProps) {
  const { t } = useTranslation('page');

  // === State ===

  const [searchTerm, setSearchTerm] = useState<string>(initialValues.search_term ?? '');
  const [authorId, setAuthorId] = useState<number | undefined>(initialValues.author_id);
  const [exposureStatus, setExposureStatus] = useState<GuideSearchFilterValues['exposure_status']>(initialValues.exposure_status);

  const postingStatusOptions = getGuideExposureStatusOptions(t);
  const authorOptions = (filterData?.author_options ?? []).map((o) => ({ value: String(o.value), label: o.label }));

  // === Functions ===

  const handleSearch = () => {
    onSearch({
      search_term: searchTerm.trim() || undefined,
      author_id: authorId,
      exposure_status: exposureStatus,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setAuthorId(undefined);
    setExposureStatus(undefined);
    onReset();
  };

  // === JSX ===

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('guides.search_filters.search', 'Search')} htmlFor='guide-search-term'>
        <AppInput
          id='guide-search-term'
          placeholder={t('guides.search_filters.search_placeholder', 'Search by title...')}
          value={searchTerm}
          onValueChange={setSearchTerm}
          clearable
          prefix={<Search className='size-4' />}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('guides.search_filters.author', 'Author')} htmlFor='guide-author-id'>
        <AppSelect
          id='guide-author-id'
          value={authorId != null ? String(authorId) : undefined}
          onValueChange={(v) => setAuthorId(v ? Number(v) : undefined)}
          options={authorOptions}
          placeholder={t('guides.search_filters.author_placeholder', 'All authors')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('guides.search_filters.exposure_status', 'Exposure Status')} htmlFor='guide-exposure-status'>
        <AppSelect
          id='guide-exposure-status'
          value={exposureStatus}
          onValueChange={(v) => setExposureStatus(((v as string) || undefined) as GuideSearchFilterValues['exposure_status'])}
          options={postingStatusOptions}
          placeholder={t('guides.search_filters.exposure_status_placeholder', 'All statuses')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
