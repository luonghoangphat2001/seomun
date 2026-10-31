'use client';

import { Badge } from '@/components/common';
import { getDirectDeliveryStatusConfig } from '@/constants/inquiry';
import { DirectDeliveryStatus } from '@/enums/inquiry';
import { useRouter } from '@/i18n/navigation';
import { cn, formatKoreanPhone } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { DirectDeliveryRequest } from '@/types/inquiry';
import { useTranslations } from 'next-intl';

type DirectDeliveryRequestListCardProps = {
  data: DirectDeliveryRequest[];
};

export const DirectDeliveryRequestListCard = ({ data }: DirectDeliveryRequestListCardProps) => {
  const t = useTranslations('inquiry');
  const router = useRouter();

  return (
    <section className='space-y-4 md:hidden'>
      {data.map((inquiry) => {
        const statusConfig = getDirectDeliveryStatusConfig(t);
        const config = statusConfig[inquiry.status] || statusConfig.pending;

        return (
          <div
            key={inquiry.id}
            className='border-border-soft space-y-3 rounded-[12px] border p-4 hover:bg-gray-50'
            onClick={() => router.push(ROUTES.MY_PAGE.DIRECT_SHIPPING_REQUEST_DETAIL(inquiry.id))}>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='title-16'>{inquiry.name}</span>
                <div className='bg-text-disabled inline-block size-1.5 rounded-full' />
                <span className='title-16'>{formatKoreanPhone(inquiry.phone)}</span>
              </div>
              <Badge
                color={config.color}
                variant={config.variant}
                className={cn(inquiry.status === DirectDeliveryStatus.UNDERREVIEW && 'text-text-main! bg-border-soft')}>
                {config.label}
              </Badge>
            </div>

            <div className='border-border-soft border-t' />

            <div className='space-y-3'>
              <div className='space-y-1'>
                <p className='body-16'>{t('delivery_address')}</p>
                <p className='title-16'>{inquiry.type || '-'}</p>
              </div>
              <div className='space-y-1'>
                <p className='body-16'>{t('address')}</p>
                <p className='title-16'>{inquiry.address}</p>
              </div>
            </div>

            <div className='border-border-soft border-t' />

            <div className='flex items-center justify-between'>
              <span className='body-14 text-text-secondary'>{t('application_date')}</span>
              <span className='body-14'>{inquiry.createdAt}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
};
