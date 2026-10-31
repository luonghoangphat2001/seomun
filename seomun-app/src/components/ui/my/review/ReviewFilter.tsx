'use client';

import { DateRangePicker, TabOption, Tabs } from '@/components/common';
import { DateRange } from 'react-day-picker';

type ReviewFilterProps = {
  periodTabs: TabOption[];
  tab: string;
  setTab: (value: string) => void;
  dateRange?: DateRange;
  setDateRange: (value?: DateRange) => void;
};

const ReviewFilter = ({ periodTabs, tab, setTab, dateRange, setDateRange }: ReviewFilterProps) => {
  return (
    <section className='hidden flex-wrap items-center justify-between gap-3 md:flex'>
      <div className='flex flex-wrap items-center gap-3'>
        <Tabs options={periodTabs} value={tab} onChange={setTab} />
        <DateRangePicker value={dateRange} onChange={setDateRange} className='w-55' />
      </div>
    </section>
  );
};

export default ReviewFilter;
