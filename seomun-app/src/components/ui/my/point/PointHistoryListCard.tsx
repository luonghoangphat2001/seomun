'use client';

import { formatCurrency } from '@/lib/utils';
import { PointHistory } from '@/types/point';
import { useTranslations } from 'next-intl';

type PointHistoryListCardProps = {
  data: PointHistory[];
};

const PointHistoryListCard = ({ data }: PointHistoryListCardProps) => {
  const t = useTranslations();

  return (
    <section className='-mt-1 space-y-3 md:hidden'>
      {data.map((item) => (
        <div key={item.id} className='border-border-soft space-y-3 rounded-xl border p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <p className='title-14'>{item.expireDate}</p>
              <div className='bg-text-main size-0.75 rounded-full'></div>
              <p className='body-14'>{item.type}</p>
            </div>
            <p className='caption-12 text-text-secondary'>
              {t('my.expired_date')}: {item.expireDate}
            </p>
          </div>
          <div className='bg-border-light grid grid-cols-4 rounded-lg p-3'>
            <div className='space-y-1 text-center'>
              <p className='caption-12'>{t('my.earn_point')}</p>
              <p className='title-14'>{formatCurrency(item.earned, false)} P</p>
            </div>
            <div className='space-y-1 text-center'>
              <p className='caption-12'>{t('my.use')}</p>
              <p className='title-14'>{formatCurrency(item.used, false)} P</p>
            </div>
            <div className='space-y-1 text-center'>
              <p className='caption-12'>{t('my.balance')}</p>
              <p className='title-14'>{formatCurrency(item.balance, false)} P</p>
            </div>
            <div className='space-y-1 text-center'>
              <p className='caption-12'>{t('my.extinction')}</p>
              <p className='title-14'>{formatCurrency(item.expired, false)} P</p>
            </div>
          </div>
          <div className='space-y-1'>
            <div className='caption-12 flex items-center justify-between'>
              <p className='text-text-secondary'>{t('my.earned_order_number')}</p>
              <p className='cursor-pointer underline'>{item.earnOrderNo}</p>
            </div>
            <div className='caption-12 flex items-center justify-between'>
              <p className='text-text-secondary'>{t('my.use_order_number')}</p>
              <p className='cursor-pointer underline'>{item.useOrderNo}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default PointHistoryListCard;
