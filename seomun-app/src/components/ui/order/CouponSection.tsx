'use client';

import { useOrderCouponListQuery } from '@/apis/my/coupon/coupon.query';
import { Description, Radio } from '@/components/common';
import Loading from '@/components/common/loading';
import { DATE_FORMAT } from '@/constants/common';
import { CouponType } from '@/enums/common';
import { cn, formatDate, formatNumber } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

type CouponSectionProps = {
  amount: number;
  selectedCouponId?: number;
  onSelectCoupon: (couponId?: number) => void;
};

const CouponSection = ({ amount, selectedCouponId, onSelectCoupon }: CouponSectionProps) => {
  const t = useTranslations();
  const { data: couponList, isLoading, isSuccess } = useOrderCouponListQuery({ amount });
  const applicableCoupons = useMemo(() => couponList?.applicable ?? [], [couponList]);
  const inapplicableCoupons = useMemo(() => couponList?.inapplicable ?? [], [couponList]);

  useEffect(() => {
    if (isSuccess && selectedCouponId && !applicableCoupons.some((coupon) => coupon.user_coupon_id === selectedCouponId)) {
      onSelectCoupon(undefined);
    }
  }, [applicableCoupons, isSuccess, onSelectCoupon, selectedCouponId]);

  return (
    <Description
      mode='form'
      isCollapse={false}
      title={t('order.coupon')}
      extra={
        <p className='title-14 text-text-brand'>{t('order.available_coupon_count', { count: applicableCoupons.length })}</p>
      }>
      <div className='mt-3 space-y-2'>
        <Radio
          name='order-coupon'
          value={0}
          checked={!selectedCouponId}
          onChange={() => onSelectCoupon(undefined)}
          label={t('order.no_coupon')}
        />
        {isLoading && <Loading />}
        {!isLoading && applicableCoupons.length === 0 && (
          <p className='body-14 text-text-secondary'>{t('order.no_available_coupon')}</p>
        )}
        {applicableCoupons.map((coupon) => {
          const discountLabel =
            coupon.discount_type === CouponType.PERCENTAGE
              ? `${formatNumber(coupon.discount_value)}%`
              : `${formatNumber(coupon.discount_value)}원`;

          return (
            <div
              key={coupon.user_coupon_id}
              role='radio'
              aria-checked={selectedCouponId === coupon.user_coupon_id}
              tabIndex={0}
              className={cn(
                'border-border-soft flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                selectedCouponId === coupon.user_coupon_id && 'bg-primary-50 ring-primary-500 ring-1',
              )}
              onClick={() => onSelectCoupon(coupon.user_coupon_id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectCoupon(coupon.user_coupon_id);
                }
              }}>
              <Radio
                name='order-coupon'
                value={coupon.user_coupon_id}
                checked={selectedCouponId === coupon.user_coupon_id}
                onChange={() => onSelectCoupon(coupon.user_coupon_id)}
                aria-label={coupon.name}
                className='shrink-0'
              />
              <div className='min-w-0 flex-1'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0'>
                    <p className='body-16 truncate'>{coupon.name}</p>
                    <p className='caption-12 text-text-secondary'>{coupon.code}</p>
                  </div>
                  <p className='title-16 text-text-brand shrink-0'>-{formatNumber(coupon.calculated_discount)}원</p>
                </div>
                {coupon.description && <p className='caption-12 text-text-secondary mt-2'>{coupon.description}</p>}
                <div className='caption-12 text-text-secondary mt-2 flex justify-between gap-2'>
                  <span>{discountLabel}</span>
                  <span>{coupon.expires_at ? formatDate(coupon.expires_at, DATE_FORMAT.DEFAULT) : '-'}</span>
                </div>
              </div>
            </div>
          );
        })}
        {inapplicableCoupons.map((coupon) => {
          const discountLabel =
            coupon.discount_type === CouponType.PERCENTAGE
              ? `${formatNumber(coupon.discount_value)}%`
              : `${formatNumber(coupon.discount_value)}원`;

          return (
            <div key={coupon.user_coupon_id} className='relative' aria-disabled='true'>
              <div className='border-border-soft flex items-start gap-3 rounded-xl border bg-black/10 p-3 opacity-70'>
                <Radio
                  name='order-coupon'
                  value={coupon.user_coupon_id}
                  checked={false}
                  disabled
                  aria-label={coupon.name}
                  className='shrink-0'
                />
                <div className='min-w-0 flex-1'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                      <p className='body-16 truncate'>{coupon.name}</p>
                      <p className='caption-12 text-text-secondary'>{coupon.code}</p>
                    </div>
                    <p className='title-16 text-text-brand shrink-0'>-{formatNumber(coupon.calculated_discount)}원</p>
                  </div>
                  {coupon.description && <p className='caption-12 text-text-secondary mt-2'>{coupon.description}</p>}
                  <div className='caption-12 text-text-secondary mt-2 flex justify-between gap-2'>
                    <span>{discountLabel}</span>
                    <span>{coupon.expires_at ? formatDate(coupon.expires_at, DATE_FORMAT.DEFAULT) : '-'}</span>
                  </div>
                </div>
              </div>
              <div className='caption-12 text-text-main absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/15 px-4 text-center'>
                <span className='rounded-full bg-white/85 px-3 py-1 font-medium'>
                  {coupon.reason || t('order.coupon_not_applicable')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Description>
  );
};

export default CouponSection;
