import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { USER_LIMIT_STATUS_LABELS } from '../constants';
import { UserLimitStatus } from '../enums';
import type { PostPaymentLimitSearchFilterValues } from '../schemas';

type PostPaymentLimitSearchFiltersProps = {
  initialValues: PostPaymentLimitSearchFilterValues;
  onSearch: (values: PostPaymentLimitSearchFilterValues) => void;
  onReset: () => void;
};

export function PostPaymentLimitSearchFilters({ initialValues, onSearch, onReset }: PostPaymentLimitSearchFiltersProps) {
  const { t } = useTranslation('page');

  const statusOptions = Object.values(UserLimitStatus).map((value) => ({
    value,
    label: USER_LIMIT_STATUS_LABELS[value](t),
  }));

  const [name, setName] = useState<string>(initialValues.name ?? '');
  const [status, setStatus] = useState<UserLimitStatus | undefined>(initialValues.status);

  const handleSearch = () => {
    onSearch({ name: name.trim() || undefined, status });
  };

  const handleReset = () => {
    setName('');
    setStatus(undefined);
    onReset();
  };

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('post_payment_limit.filters.name', 'Customer Name')} htmlFor='ppl-name'>
        <AppInput
          id='ppl-name'
          placeholder={t('post_payment_limit.filters.name_placeholder', 'Search by name or email')}
          value={name}
          onValueChange={setName}
          clearable
          prefix={<Search className='size-4' />}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('post_payment_limit.filters.status', 'Status')} htmlFor='ppl-status'>
        <AppSelect
          id='ppl-status'
          value={status}
          onValueChange={(v) => setStatus((v || undefined) as UserLimitStatus | undefined)}
          options={statusOptions}
          placeholder={t('post_payment_limit.filters.all_statuses', 'All statuses')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
