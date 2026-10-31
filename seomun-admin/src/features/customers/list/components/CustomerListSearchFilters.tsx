import { AppInput } from '@/components/shared/app-input';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import { AppSelect } from '@/components/shared/app-select';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getCustomerStatusOptions } from '../../constants';
import type { CustomerStatus } from '../../enums';
import type { CustomerListSearch } from '../schemas';

type CustomerListSearchFiltersProps = {
  search: CustomerListSearch;
  onSubmit: (filter: Partial<CustomerListSearch>) => void;
  onReset: () => void;
};

type CustomerListFilterDraft = Pick<CustomerListSearch, 'search_term' | 'status'>;

function getFilterDraft(search: CustomerListSearch): CustomerListFilterDraft {
  return {
    search_term: search.search_term,
    status: search.status,
  };
}

export function CustomerListSearchFilters({ search, onSubmit, onReset }: CustomerListSearchFiltersProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CustomerListFilterDraft>(() => getFilterDraft(search));

  const statusOptions = getCustomerStatusOptions(t);
  const updateDraft = (patch: Partial<CustomerListFilterDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = () => {
    onSubmit(draft);
  };

  const handleReset = () => {
    setDraft({});
    onReset();
  };

  useEffect(() => {
    setDraft(getFilterDraft(search));
  }, [search]);

  return (
    <AppSearchFilter onSearch={handleSubmit} onReset={handleReset}>
      <AppSearchFilterField label={t('page.customers.list.filters.search_term')} htmlFor='customer-search-term'>
        <AppInput
          id='customer-search-term'
          value={draft.search_term ?? ''}
          onChange={(event) => updateDraft({ search_term: event.target.value || undefined })}
          placeholder={t('page.customers.list.filters.search_term_placeholder')}
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('page.customers.list.filters.status')} htmlFor='customer-status'>
        <AppSelect
          id='customer-status'
          value={draft.status}
          onValueChange={(value) => updateDraft({ status: value as CustomerStatus | undefined })}
          options={statusOptions}
          placeholder={t('page.customers.list.filters.all_status')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
