'use client';

import { CouponListREQ } from '@/apis/my/coupon/coupon.request';
import { Button, Modal, ModalHandle, Select } from '@/components/common';
import { CouponStatus } from '@/enums/common';
import { Funnel } from '@/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { getCouponStatusOptions } from './CouponFilter';

type CouponFilterModalProps = {
  filter: CouponListREQ;
  setMobileFilter: (filter: CouponListREQ) => void;
};

const CouponFilterModal = ({ filter, setMobileFilter }: CouponFilterModalProps) => {
  const t = useTranslations();
  const modalRef = useRef<ModalHandle>(null);
  const [status, setStatus] = useState<CouponStatus | undefined>(filter.status);
  const statusOptions = useMemo(() => getCouponStatusOptions(t), [t]);

  const openModal = () => {
    setStatus(filter.status);
    modalRef.current?.open();
  };

  const applyFilter = () => {
    setMobileFilter({
      page: 1,
      per_page: filter.per_page,
      status,
    });
    modalRef.current?.close();
  };

  return (
    <div className='block md:hidden'>
      <Button
        variant='outline-gray'
        size='sm'
        onClick={openModal}
        rightIcon={<Funnel className='size-5' />}
        className={cn('input-15 rounded-full px-3', filter.status && 'bg-primary-500/80')}>
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
            <Button size='sm' variant='ghost' onClick={() => modalRef.current?.close()}>
              {t('common.cancel')}
            </Button>
            <Button size='sm' onClick={applyFilter}>
              {t('common.apply')}
            </Button>
          </div>
        }>
        <div className='px-4 py-6'>
          <Select
            placeholder={t('common.entire')}
            options={statusOptions}
            value={status || ''}
            onChange={(value) => setStatus((value as CouponStatus) || undefined)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CouponFilterModal;
