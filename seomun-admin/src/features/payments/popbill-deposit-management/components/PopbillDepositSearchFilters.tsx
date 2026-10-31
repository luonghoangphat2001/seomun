import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import type { PopbillDepositSearchFilterValues } from '../schemas';

type PopbillDepositSearchFiltersProps = {
  initialValues: PopbillDepositSearchFilterValues;
  onSearch: (values: PopbillDepositSearchFilterValues) => void;
  onReset: () => void;
};

export function PopbillDepositSearchFilters({ initialValues, onSearch, onReset }: PopbillDepositSearchFiltersProps) {
  const { t } = useTranslation('page');
  const [status, setStatus] = useState<PopbillDepositSearchFilterValues['status']>(initialValues.status);
  const [bankAccountKey, setBankAccountKey] = useState<PopbillDepositSearchFilterValues['bank_account_key']>(initialValues.bank_account_key);

  const statusOptions = [
    { value: 'unmatched', label: t('payments.popbill_deposits.status.unmatched', 'Unmatched') },
    { value: 'matched', label: t('payments.popbill_deposits.status.matched', 'Matched') },
  ];
  const bankOptions = [
    { value: 'woori', label: t('payments.popbill_deposits.banks.woori', 'Woori Bank') },
    { value: 'hana', label: t('payments.popbill_deposits.banks.hana', 'Hana Bank') },
    { value: 'im', label: t('payments.popbill_deposits.banks.im', 'iM Bank') },
  ];

  const handleSearch = () => onSearch({ status, bank_account_key: bankAccountKey });

  const handleReset = () => {
    setStatus(undefined);
    setBankAccountKey(undefined);
    onReset();
  };

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('payments.popbill_deposits.filters.status', 'Reconciliation status')} htmlFor='popbill-deposit-status'>
        <AppSelect
          id='popbill-deposit-status'
          value={status}
          onValueChange={(value) => setStatus((value || undefined) as PopbillDepositSearchFilterValues['status'])}
          options={statusOptions}
          placeholder={t('payments.popbill_deposits.filters.all_statuses', 'All statuses')}
          clearable
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('payments.popbill_deposits.filters.bank', 'Receiving bank')} htmlFor='popbill-deposit-bank'>
        <AppSelect
          id='popbill-deposit-bank'
          value={bankAccountKey}
          onValueChange={(value) => setBankAccountKey((value || undefined) as PopbillDepositSearchFilterValues['bank_account_key'])}
          options={bankOptions}
          placeholder={t('payments.popbill_deposits.filters.all_banks', 'All banks')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
