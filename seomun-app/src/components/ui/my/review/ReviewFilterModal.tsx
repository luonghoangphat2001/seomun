'use client';

import { Button, DateRangePicker, Modal, ModalHandle, TabOption, Tabs } from '@/components/common';
import { Funnel } from '@/icons';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { DateRange } from 'react-day-picker';

type ReviewFilterModalProps = {
  periodTabs: TabOption[];
  tab: string;
  setTab: (value: string) => void;
  dateRange?: DateRange;
  setDateRange: (value?: DateRange) => void;
};

const ReviewFilterModal = ({ periodTabs, tab, setTab, dateRange, setDateRange }: ReviewFilterModalProps) => {
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
        <div className='space-y-3 px-4 py-6'>
          <Tabs options={periodTabs} value={tab} onChange={setTab} tabClassName='flex-1' />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </Modal>
    </div>
  );
};

export default ReviewFilterModal;
