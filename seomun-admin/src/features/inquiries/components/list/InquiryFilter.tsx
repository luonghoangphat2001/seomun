/* eslint-disable react-hooks/set-state-in-effect */
import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker/AppDateRangePicker';
import { AppInput } from '@/components/shared/app-input';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import { AppSelect } from '@/components/shared/app-select';
import { getInquiryStatusLabel, getInquiryTypeLabel } from '../../constants';
import { InquiryStatus, InquiryType } from '../../enums';
import type { InquiryListSearch } from '../../schemas';

type RangeValue = { from?: number; to?: number } | undefined;

const toRangeValue = (from?: string, to?: string): RangeValue => {
  if (!from && !to) return undefined;
  return {
    from: from ? parseISO(from).getTime() : undefined,
    to: to ? parseISO(to).getTime() : undefined,
  };
};

const tsToDateStr = (ts?: number): string | undefined => (ts ? format(new Date(ts), 'yyyy-MM-dd') : undefined);

type InquiryFilterProps = {
  initialValues: InquiryListSearch;
  onSearch: (values: Pick<InquiryListSearch, 'inquiry_type' | 'inquirer_name' | 'status' | 'created_from' | 'created_to'>) => void;
  onReset: () => void;
};

export function InquiryFilter({ initialValues, onSearch, onReset }: InquiryFilterProps) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const [inquiryType, setInquiryType] = useState<InquiryType | undefined>(initialValues.inquiry_type);
  const [inquirerName, setInquirerName] = useState(initialValues.inquirer_name ?? '');
  const [status, setStatus] = useState<InquiryStatus | undefined>(initialValues.status);
  const [registrationPeriod, setRegistrationPeriod] = useState<RangeValue>(toRangeValue(initialValues.created_from, initialValues.created_to));

  useEffect(() => {
    setInquiryType(initialValues.inquiry_type);
    setInquirerName(initialValues.inquirer_name ?? '');
    setStatus(initialValues.status);
    setRegistrationPeriod(toRangeValue(initialValues.created_from, initialValues.created_to));
  }, [initialValues]);

  const submit = () => {
    onSearch({
      inquiry_type: inquiryType,
      inquirer_name: inquirerName.trim() || undefined,
      status,
      created_from: tsToDateStr(registrationPeriod?.from),
      created_to: tsToDateStr(registrationPeriod?.to),
    });
  };

  const reset = () => {
    setInquiryType(undefined);
    setInquirerName('');
    setStatus(undefined);
    setRegistrationPeriod(undefined);
    onReset();
  };

  return (
    <AppSearchFilter onSearch={submit} onReset={reset}>
      <AppSearchFilterField label={t('page.inquiries.filters.registration_date')} htmlFor='inquiry-registration-date' wide>
        <AppDateRangePicker
          id='inquiry-registration-date'
          value={registrationPeriod}
          onChange={setRegistrationPeriod}
          placeholder={t('page.inquiries.filters.date_from')}
          allowClear
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('page.inquiries.filters.inquiry_type')} htmlFor='inquiry-type'>
        <AppSelect
          id='inquiry-type'
          value={inquiryType}
          onValueChange={(value) => setInquiryType(value as InquiryType | undefined)}
          options={Object.values(InquiryType).map((value) => ({ value, label: getInquiryTypeLabel(t, value) }))}
          placeholder={t('page.inquiries.filters.all_types')}
          clearable
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('page.inquiries.filters.inquirer_name')} htmlFor='inquiry-inquirer-name'>
        <AppInput
          id='inquiry-inquirer-name'
          value={inquirerName}
          onValueChange={setInquirerName}
          placeholder={t('page.inquiries.filters.inquirer_name_placeholder')}
          clearable
          prefix={<Search className='size-4' />}
        />
      </AppSearchFilterField>
      <AppSearchFilterField label={t('page.inquiries.filters.status')} htmlFor='inquiry-status'>
        <AppSelect
          id='inquiry-status'
          value={status}
          onValueChange={(value) => setStatus(value as InquiryStatus | undefined)}
          options={Object.values(InquiryStatus).map((value) => ({ value, label: getInquiryStatusLabel(t, value) }))}
          placeholder={t('page.inquiries.filters.all_status')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
