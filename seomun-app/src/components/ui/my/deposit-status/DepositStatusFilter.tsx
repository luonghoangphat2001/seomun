'use client';

import { Button, DateRangePicker, TabOption, Tabs } from '@/components/common';
import { Download } from '@/icons';
import { useTranslations } from 'next-intl';
import { DateRange } from 'react-day-picker';

type DepositStatusFilterProps = {
  periodTabs: TabOption[];
  tab: string;
  setTab: (value: string) => void;
  dateRange?: DateRange;
  setDateRange: (value?: DateRange) => void;
  onDownloadExcel?: () => void;
  isDownloadingExcel?: boolean;
};

const DepositStatusFilter = ({
  periodTabs,
  tab,
  setTab,
  dateRange,
  setDateRange,
  onDownloadExcel,
  isDownloadingExcel,
}: DepositStatusFilterProps) => {
  const t = useTranslations();

  return (
    <section className='flex flex-wrap items-center justify-between gap-3'>
      <div className='hidden flex-wrap items-center gap-3 md:flex'>
        <Tabs options={periodTabs} value={tab} onChange={setTab} />
        <DateRangePicker value={dateRange} onChange={setDateRange} className='w-55' />
      </div>
      <div className='mobile-button'>
        <Button
          rightIcon={<Download className='size-6 stroke-1' />}
          className='body-16 w-full md:w-auto'
          onClick={onDownloadExcel}
          loading={isDownloadingExcel}>
          {t('common.excel_download')}
        </Button>
      </div>
    </section>
  );
};

export default DepositStatusFilter;
