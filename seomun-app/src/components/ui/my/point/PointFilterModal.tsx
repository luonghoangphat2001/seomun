import { Button, DateRangePicker, Input, Modal, ModalHandle, Select, TabOption, Tabs } from '@/components/common';
import { PointTransactionCategory } from '@/apis/points/points.request';
import { Funnel, Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { DateRange } from 'react-day-picker';

type PointFilterModalProps = {
  periodTabs: TabOption[];
  tab: string;
  setTab: (value: string) => void;
  category: PointTransactionCategory | 'all';
  setCategory: (value: PointTransactionCategory | 'all') => void;
  dateRange?: DateRange;
  setDateRange: (value?: DateRange) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
};

const PointFilterModal = ({
  periodTabs,
  tab,
  setTab,
  category,
  setCategory,
  dateRange,
  setDateRange,
  searchValue,
  setSearchValue,
}: PointFilterModalProps) => {
  const t = useTranslations('my');
  const modalRef = useRef<ModalHandle>(null);

  const categoryOptions = [
    { label: t('point_category_all'), value: 'all' },
    { label: t('point_category_signup'), value: 'signup' },
    { label: t('point_category_expire'), value: 'expire' },
    { label: t('point_category_invite'), value: 'invite' },
    { label: t('point_category_manual'), value: 'manual' },
    { label: t('point_category_order'), value: 'order' },
  ];

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
          <Select
            options={categoryOptions}
            className='w-full'
            placeholder={t('point_category_all')}
            value={category}
            onChange={(value) => setCategory(value as PointTransactionCategory | 'all')}
          />
          <Tabs options={periodTabs} value={tab} onChange={setTab} tabClassName='flex-1' />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Input
            placeholder={t('point_search_placeholder')}
            suffix={<Search className='text-text-secondary h-5 w-5' />}
            // containerClassName='w-[320px]'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default PointFilterModal;
