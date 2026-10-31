'use client';

import { Coupon } from '@/apis/my/coupon/coupon.response';
import { Button, Modal, ModalHandle } from '@/components/common';
import { CouponStatus, CouponType } from '@/enums/common';
import { formatNumber } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

type CouponDetailModalProps = {
  coupon: Coupon;
  onClose: () => void;
};

const getCouponStatusClass = (status: CouponStatus) => {
  switch (status) {
    case CouponStatus.UPCOMING:
      return 'bg-yellow-50 text-yellow-700 font-medium';
    case CouponStatus.AVAILABLE:
      return 'bg-green-50 text-green-700 font-medium';
    case CouponStatus.USED:
      return 'bg-blue-50 text-blue-700 font-medium';
    case CouponStatus.EXPIRED:
      return 'bg-red-50 text-red-600 font-medium';
  }
};

const getCouponDiscount = (coupon: Coupon['coupon']) =>
  coupon.discount_type === CouponType.PERCENTAGE
    ? `${formatNumber(coupon.discount_value)}%`
    : `${formatNumber(coupon.discount_value)}원`;

const CouponDetailModal = ({ coupon, onClose }: CouponDetailModalProps) => {
  const t = useTranslations();
  const modalRef = useRef<ModalHandle>(null);
  const isPercentageCoupon = coupon.coupon.discount_type === CouponType.PERCENTAGE;

  useEffect(() => {
    modalRef.current?.open();
  }, []);

  return (
    <Modal
      ref={modalRef}
      size='sm'
      title={t('my.coupon_detail')}
      onClose={onClose}
      footer={
        <Button className='w-full' onClick={() => modalRef.current?.close()}>
          {t('common.check')}
        </Button>
      }>
      <div className='space-y-5 p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 space-y-1'>
            <p className='title-18'>{coupon.coupon.name}</p>
            <p className='caption-12 text-text-secondary'>{coupon.coupon.code}</p>
          </div>
          <span className={`caption-12 shrink-0 rounded-full px-2 py-1 ${getCouponStatusClass(coupon.status)}`}>
            {t(`my.coupon_status.${coupon.status}`)}
          </span>
        </div>
        <dl className='border-border-soft divide-border-soft divide-y overflow-hidden rounded-xl border'>
          <div className='flex items-center justify-between gap-4 px-4 py-3'>
            <dt className='body-14 text-text-secondary'>{t('my.coupon_discount')}</dt>
            <dd className='title-16'>{getCouponDiscount(coupon.coupon)}</dd>
          </div>
          <div className='space-y-1 px-4 py-3'>
            <dt className='body-14 text-text-secondary'>{t('my.coupon_description')}</dt>
            <dd className='body-14 whitespace-pre-wrap'>{coupon.coupon.description || '-'}</dd>
          </div>
          <div className='flex items-center justify-between gap-4 px-4 py-3'>
            <dt className='body-14 text-text-secondary'>{t('my.coupon_min_order_amount')}</dt>
            <dd className='body-14'>{`${formatNumber(coupon.coupon.min_order_amount)}원`}</dd>
          </div>
          {isPercentageCoupon && (
            <div className='flex items-center justify-between gap-4 px-4 py-3'>
              <dt className='body-14 text-text-secondary'>{t('my.coupon_max_discount_amount')}</dt>
              <dd className='body-14'>
                {coupon.coupon.max_discount_amount === null ? '-' : `${formatNumber(coupon.coupon.max_discount_amount)}원`}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </Modal>
  );
};

export default CouponDetailModal;
