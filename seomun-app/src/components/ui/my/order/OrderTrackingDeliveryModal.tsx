'use client';

import { useOrderTrackingDeliveryQuery } from '@/apis/my/order/order.query';
import { Button, Description, DescriptionContent, Modal, ModalHandle } from '@/components/common';
import { DATE_FORMAT } from '@/constants/common';
import { useMediaQuery } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

type OrderTrackingDeliveryModalProps = {
  invoiceNumber?: string | null;
};

export const OrderTrackingDeliveryModal = forwardRef<ModalHandle, OrderTrackingDeliveryModalProps>(({ invoiceNumber }, ref) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const modalRef = useRef<ModalHandle>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const { data, isError, isLoading } = useOrderTrackingDeliveryQuery(
    isTrackingOpen && invoiceNumber ? { invoice_number: invoiceNumber } : undefined,
  );

  useImperativeHandle(ref, () => ({
    open: () => {
      setIsTrackingOpen(true);
      modalRef.current?.open();
    },
    close: () => modalRef.current?.close(),
  }));

  const closeModal = () => {
    setIsTrackingOpen(false);
  };

  return (
    <Modal
      ref={modalRef}
      position={isDesktop ? 'center' : 'bottom'}
      size='lg'
      className='max-w-180'
      title={<h2 className='title-20 md:title-24'>{t('common.track_order')}</h2>}
      titleClassName='pt-0'
      onClose={closeModal}
      footer={
        <div className='flex justify-end px-2 md:px-6'>
          <Button variant='outline' onClick={() => modalRef.current?.close()}>
            {t('common.close')}
          </Button>
        </div>
      }>
      <div className='space-y-6 px-4 py-6 md:px-6'>
        {isLoading ? (
          <div className='flex h-48 items-center justify-center gap-2'>
            <div className='border-primary size-8 animate-spin rounded-full border-4 border-t-transparent' />
            <p className='body-14'>{t('common.loading')}</p>
          </div>
        ) : data && !isError ? (
          <>
            <Description isCollapse={false} title={t('common.delivery_status')}>
              <DescriptionContent
                rows={[
                  {
                    items: [
                      { label: t('common.tracking_number'), value: String(data.tracking_number ?? invoiceNumber) },
                      { label: t('common.delivery_status'), value: data.latestStatus?.name ?? '-' },
                    ],
                  },
                  {
                    items: [
                      {
                        label: t('common.last_updated'),
                        value: formatTrackingDate(data.latestStatus?.timestamp),
                      },
                    ],
                  },
                ]}
              />
            </Description>

            <section>
              <h3 className='title-16 md:title-18 border-text-main border-b-2 px-3 pb-4'>{t('common.tracking_history')}</h3>
              {data.history.length > 0 ? (
                <ol className='border-border-soft divide-border-soft divide-y border-x border-b'>
                  {data.history.map((event, index) => {
                    const contact = [event.worker_name, event.worker_tel].filter(Boolean).join(' / ');
                    const details = event.description || event.reason_message;

                    return (
                      <li
                        key={`${event.status_code}-${event.status_date}-${index}`}
                        className='relative px-4 py-4 pl-8 md:px-6 md:pl-12'>
                        <span className='bg-primary absolute top-5 left-4 size-2.5 rounded-full md:left-6' />
                        <div className='flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-4'>
                          <p className='title-14 md:title-16'>{event.status_name || '-'}</p>
                          <p className='body-14 text-text-secondary'>{formatTrackingDate(event.status_date)}</p>
                        </div>
                        <div className='body-14 text-text-secondary mt-2 flex flex-wrap gap-x-3 gap-y-1'>
                          {event.agency_name && <span>{event.agency_name}</span>}
                          {event.agency_tel && <span>{event.agency_tel}</span>}
                          {contact && <span>{contact}</span>}
                        </div>
                        {details && <p className='body-14 mt-2 whitespace-pre-line'>{details}</p>}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className='border-border-soft body-14 text-text-secondary flex h-28 items-center justify-center border-x border-b'>
                  {t('common.no_tracking_history')}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className='border-border-soft body-14 text-text-secondary flex h-48 items-center justify-center border'>
            {t('common.no_data')}
          </div>
        )}
      </div>
    </Modal>
  );
});

OrderTrackingDeliveryModal.displayName = 'OrderTrackingDeliveryModal';

const formatTrackingDate = (value?: string) => {
  if (!value) return '-';

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : formatDate(value, DATE_FORMAT.DATE_HOUR_MINUTE);
};
