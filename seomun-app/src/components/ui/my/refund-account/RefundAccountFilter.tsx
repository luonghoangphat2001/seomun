'use client';

import { DateRangePicker, TabOption, Tabs } from '@/components/common';
import { DateRange } from 'react-day-picker';

type RefundAccountFilterProps = {
  periodTabs: TabOption[];
  periodTab: string;
  setPeriodTab: (tab: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
};

const RefundAccountFilter = ({ periodTabs, periodTab, setPeriodTab, dateRange, setDateRange }: RefundAccountFilterProps) => {
  return (
    <section className='hidden flex-wrap gap-4 md:flex'>
      <Tabs options={periodTabs} value={periodTab} onChange={setPeriodTab} />
      <DateRangePicker value={dateRange} onChange={setDateRange} className='w-65' />
    </section>
  );
};

export default RefundAccountFilter;
