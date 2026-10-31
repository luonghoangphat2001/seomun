'use client';

import { SavedOptionListREQ } from '@/apis/my/saved-options/saved-options.request';
import { getDateRangeBySavedOptionPeriod } from '@/apis/my/saved-options/saved-options.service';
import { DateRangePicker, Input, TabOption, Tabs } from '@/components/common';
import { DATE_FORMAT } from '@/constants/common';
import { Search } from '@/icons';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { DateRange } from 'react-day-picker';

type SavedOptionFilter = SavedOptionListREQ & {
  dateRange?: DateRange;
};

type OptionFilterProps = {
  periodTabs: TabOption[];
  tab: string;
  setTab: (value: string) => void;
  filter: SavedOptionFilter;
  handleFilterChange: (filter: Partial<SavedOptionFilter>) => void;
};

const OptionFilter = ({ periodTabs, tab, setTab, filter, handleFilterChange }: OptionFilterProps) => {
  const t = useTranslations();

  const handleTabChange = (value: string) => {
    setTab(value);

    const dateRange = getDateRangeBySavedOptionPeriod(value);
    handleFilterChange({
      dateRange,
      start_date: dateRange?.from ? format(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
      end_date: dateRange?.to ? format(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
    });
  };

  const handleDateRangeChange = (dateRange?: DateRange) => {
    handleFilterChange({
      dateRange,
      start_date: dateRange?.from ? format(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
      end_date: dateRange?.to ? format(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
    });
  };

  return (
    <section className='hidden flex-wrap items-center justify-between gap-3 md:flex'>
      <div className='flex flex-wrap items-center gap-3'>
        <Tabs options={periodTabs} value={tab} onChange={handleTabChange} />
        <DateRangePicker value={filter.dateRange} onChange={handleDateRangeChange} className='w-55' />
        <Input
          placeholder={t('placeholder.search_order_name')}
          suffix={<Search className='text-text-secondary h-5 w-5' />}
          containerClassName='w-[320px]'
          value={filter.search || ''}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
        />
      </div>
    </section>
  );
};

export default OptionFilter;
