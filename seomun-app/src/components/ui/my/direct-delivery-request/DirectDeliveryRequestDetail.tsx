'use client';

import { useDirectShippingDetailQuery } from '@/apis/customer-service/direct-shipping/direct-shipping.query';
import { Badge, Description, DescriptionContent } from '@/components/common';
import Loading from '@/components/common/loading';
import { getDirectDeliveryStatusConfig } from '@/constants/inquiry';
import { DirectDeliveryStatus } from '@/enums/inquiry';
import { PaperClip } from '@/icons';
import { cn, formatKoreanPhone } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import PageTitle from '../components/PageTitle';

const TextValue = ({ value }: { value?: string }) =>
  value ? <div className='body-14 md:body-16 whitespace-pre-wrap'>{value}</div> : '-';

export const DirectDeliveryRequestDetail = () => {
  const t = useTranslations();
  const tInquiry = useTranslations('inquiry');
  const { id } = useParams();
  const { data: request, isLoading } = useDirectShippingDetailQuery(Number(id) || undefined);

  if (isLoading) {
    return <Loading displayText />;
  }

  if (!request) {
    return null;
  }

  const statusConfig = getDirectDeliveryStatusConfig(tInquiry);
  const status = statusConfig[request.status] || statusConfig.pending;

  return (
    <main className='relative max-w-230 space-y-3 md:mt-0 md:space-y-8'>
      <PageTitle
        title={
          <p>
            <span className='text-text-brand'>[{t('inquiry.delivery_request')}]</span> {request.type}
          </p>
        }
        returnRoute={ROUTES.MY_PAGE.DIRECT_SHIPPING_REQUEST}
      />

      <div className='mobile-seperator'></div>

      <div className='md:border-border-soft space-y-3 md:space-y-4 md:border'>
        <div className='md:bg-fill-light space-y-2 md:space-y-3 md:px-6 md:py-6'>
          <div className='flex items-center gap-1 md:gap-2'>
            <span className='body-14 w-20 md:w-16'>{t('inquiry.data_written')}</span>
            <span className='title-14'>{request.createdAt}</span>
          </div>
          <div className='flex items-center gap-1 md:gap-2'>
            <span className='body-14 w-20 md:w-16'>{t('inquiry.situation')}</span>
            <Badge
              color={status.color}
              variant={status.variant}
              className={cn(request.status === DirectDeliveryStatus.UNDERREVIEW && 'text-text-main! bg-border-soft')}>
              {status.label}
            </Badge>
          </div>
        </div>

        <Description
          title={
            <span className='title-40 flex items-end justify-between'>
              Q <span className='body-14'>{request.createdAt}</span>
            </span>
          }
          titleClassName='w-full'
          isCollapse={false}>
          <DescriptionContent
            labelClassName='items-start'
            className='border-x-0 border-b-0'
            rows={[
              { items: [{ label: t('inquiry.delivery_address'), value: <TextValue value={request.type} /> }] },
              { items: [{ label: t('inquiry.name'), value: <TextValue value={request.name} /> }] },
              { items: [{ label: t('inquiry.cell_phone'), value: <TextValue value={formatKoreanPhone(request.phone)} /> }] },
              { items: [{ label: t('inquiry.address'), value: <TextValue value={request.address} /> }] },
              { items: [{ label: t('inquiry.storage_location'), value: <TextValue value={request.storageLocation} /> }] },
              {
                items: [
                  {
                    label: t('inquiry.attachment'),
                    value: request.fileUrl ? (
                      <a
                        href={request.fileUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-text-brand-secondary flex items-center gap-1.5'>
                        <PaperClip className='size-5' />
                        <span className='body-14 md:body-16 underline'>{request.fileName || request.fileUrl}</span>
                      </a>
                    ) : (
                      '-'
                    ),
                  },
                ],
              },
              { items: [{ label: t('inquiry.detailed_request'), value: <TextValue value={request.detailRequest} /> }] },
            ]}
          />
        </Description>
      </div>
    </main>
  );
};
