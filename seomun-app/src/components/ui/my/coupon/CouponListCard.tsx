'use client';

import { useCouponMobileListQuery } from '@/apis/my/coupon/coupon.query';
import { CouponListREQ } from '@/apis/my/coupon/coupon.request';
import Loading from '@/components/common/loading';
import { DATE_FORMAT } from '@/constants/common';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import CouponDetailModal from './CouponDetailModal';
import { getCouponDiscount, getCouponStatusClass, getCouponStatusLabel } from './CouponListTable';

type CouponListCardProps = {
  filter: CouponListREQ;
};

const CouponListCard = ({ filter }: CouponListCardProps) => {
  const t = useTranslations();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useCouponMobileListQuery(filter);
  const coupons = data?.pages.flatMap((page) => page.data.coupons) ?? [];
  const selectedCoupon = coupons.find((coupon) => coupon.id === selectedCouponId) ?? null;

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchNextPage();
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className='md:hidden'>
        <Loading />
      </div>
    );
  }

  return (
    <section className='space-y-3 md:hidden'>
      {coupons.map((item) => (
        <article
          key={item.id}
          className='border-border-soft space-y-4 rounded-xl border p-4'
          onClick={() => setSelectedCouponId(item.id)}>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0 space-y-1'>
              <p className='title-16 truncate'>{item.coupon.name}</p>
              <p className='caption-12 text-text-secondary'>{item.coupon.code}</p>
            </div>
            <span className={`caption-12 shrink-0 rounded-full px-2 py-1 ${getCouponStatusClass(item.status)}`}>
              {getCouponStatusLabel(t, item.status)}
            </span>
          </div>
          <div className='bg-border-soft h-px' />
          <div className='bg-fill-soft flex items-center justify-between rounded-lg px-3 py-2.5'>
            <p className='caption-12 text-text-secondary'>{t('my.coupon_discount')}</p>
            <p className='title-18'>{getCouponDiscount(item.coupon)}</p>
          </div>
          {item.coupon.description && <p className='caption-12 text-text-secondary'>{item.coupon.description}</p>}
          <div className='caption-12 space-y-1.5'>
            <div className='flex justify-between gap-3'>
              <span className='text-text-secondary'>{t('my.coupon_validity')}</span>
              <span>{`${formatDate(item.coupon.starts_at, DATE_FORMAT.DEFAULT)} ~ ${formatDate(item.coupon.expires_at, DATE_FORMAT.DEFAULT)}`}</span>
            </div>
            <div className='flex justify-between gap-3'>
              <span className='text-text-secondary'>{t('my.coupon_received_at')}</span>
              <span>{formatDate(item.received_at, DATE_FORMAT.DATE_TIME)}</span>
            </div>
            {item.used_at && (
              <div className='flex justify-between gap-3'>
                <span className='text-text-secondary'>{t('my.coupon_used_at')}</span>
                <span>{formatDate(item.used_at, DATE_FORMAT.DATE_TIME)}</span>
              </div>
            )}
          </div>
        </article>
      ))}
      {hasNextPage && <div ref={loadMoreRef}>{isFetchingNextPage && <Loading />}</div>}
      {selectedCoupon && <CouponDetailModal coupon={selectedCoupon} onClose={() => setSelectedCouponId(null)} />}
    </section>
  );
};

export default CouponListCard;
