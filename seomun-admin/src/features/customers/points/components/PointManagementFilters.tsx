import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDateRangePicker } from '@/components/shared/app-date-range-picker';
import { AppInput } from '@/components/shared/app-input';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import { AppSelect } from '@/components/shared/app-select';

import { getPointPeriodPresetOptions, getPointTransactionTypeOptions } from '../../constants';
import type { PointManagementFilterFormValues } from '../schemas';

type PointManagementFiltersProps = {
  value: PointManagementFilterFormValues;
  onChange: (value: PointManagementFilterFormValues) => void;
  onPresetChange: (preset: PointManagementFilterFormValues['issue_date_preset'], current: PointManagementFilterFormValues) => void;
};

export function PointManagementFilters({ value, onChange, onPresetChange }: PointManagementFiltersProps) {
  const { t } = useTranslation();
  const transactionTypeOptions = getPointTransactionTypeOptions(t);
  const pointPeriodPresetOptions = getPointPeriodPresetOptions(t);

  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const patchFilters = (patch: Partial<PointManagementFilterFormValues>) => {
    setDraft((previous) => ({ ...previous, ...patch }));
  };

  const handleSearch = () => {
    onChange({ ...draft, page: 1 });
  };

  const handleReset = () => {
    onChange({
      page: 1,
      per_page: value.per_page,
      category: '',
      detail_category: '',
      order_number: '',
      name: '',
      contact: '',
      email: '',
      issue_date_preset: '',
      date_from: '',
      date_to: '',
    });
  };

  const getManualDatePreset = (dateFrom: string, dateTo: string): PointManagementFilterFormValues['issue_date_preset'] =>
    dateFrom || dateTo ? 'custom' : '';

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('page.customers.points.filters.detail_category')} htmlFor='point-category'>
        <AppSelect
          id='point-category'
          value={draft.category || undefined}
          onValueChange={(nextValue) => patchFilters({ category: nextValue ?? '', detail_category: '' })}
          options={transactionTypeOptions}
          placeholder={t('page.customers.points.filters.all_categories')}
          clearable
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('page.customers.points.filters.order_number')} htmlFor='point-order-number'>
        <AppInput
          id='point-order-number'
          value={draft.order_number}
          onChange={(event) => patchFilters({ order_number: event.target.value })}
          placeholder={t('page.customers.points.filters.order_number_placeholder')}
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('page.customers.points.filters.name')} htmlFor='point-name'>
        <AppInput
          id='point-name'
          value={draft.name}
          onChange={(event) => patchFilters({ name: event.target.value })}
          placeholder={t('page.customers.points.filters.name_placeholder')}
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('page.customers.points.filters.contact')} htmlFor='point-contact'>
        <AppInput
          id='point-contact'
          value={draft.contact}
          onChange={(event) => patchFilters({ contact: event.target.value })}
          placeholder={t('page.customers.points.filters.contact_placeholder')}
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('page.customers.points.filters.email')} htmlFor='point-email'>
        <AppInput
          id='point-email'
          value={draft.email}
          onChange={(event) => patchFilters({ email: event.target.value })}
          placeholder={t('page.customers.points.filters.email_placeholder')}
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('page.customers.points.filters.date_range')} htmlFor='point-date-range' wide>
        <AppDateRangePicker
          id='point-date-range'
          value={{ from: draft.date_from || undefined, to: draft.date_to || undefined }}
          onChange={(range) => {
            const nextFrom = range?.from ? format(range.from, 'yyyy-MM-dd') : '';
            const nextTo = range?.to ? format(range.to, 'yyyy-MM-dd') : '';
            patchFilters({
              issue_date_preset: getManualDatePreset(nextFrom, nextTo),
              date_from: nextFrom,
              date_to: nextTo,
            });
          }}
          placeholder={t('page.customers.points.filters.date_range_placeholder')}
          allowClear
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('page.customers.points.filters.issue_date_preset')} className='sm:max-w-none'>
        <div className='flex flex-wrap gap-2'>
          {pointPeriodPresetOptions.map((option) => (
            <AppButton
              key={option.value}
              type='button'
              size='sm'
              variant={draft.issue_date_preset === option.value ? 'default' : 'outline'}
              onClick={() => onPresetChange(draft.issue_date_preset === option.value ? '' : option.value, draft)}
            >
              {option.label}
            </AppButton>
          ))}
        </div>
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
