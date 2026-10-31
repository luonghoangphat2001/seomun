'use client';

import { Button, DateRangePicker, Input, Modal, ModalHandle, Select, TabOption, Tabs } from '@/components/common';
import { SelectOption } from '@/components/common/select';
import { Funnel, Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useRef } from 'react';
import { DateRange } from 'react-day-picker';

type QuoteInquiryFilterModalProps = {
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

export const QuoteInquiryFilterModal = ({
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
}: QuoteInquiryFilterModalProps) => {
  const t = useTranslations();
  const modalRef = useRef<ModalHandle>(null);

  const openModal = () => {
    modalRef.current?.open();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  return (
    <div className='block md:hidden'>
      <Button
        variant='outline-gray'
        size='sm'
        onClick={openModal}
        rightIcon={<Funnel className='size-5' />}
        className='input-15 rounded-full px-3'>
        {t('common.filter')}
      </Button>
      <Modal
        ref={modalRef}
        position='bottom'
        title={t('common.filter')}
        titleClassName='pt-0'
        className='rounded-t-2xl'
        footer={
          <div className='flex justify-end gap-4'>
            <Button size='sm' variant='ghost' onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button size='sm'>{t('common.apply')}</Button>
          </div>
        }>
        <div>
          <div className='space-y-3 px-4 py-6'>
            <Select placeholder={t('common.entire')} options={statusOptions} value={selectValue} onChange={onSelectChange} />
            <Tabs options={tabOptions} value={tab} onChange={setTab} tabClassName='flex-1' />
            <DateRangePicker value={dateRange} onChange={onDateRange} />
            <Input
              className='py-2.25'
              placeholder={t('placeholder.search_input')}
              suffix={<Search className='text-text-secondary h-5 w-5' />}
              // containerClassName='w-[320px]'
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
