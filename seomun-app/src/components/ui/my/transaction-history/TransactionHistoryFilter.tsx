'use client';

import { DateRangePicker, Input, TabOption, Tabs } from '@/components/common';
import { Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { DateRange } from 'react-day-picker';

type TransactionHistoryFilterProps = {
  periodTabs: TabOption[];
  tab: string;
  setTab: (value: string) => void;
  dateRange?: DateRange;
  setDateRange: (value?: DateRange) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
};

const TransactionHistoryFilter = ({
  periodTabs,
  tab,
  setTab,
  dateRange,
  setDateRange,
  searchValue,
  setSearchValue,
}: TransactionHistoryFilterProps) => {
  const t = useTranslations();

  return (
    <section className='hidden flex-wrap items-center justify-between gap-3 md:flex'>
      <div className='flex flex-wrap items-center gap-3'>
        <Tabs options={periodTabs} value={tab} onChange={setTab} />
        <DateRangePicker value={dateRange} onChange={setDateRange} className='w-55' />
        <Input
          placeholder={t('placeholder.search_order_name')}
          suffix={<Search className='text-text-secondary h-5 w-5' />}
          containerClassName='w-[320px]'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
    </section>
  );
};

export default TransactionHistoryFilter;
