import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { AppSelect, type AppSelectOption } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import type { OutsourcingSearchType } from '@/features/outsourcing/api';
import type { OutsourcingListSearch } from '@/features/outsourcing/schemas';

interface OutsourcingSearchFiltersProps {
  initialValues: OutsourcingListSearch;
  onSearch: (values: Pick<OutsourcingListSearch, 'search_type' | 'keyword' | 'is_active'>) => void;
  onReset: () => void;
}

export function OutsourcingSearchFilters({ initialValues, onSearch, onReset }: OutsourcingSearchFiltersProps) {
  const { t } = useTranslation('page');

  const SEARCH_TYPE_OPTIONS: AppSelectOption<OutsourcingSearchType>[] = useMemo(
    () => [
      { value: 'name', label: t('outsourcing.columns.company_name') },
      { value: 'work_details', label: t('outsourcing.columns.work_details') },
      { value: 'representative_name', label: t('outsourcing.columns.representative') },
      { value: 'email', label: t('outsourcing.columns.email') },
      { value: 'contact', label: t('outsourcing.columns.contact') },
      { value: 'address', label: t('outsourcing.columns.address') },
    ],
    [t],
  );

  const ACTIVE_STATUS_OPTIONS: AppSelectOption<'true' | 'false'>[] = useMemo(
    () => [
      { value: 'true', label: t('outsourcing.status.active') },
      { value: 'false', label: t('outsourcing.status.inactive') },
    ],
    [t],
  );
  const [searchType, setSearchType] = useState<OutsourcingSearchType | undefined>(initialValues.search_type);
  const [keyword, setKeyword] = useState<string>(initialValues.keyword || '');
  const [activeStatus, setActiveStatus] = useState<'true' | 'false' | undefined>(
    initialValues.is_active === true ? 'true' : initialValues.is_active === false ? 'false' : undefined,
  );

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();

    onSearch({
      search_type: trimmedKeyword ? (searchType ?? 'name') : undefined,
      keyword: trimmedKeyword || undefined,
      is_active: activeStatus === 'true' ? true : activeStatus === 'false' ? false : undefined,
    });
  };

  const handleReset = () => {
    setSearchType(undefined);
    setKeyword('');
    setActiveStatus(undefined);
    onReset();
  };

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('outsourcing.filters.search_type')} htmlFor='outsourcing-search-type'>
        <AppSelect
          id='outsourcing-search-type'
          value={searchType}
          onValueChange={setSearchType}
          options={SEARCH_TYPE_OPTIONS}
          placeholder={t('outsourcing.columns.company_name')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('outsourcing.filters.active_status')} htmlFor='outsourcing-active-status'>
        <AppSelect
          id='outsourcing-active-status'
          value={activeStatus}
          onValueChange={setActiveStatus}
          options={ACTIVE_STATUS_OPTIONS}
          placeholder={t('outsourcing.filters.all_statuses')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('outsourcing.filters.search')} htmlFor='outsourcing-search-keyword'>
        <AppInput
          id='outsourcing-search-keyword'
          placeholder={t('outsourcing.filters.search_placeholder')}
          value={keyword}
          onValueChange={setKeyword}
          clearable
          prefix={<Search className='size-4' />}
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
