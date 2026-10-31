'use client';

import { CouponListREQ } from '@/apis/my/coupon/coupon.request';
import { Select, SelectOption } from '@/components/common';
import { CouponStatus } from '@/enums/common';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type CouponFilterProps = {
  filter: CouponListREQ;
  handleFilterChange: (filter: Partial<CouponListREQ>) => void;
};

export const getCouponStatusOptions = (t: ReturnType<typeof useTranslations>): SelectOption[] => [
  { label: t('common.entire'), value: '' },
  { label: t('my.coupon_status.upcoming'), value: CouponStatus.UPCOMING },
  { label: t('my.coupon_status.available'), value: CouponStatus.AVAILABLE },
  { label: t('my.coupon_status.used'), value: CouponStatus.USED },
  { label: t('my.coupon_status.expired'), value: CouponStatus.EXPIRED },
];

const CouponFilter = ({ filter, handleFilterChange }: CouponFilterProps) => {
  const t = useTranslations();
  const statusOptions = useMemo(() => getCouponStatusOptions(t), [t]);

  return (
    <section className='hidden items-center md:flex'>
      <Select
        className='w-40'
        placeholder={t('common.entire')}
        options={statusOptions}
        value={filter.status || ''}
        onChange={(value) => handleFilterChange({ status: (value as CouponStatus) || undefined })}
      />
    </section>
  );
};

export default CouponFilter;
