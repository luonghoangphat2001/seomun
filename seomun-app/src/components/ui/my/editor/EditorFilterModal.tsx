'use client';

import { Button, DateRangePicker, Input, Modal, ModalHandle, Select, Tabs } from '@/components/common';
import { PeriodFilter } from '@/enums/common';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import { Funnel, Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { DateRange } from 'react-day-picker';

const EditorFilterModal = () => {
  const t = useTranslations();
  const modalBottomRef = useRef<ModalHandle>(null);
  const [periodTab, setPeriodTab] = useState<string>(PeriodFilter.ONE_WEEK);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { periodFilterOptions } = useEnumOptions({ periodFilterOptions: PeriodFilter }, 'filter');

  const openModal = () => {
    modalBottomRef.current?.open();
  };

  const closeModal = () => {
    modalBottomRef.current?.close();
  };

  return (
    <div className='block md:hidden'>
      <Button variant='outline-gray' onClick={openModal} className='rounded-full px-3'>
        <div className='flex gap-2'>
          <p className='input-15'>{t('common.filter')}</p>
          <Funnel className='size-5' />
        </div>
      </Button>
      <Modal
        ref={modalBottomRef}
        position='bottom'
        title={t('common.filter')}
        className='rounded-t-2xl'
        footer={
          <div className='flex justify-end gap-4'>
            <Button size={'sm'} variant={'ghost'} onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button size={'sm'}>{t('common.apply')}</Button>
          </div>
        }>
        <div>
          <div className='space-y-3 px-4 py-6'>
            <Tabs options={periodFilterOptions} value={periodTab} onChange={setPeriodTab} tabClassName='flex-1' />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Select options={[]} placeholder={t('common.entire')} />
            <Input placeholder={t('placeholder.search_input')} suffix={<Search className='text-text-secondary h-5 w-5' />} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EditorFilterModal;
