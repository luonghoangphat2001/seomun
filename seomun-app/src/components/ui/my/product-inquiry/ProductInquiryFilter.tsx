'use client';

import { Button, DateRangePicker, Input, Select, TabOption, Tabs } from '@/components/common';
import { SelectOption } from '@/components/common/select';
import { useRouter } from '@/i18n/navigation';
import { Pencil, Search } from '@/icons';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import { DateRange } from 'react-day-picker';

type ProductInquiryFilterProps = {
  statusOptions: SelectOption[];
  tabOptions: TabOption[];
  tab: string;
  setTab: (value: string) => void;
  selectValue: string;
  searchValue: string;
  dateRange: DateRange | undefined;
  onSelectChange: (value: string | number) => void;
  onSearchChange: (value: string) => void;
  onDateRange: Dispatch<SetStateAction<DateRange | undefined>>;
};

export const ProductInquiryFilter = ({
  statusOptions,
  tabOptions,
  tab,
  setTab,
  selectValue,
  searchValue,
  dateRange,
  onSelectChange,
  onSearchChange,
  onDateRange,
}: ProductInquiryFilterProps) => {
  const t = useTranslations();
  const router = useRouter();

  return (
    <section className='flex flex-wrap items-center justify-between gap-2'>
      <div className='hidden flex-wrap items-center gap-x-4 gap-y-2 md:flex'>
        <Select
          className='w-32'
          placeholder={t('common.entire')}
          options={statusOptions}
          value={selectValue}
          onChange={onSelectChange}
        />
        <Tabs options={tabOptions} value={tab} onChange={setTab} />
        <DateRangePicker value={dateRange} onChange={onDateRange} className='w-[260px]' />
        <Input
          className='py-2.25'
          placeholder={t('placeholder.search_input')}
          suffix={<Search className='text-text-secondary h-5 w-5' />}
          containerClassName='w-[320px]'
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className='mobile-button md:flex-nowrap'>
        <div className='flex-1'>
          <Button
            className='body-16 h-12 w-full md:h-10 md:w-auto'
            rightIcon={<Pencil className='size-6' />}
            onClick={() => router.push(ROUTES.MY_PAGE.PRODUCT_INQUIRY_CREATE)}>
            {t('inquiry.contact_us')}
          </Button>
        </div>
      </div>
    </section>
  );
};
