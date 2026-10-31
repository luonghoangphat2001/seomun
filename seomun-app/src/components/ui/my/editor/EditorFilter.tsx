import { DateRangePicker, Input, Select, Tabs } from '@/components/common';
import { PeriodFilter } from '@/enums/common';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import { Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

const EditorFilter = () => {
  const t = useTranslations();
  const [periodTab, setPeriodTab] = useState<string>(PeriodFilter.ONE_WEEK);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { periodFilterOptions } = useEnumOptions({ periodFilterOptions: PeriodFilter }, 'filter');

  return (
    <div className='hidden flex-wrap gap-4 md:flex'>
      <Select options={[]} placeholder={t('common.entire')} className='w-32' />
      <Tabs options={periodFilterOptions} value={periodTab} onChange={setPeriodTab} />
      <DateRangePicker value={dateRange} onChange={setDateRange} className='w-65' />
      <Input
        placeholder={t('placeholder.search_input')}
        suffix={<Search className='text-text-secondary h-5 w-5' />}
        containerClassName='w-[320px]'
      />
    </div>
  );
};

export default EditorFilter;
