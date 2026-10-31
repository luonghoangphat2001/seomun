'use client';

import { WorkerListREQ } from '@/apis/my/worker/worker.request';
import { Button, Input, Modal, ModalHandle, Select, TabOption, Tabs } from '@/components/common';
import { Funnel, Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

type WorkerFilterModalProps = {
  tabOptions: TabOption[];
  filter: WorkerListREQ;
  setMobileFilter: (filter: WorkerListREQ) => void;
};

const WorkerFilterModal = ({ tabOptions, filter, setMobileFilter }: WorkerFilterModalProps) => {
  const t = useTranslations();
  const modalRef = useRef<ModalHandle>(null);
  const [tabValue, setTabValue] = useState<string>(filter.search_type || '');
  const [searchValue, setSearchValue] = useState<string>(filter.keyword || '');

  const openModal = () => {
    modalRef.current?.open();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  const applyFilter = () => {
    setMobileFilter({
      search_type: tabValue,
      keyword: searchValue,
    });
    closeModal();
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
            <Button size='sm' onClick={applyFilter}>
              {t('common.apply')}
            </Button>
          </div>
        }>
        <div>
          <div className='space-y-3 px-4 py-6'>
            <Select placeholder={t('common.entire')} options={[]} />
            <Tabs options={tabOptions} value={tabValue} onChange={setTabValue} tabClassName='flex-1' />
            <Input
              className='py-2.25'
              placeholder={t('placeholder.search_input')}
              suffix={<Search className='text-text-secondary h-5 w-5' />}
              // containerClassName='w-[320px]'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkerFilterModal;
