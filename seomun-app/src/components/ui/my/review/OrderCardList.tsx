'use client';

import { Button, MyPagination } from '@/components/common';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DATE_FORMAT } from '@/constants/common';
import { ReviewUnreviewedOrderItemRESP } from '@/apis/my/review/review.response';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type OrderCardListProps = {
  data: ReviewUnreviewedOrderItemRESP[];
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
  onWriteReview?: (item: ReviewUnreviewedOrderItemRESP) => void;
  onViewDetail?: (orderNumber?: string | number | null) => void;
};

const OrderCardList = ({ data, currentPage, totalPage, onPageChange, onWriteReview, onViewDetail }: OrderCardListProps) => {
  const t = useTranslations();

  return (
    <div className='block space-y-4 md:hidden'>
      {data.map((order) => (
        <div key={order.id} className='border-border-soft space-y-4 rounded-xl border p-4'>
          <div className='flex items-center justify-between gap-3'>
            <p className='body-14 text-text-secondary'>
              {order.created_at ? formatDate(order.created_at, DATE_FORMAT.DATE_WITH_DOT) : '-'}
            </p>
            <p className='body-14 font-medium'>{order.order_number || `#${order.order_id || order.id}`}</p>
          </div>
          <div className='bg-border-soft h-px'></div>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <div className='max-w-49.25 space-y-1'>
                <p className='title-14'>{order.product?.name || order.product_snapshot?.name || order.title}</p>
                <p className='caption-12'>
                  {typeof order.product?.category === 'string' ? order.product.category : order.product_snapshot?.category || '-'}{' '}
                  · {order.total_quantity}
                  {order.unit}
                </p>
              </div>
              <div className='relative h-14 w-14'>
                <Image
                  src={order.product?.images?.[0] || '/images/product-sample.png'}
                  alt={order.title}
                  fill
                  className='object-cover'
                />
              </div>
            </div>
            <div className='-mt-1 flex items-center justify-between'>
              <p className='body-16'>{formatCurrency(Number(order.total_price || 0))}</p>
            </div>
            <Button
              size='sm'
              variant='outline'
              className='body-14 w-full'
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail?.(order.order_number || order.order_id || order.id);
              }}>
              {t('my.view_detail')}
            </Button>
            <Button size='sm' variant='outline-primary' className='body-14 w-full' onClick={() => onWriteReview?.(order)}>
              {t('my.write_review_2')}
            </Button>
          </div>
        </div>
      ))}
      <MyPagination currentPage={currentPage} totalPage={totalPage} onPageChange={onPageChange} className='pt-2' />
    </div>
  );
};

export default OrderCardList;
