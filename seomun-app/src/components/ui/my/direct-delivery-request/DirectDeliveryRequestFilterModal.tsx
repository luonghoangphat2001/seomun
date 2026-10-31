'use client';

import { Button, Input, Modal, ModalHandle, Select } from '@/components/common';
import { SelectOption } from '@/components/common/select';
import { getDirectDeliveryStatusConfig, getDirectDeliveryTypeLabel } from '@/constants/inquiry';
import { DirectDeliveryStatus, DirectDeliveryType } from '@/enums/inquiry';
import { Funnel, Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

type DirectDeliveryRequestFilterModalProps = {
  selectValue: string;
  searchValue: string;
  onSelectChange: (value: string | number) => void;
  onSearchChange: (value: string) => void;
};

export const DirectDeliveryRequestFilterModal = ({
  selectValue,
  searchValue,
  onSelectChange,
  onSearchChange,
}: DirectDeliveryRequestFilterModalProps) => {
  const t = useTranslations();
  const tInquiry = useTranslations('inquiry');
  const modalRef = useRef<ModalHandle>(null);
  const statusConfig = getDirectDeliveryStatusConfig(tInquiry);
  const searchByOptions: SelectOption[] = [
    { value: 'entire', label: tInquiry('entire') },
    { value: 'shipping_name', label: tInquiry('delivery_address') },
    { value: 'recipient_name', label: tInquiry('name') },
    { value: 'phone', label: tInquiry('cell_phone') },
    { value: 'address', label: tInquiry('address') },
    { value: 'status', label: tInquiry('situation') },
  ];
  const selectOptions: SelectOption[] =
    selectValue === 'shipping_name'
      ? Object.values(DirectDeliveryType).map((type) => ({
          value: type,
          label: getDirectDeliveryTypeLabel(tInquiry, type),
        }))
      : selectValue === 'status'
        ? Object.values(DirectDeliveryStatus).map((status) => ({
            value: status,
            label: statusConfig[status].label,
          }))
        : [];
  const isSelectSearch = selectValue === 'shipping_name' || selectValue === 'status';

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
            <Button size='sm' onClick={closeModal}>
              {t('common.apply')}
            </Button>
          </div>
        }>
        <div>
          <div className='space-y-3 px-4 py-6'>
            <Select placeholder={t('common.entire')} options={searchByOptions} value={selectValue} onChange={onSelectChange} />
            {isSelectSearch ? (
              <Select
                placeholder={t('common.entire')}
                options={selectOptions}
                value={searchValue}
                onChange={(value) => onSearchChange(String(value))}
              />
            ) : (
              <Input
                className='py-2.25'
                placeholder={t('placeholder.search_input')}
                suffix={<Search className='text-text-secondary h-5 w-5' />}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
