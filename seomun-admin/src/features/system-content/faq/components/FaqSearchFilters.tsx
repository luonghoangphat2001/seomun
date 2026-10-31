import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDateRangePicker } from '@/components/shared/app-date-range-picker/AppDateRangePicker';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import type { FaqFiltersRESP } from '../api/faq.response';
import { getFaqCategoryOptions, getFaqExposureStatusOptions } from '../constants';
import type { FaqCategory } from '../enums';
import type { FaqSearchFilterValues } from '../schemas';

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

// === Component ===

type FaqSearchFiltersProps = {
  initialValues: FaqSearchFilterValues;
  filterData?: FaqFiltersRESP;
  onSearch: (values: FaqSearchFilterValues) => void;
  onReset: () => void;
};

export function FaqSearchFilters({ initialValues, filterData, onSearch, onReset }: FaqSearchFiltersProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  // === State ===
  const [title, setTitle] = useState<string>(initialValues.title ?? '');
  const [category, setCategory] = useState<FaqCategory | undefined>(initialValues.faq_category);
  const [authorId, setAuthorId] = useState<number | undefined>(initialValues.author_id);
  const [postingStatus, setPostingStatus] = useState<FaqSearchFilterValues['posting_status']>(initialValues.posting_status);
  const [registrationDate, setRegistrationDate] = useState<RangeValue>(
    toRangeValue(initialValues.registration_date_from, initialValues.registration_date_to),
  );

  // === Functions ===

  const handleSearch = () => {
    onSearch({
      title: title.trim() || undefined,
      faq_category: category,
      author_id: authorId,
      posting_status: postingStatus,
      registration_date_from: tsToDateStr(registrationDate?.from),
      registration_date_to: tsToDateStr(registrationDate?.to),
    });
  };

  const handleReset = () => {
    setTitle('');
    setCategory(undefined);
    setAuthorId(undefined);
    setPostingStatus(undefined);
    setRegistrationDate(undefined);
    onReset();
  };

  const categoryOptions = getFaqCategoryOptions(t);
  const authorOptions = (filterData?.registrant_options ?? []).map((o) => ({ value: String(o.value), label: o.label }));
  const statusOptions = getFaqExposureStatusOptions(t);

  // === JSX ===

  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('faqs.search_filters.search')} htmlFor='faq-search-title'>
        <AppInput
          id='faq-search-title'
          placeholder={t('faqs.search_filters.search_placeholder')}
          value={title}
          onValueChange={setTitle}
          clearable
          prefix={<Search className='size-4' />}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('faqs.search_filters.category')} htmlFor='faq-category'>
        <AppSelect
          id='faq-category'
          value={category}
          onValueChange={(v) => setCategory(((v as string) || undefined) as FaqCategory | undefined)}
          options={categoryOptions}
          placeholder={t('faqs.search_filters.category_placeholder')}
          emptyText={tCommon('message.no_options_found')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('faqs.search_filters.author')} htmlFor='faq-author-id'>
        <AppSelect
          id='faq-author-id'
          value={authorId != null ? String(authorId) : undefined}
          onValueChange={(v) => setAuthorId(v ? Number(v) : undefined)}
          options={authorOptions}
          placeholder={t('faqs.search_filters.author_placeholder')}
          emptyText={tCommon('message.no_options_found')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('faqs.search_filters.status')} htmlFor='faq-posting-status'>
        <AppSelect
          id='faq-posting-status'
          value={postingStatus}
          onValueChange={(v) => setPostingStatus(((v as string) || undefined) as FaqSearchFilterValues['posting_status'])}
          options={statusOptions}
          placeholder={t('faqs.search_filters.status_placeholder')}
          emptyText={tCommon('message.no_options_found')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('faqs.search_filters.registration_date')} wide>
        <AppDateRangePicker
          value={registrationDate}
          onChange={setRegistrationDate}
          placeholder={t('faqs.search_filters.date_range_placeholder')}
          allowClear
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
