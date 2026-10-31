'use client';

import { Badge } from '@/components/common';
import { useRouter } from '@/i18n/navigation';
import { Phone, User } from '@/icons';
import { formatKoreanPhone } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { ShippingInquiry } from '@/types/inquiry';
import { useTranslations } from 'next-intl';

type ShippingInquiryListCardProps = {
  data: ShippingInquiry[];
};

export const ShippingInquiryListCard = ({ data }: ShippingInquiryListCardProps) => {
  const t = useTranslations();
  const router = useRouter();

  return (
    <section className='space-y-4 md:mt-0 md:hidden'>
      {data.map((inquiry) => (
        <div
          key={inquiry.id}
          className='border-border-soft space-y-3 rounded-[12px] border p-4 hover:bg-gray-50'
          onClick={() => router.push(ROUTES.MY_PAGE.SHIPPING_INQUIRY_DETAIL(inquiry.id))}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {inquiry.isReply && (
                <Badge color='primary' className='bg-text-brand rounded-md px-2 py-0.5 text-xs'>
                  Re
                </Badge>
              )}
              <span className='title-14'>{inquiry.order}</span>
            </div>
            <span className='caption-12 text-text-secondary'>{inquiry.createdAt}</span>
          </div>
          <div className='body-14'>{inquiry.title}</div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex items-center gap-3 rounded-[8px] bg-gray-50 p-3'>
              <User className='size-4' />
              <div className='space-y-1'>
                <p className='caption-12'>{t('inquiry.person_in_charge')}</p>
                <p className='title-14 text-[12px]'>{inquiry.manager}</p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-[8px] bg-gray-50 p-3'>
              <Phone className='size-4' />
              <div className='space-y-1'>
                <p className='caption-12'>{t('inquiry.mobile')}</p>
                <p className='title-14 text-[12px]'>{formatKoreanPhone(inquiry.phone)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
