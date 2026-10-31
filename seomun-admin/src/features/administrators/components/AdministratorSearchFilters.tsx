import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';

import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import { EMPTY_ADMINISTRATOR_SEARCH_FILTER_VALUES, type AdministratorSearchFilterValues } from '../schemas';

interface AdministratorSearchFiltersProps {
  initialValues: AdministratorSearchFilterValues;
  onSearch: (values: AdministratorSearchFilterValues) => void;
  onReset: () => void;
}

export function AdministratorSearchFilters({ initialValues, onSearch, onReset }: AdministratorSearchFiltersProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const [values, setValues] = useState<AdministratorSearchFilterValues>(initialValues);

  const handleSearch = () => {
    onSearch(values);
  };

  const handleReset = () => {
    setValues({ ...EMPTY_ADMINISTRATOR_SEARCH_FILTER_VALUES });
    onReset();
  };

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={tCommon('filter.search_term')} htmlFor='administrator-search-query'>
        <AppInput
          id='administrator-search-query'
          value={values.search_term}
          onValueChange={(search_term) => setValues((previous) => ({ ...previous, search_term }))}
          placeholder={t('administrators.filters.keyword_placeholder')}
          prefix={<Search className='size-4' />}
          size='md'
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
