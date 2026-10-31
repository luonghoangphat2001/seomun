'use client';

import { ShippingAddressListREQ } from '@/apis/my/shipping-address/shipping-address.request';
import { Button, Input, Modal, ModalHandle } from '@/components/common';
import { Funnel, Search } from '@/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

type ShippingAddressFilterModalProps = {
  // filterOptions: SelectOption[];
  filter: ShippingAddressListREQ;
  setMobileFilter: (filter: ShippingAddressListREQ) => void;
};

const ShippingAddressFilterModal = ({ filter, setMobileFilter }: ShippingAddressFilterModalProps) => {
  const t = useTranslations();
  const modalRef = useRef<ModalHandle>(null);
  // const [optionValue, setOptionValue] = useState<string>(filter.search_type || '');
  const [searchValue, setSearchValue] = useState<string>(filter.search || '');

  const openModal = () => {
    modalRef.current?.open();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  const applyFilter = () => {
    setMobileFilter({
      // search_type: optionValue,
      search: searchValue,
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
            <Button size='sm' onClick={applyFilter}>
              {t('common.apply')}
            </Button>
          </div>
        }>
        <div className='space-y-3 px-4 py-6'>
          {/* <Select
            placeholder={t('common.entire')}
            options={filterOptions}
            value={optionValue}
            onChange={(value) => setOptionValue(value as string)}
          /> */}
          <Input
            className='py-2.25'
            placeholder={t('placeholder.search_input')}
            suffix={<Search className='text-text-secondary h-5 w-5' />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ShippingAddressFilterModal;
