'use client';

import { useOrderAddressChangeHistoryQuery } from '@/apis/my/order/order.query';
import { Button, Description, DescriptionContent, Modal, ModalHandle } from '@/components/common';
import { DATE_FORMAT } from '@/constants/common';
import { OrderShippingMethod } from '@/enums/order';
import { useMediaQuery } from '@/hooks';
import { cn, formatCurrency, formatDate, formatKoreanPhone } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';

type ChangeAddressHistoryModalProps = {
  orderNumber?: string;
};

export const ChangeAddressHistoryModal = forwardRef<ModalHandle, ChangeAddressHistoryModalProps>(({ orderNumber }, ref) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { data } = useOrderAddressChangeHistoryQuery(orderNumber);
  const versions = [...(data?.versions ?? [])].sort((a, b) => b.revision - a.revision);

  const onClose = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
  };

  return (
    <Modal
      ref={ref}
      position={isDesktop ? 'center' : 'bottom'}
      title={
        <div className='md:px-6 md:pt-2.5 md:pb-0.5'>
          <p className='title-18 md:title-24'>{t('common.check_change_history')}</p>
        </div>
      }
      titleClassName='pt-0'
      size='md'
      className='max-w-200'
      footer={
        <div className='flex justify-end gap-3 md:gap-4 md:px-6 md:pt-2'>
          <Button variant='outline' onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      }>
      <div
        className={cn(
          'border-border-soft scrollbar-hide max-h-111 space-y-6 overflow-auto border-y px-4 py-6 max-md:border-none md:p-6',
        )}>
        {versions.map((version, index) => {
          const shipping = version.snapshot.shipping;
          const shippingMethodLabel =
            {
              [OrderShippingMethod.COURIER]: t('order.parcel_delivery'),
              [OrderShippingMethod.QUICK]: t('order.quick_delivery'),
              [OrderShippingMethod.PICKUP]: t('order.pickup'),
              [OrderShippingMethod.DIRECT]: t('order.direct_delivery'),
            }[shipping.method] ??
            shipping.method ??
            '-';
          const shippingStatus = shipping.shipping_status_label_ko ?? shipping.shipping_status;
          const shippedDate = shipping.shipped_date ? parseISO(shipping.shipped_date) : null;
          const shippingSchedule =
            shippedDate && isValid(shippedDate)
              ? t('order.shipping_schedule', { date: format(shippedDate, 'M/d(EEE)', { locale: ko }) })
              : '';
          const deliveryMessages = [shipping.message_preset, shipping.message_custom].filter((message): message is string =>
            Boolean(message),
          );

          return (
            <Description
              key={version.revision}
              isCollapse={false}
              className={index > 0 ? 'opacity-50' : ''}
              title={
                <div className='flex items-center justify-between'>
                  <p>
                    {t('order.shipping_info')} {version.revision}{' '}
                    <span className='title-14'>
                      (주소가 {formatDate(version.changed_at, DATE_FORMAT.DATE_WITH_DOT)}에 변경됨)
                    </span>
                  </p>
                </div>
              }>
              <DescriptionContent
                rows={[
                  {
                    items: [
                      { label: t('common.person_receiving'), value: shipping.name || '-' },
                      {
                        label: t('common.contact_info'),
                        value:
                          shipping.cellphone_number || shipping.phone
                            ? formatKoreanPhone(shipping.cellphone_number || shipping.phone)
                            : '-',
                      },
                    ],
                  },
                  {
                    items: [
                      { label: t('common.shipping_method'), value: shippingMethodLabel },
                      {
                        label: t('common.shipping_fee'),
                        value: version.snapshot.shipping_fee ? formatCurrency(version.snapshot.shipping_fee) : '-',
                      },
                    ],
                  },
                  {
                    items: [
                      { label: t('common.delivery_manager'), value: shipping.shipping_carrier || '-' },
                      {
                        label: t('common.shipping_date'),
                        value: shipping.shipped_date ? formatDate(shipping.shipped_date, DATE_FORMAT.DATE_WITH_DOT) : '-',
                      },
                    ],
                  },
                  {
                    items: [
                      {
                        label: (
                          <div className='-my-0.5 flex items-center justify-between md:my-0'>
                            <p>{t('common.delivery_status')}</p>
                            {shipping.invoice_number && (
                              <Button size='xs' variant='outline' className='inline-block md:hidden'>
                                {t('common.track_order')}
                              </Button>
                            )}
                          </div>
                        ),
                        value: (
                          <div className='flex items-center gap-3 md:-my-1.5'>
                            <p className='caption-12 rounded-lg bg-[#22C55E] px-2 py-0.5 font-bold text-gray-50'>
                              {shippingStatus || '-'}
                            </p>
                            {shipping.invoice_number && <p>({shipping.invoice_number})</p>}
                            {shipping.invoice_number && (
                              <Button size='sm' variant='outline' className='hidden md:inline-block'>
                                {t('common.track_order')}
                              </Button>
                            )}
                          </div>
                        ),
                      },
                    ],
                  },
                  {
                    items: [
                      {
                        label: t('common.delivery_memo'),
                        value: (
                          <div className='flex items-center gap-3 md:gap-6'>
                            {/* <p>{shippingSchedule}</p>
                            <div className='vertical-seperator'></div> */}
                            <p>{t('product.box_count_pieces', { count: 1 })}</p>
                            <div className='vertical-seperator'></div>
                            <p>{t('product.weight')}: 5kg</p>
                          </div>
                        ),
                      },
                    ],
                  },
                  {
                    items: [
                      {
                        label: t('common.delivery_message'),
                        value: (
                          <div className='flex flex-col gap-3'>
                            {deliveryMessages.length > 0 ? (
                              deliveryMessages.map((message, messageIndex) => <p key={`${message}-${messageIndex}`}>{message}</p>)
                            ) : (
                              <p>-</p>
                            )}
                          </div>
                        ),
                      },
                    ],
                  },
                ]}
              />
            </Description>
          );
        })}
      </div>
    </Modal>
  );
});

ChangeAddressHistoryModal.displayName = 'ChangeAddressHistoryModal';
