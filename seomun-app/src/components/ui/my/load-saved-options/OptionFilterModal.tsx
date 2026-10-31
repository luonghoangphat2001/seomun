'use client';

import { SavedOptionListREQ } from '@/apis/my/saved-options/saved-options.request';
import { getDateRangeBySavedOptionPeriod } from '@/apis/my/saved-options/saved-options.service';
import { Button, DateRangePicker, Input, Modal, ModalHandle, TabOption, Tabs } from '@/components/common';
import { format } from 'date-fns';
import { Funnel, Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DATE_FORMAT } from '@/constants/common';
import { cn } from '@/lib/utils';

type SavedOptionFilter = SavedOptionListREQ & {
  dateRange?: DateRange;
};

type OptionFilterModalProps = {
  periodTabs: TabOption[];
  tab: string;
  filter: SavedOptionFilter;
  onApply: (tab: string, filter: SavedOptionFilter) => void;
};

const OptionFilterModal = ({ periodTabs, tab, filter, onApply }: OptionFilterModalProps) => {
  const t = useTranslations();
  const modalRef = useRef<ModalHandle>(null);
  const [draftTab, setDraftTab] = useState(tab);
  const [draftFilter, setDraftFilter] = useState<SavedOptionFilter>(filter);

  const openModal = () => {
    setDraftTab(tab);
    setDraftFilter(filter);
    modalRef.current?.open();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  const handleTabChange = (value: string) => {
    const dateRange = getDateRangeBySavedOptionPeriod(value);
    setDraftTab(value);
    setDraftFilter((prev) => ({
      ...prev,
      dateRange,
      start_date: dateRange?.from ? format(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
      end_date: dateRange?.to ? format(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
    }));
  };

  const handleDateRangeChange = (dateRange?: DateRange) => {
    setDraftFilter((prev) => ({
      ...prev,
      dateRange,
      start_date: dateRange?.from ? format(dateRange.from, DATE_FORMAT.DEFAULT) : undefined,
      end_date: dateRange?.to ? format(dateRange.to, DATE_FORMAT.DEFAULT) : undefined,
    }));
  };

  const handleApply = () => {
    onApply(draftTab, draftFilter);
    closeModal();
  };

  return (
    <div className='block md:hidden'>
      <Button
        variant='outline-gray'
        size='sm'
        onClick={openModal}
        rightIcon={<Funnel className='size-5' />}
        className={cn('input-15 rounded-full px-3', filter.search && 'bg-primary-500/80')}>
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
            <Button size='sm' onClick={handleApply}>
              {t('common.apply')}
            </Button>
          </div>
        }>
        <div className='space-y-3 px-4 py-6'>
          <Tabs options={periodTabs} value={draftTab} onChange={handleTabChange} tabClassName='flex-1' />
          <DateRangePicker value={draftFilter.dateRange} onChange={handleDateRangeChange} />
          <Input
            placeholder={t('placeholder.search_order_name')}
            suffix={<Search className='text-text-secondary h-5 w-5' />}
            value={draftFilter.search || ''}
            onChange={(e) => setDraftFilter((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
};

export default OptionFilterModal;
