'use client';

import { DateRangePicker, Input, Select, TabOption, Tabs } from '@/components/common';
import { Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { DateRange } from 'react-day-picker';
import { PointTransactionCategory } from '@/apis/points/points.request';

type PointFilterProps = {
  periodTabs: TabOption[];
  tab: string;
  setTab: (value: string) => void;
  category: PointTransactionCategory | 'all';
  setCategory: (value: PointTransactionCategory | 'all') => void;
  dateRange?: DateRange;
  setDateRange: (value?: DateRange) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
};

const PointFilter = ({
  periodTabs,
  tab,
  setTab,
  category,
  setCategory,
  dateRange,
  setDateRange,
  searchValue,
  setSearchValue,
}: PointFilterProps) => {
  const t = useTranslations('my');

  const categoryOptions = [
    { label: t('point_category_all'), value: 'all' },
    { label: t('point_category_signup'), value: 'signup' },
    { label: t('point_category_expire'), value: 'expire' },
    { label: t('point_category_invite'), value: 'invite' },
    { label: t('point_category_manual'), value: 'manual' },
    { label: t('point_category_order'), value: 'order' },
  ];

  return (
    <section className='hidden flex-wrap items-center justify-between gap-3 md:flex'>
      <div className='flex flex-wrap items-center gap-3'>
        <Select
          options={categoryOptions}
          className='w-32'
          placeholder={t('point_category_all')}
          value={category}
          onChange={(value) => setCategory(value as PointTransactionCategory | 'all')}
        />
        <Tabs options={periodTabs} value={tab} onChange={setTab} />
        <DateRangePicker value={dateRange} onChange={setDateRange} className='w-55' />
        <Input
          placeholder={t('point_search_placeholder')}
          suffix={<Search className='text-text-secondary h-5 w-5' />}
          containerClassName='w-[320px]'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
    </section>
  );
};

export default PointFilter;
