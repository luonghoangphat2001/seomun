'use client';

import type { OrderHistoryItemRESP } from '@/apis/my/order/order.response';
import { useOrderAddressChangeHistoryQuery } from '@/apis/my/order/order.query';
import { Button, Description, DescriptionContent, ModalHandle, Popover } from '@/components/common';
import { DATE_FORMAT } from '@/constants/common';
import { EDITABLE_ORDER_HISTORY_STATUSES, isShippingOrderHistoryStatus } from '@/constants/order';
import { OrderShippingMethod } from '@/enums/order';
import { QuestionCircle } from '@/icons';
import { cn, formatCurrency, formatDate, formatKoreanPhone } from '@/lib/utils';
import { formatDeliveryDate } from '@/lib/utils/helper';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { OrderTrackingDeliveryModal } from '../OrderTrackingDeliveryModal';
import { ChangeShippingAddressModal } from './change-shipping-address-modal/ChangeShippingAddressModal';
import { ChangeAddressHistoryModal } from './change-address-history-modal/ChangeAddressHistoryModal';

type ShippingInfoProps = {
  order?: OrderHistoryItemRESP;
};

const ShippingInfo = ({ order }: ShippingInfoProps) => {
  const t = useTranslations();
  const changeShippingAddressModalRef = useRef<ModalHandle>(null);
  const changeAddressHistoryModalRef = useRef<ModalHandle>(null);
  const trackingDeliveryModalRef = useRef<ModalHandle>(null);
  const { data: addressChangeHistory } = useOrderAddressChangeHistoryQuery(order?.order_number);
  const shipping = order?.shipping;
  const canEditOrder = order ? EDITABLE_ORDER_HISTORY_STATUSES.includes(order.status) : false;
  const shipment = order?.order_shipments[0];
  const address = [shipping?.postcode && `[${shipping.postcode}]`, shipping?.address, shipping?.address_detail]
    .filter(Boolean)
    .join(' ');
  const deliveryMessage = [shipping?.message_preset, shipping?.message_custom].filter(Boolean).join(' / ');
  const shippingStatus = shipment?.status_label_ko ?? shipping?.shipping_status_label_ko;
  const displayShippingStatus = isShippingOrderHistoryStatus(order?.status) ? shippingStatus : undefined;
  const trackingNumber = shipment?.tracking_number ?? shipping?.invoice_number;
  const shippingDate = shipment?.shipped_at ?? shipping?.shipped_date;
  const shippingSchedule = formatDeliveryDate(order?.estimated_production_days ?? 1, 'short', order?.created_at);
  const firstAddressChange = addressChangeHistory?.versions[0];
  const shippingMethod = shipment?.shipping_method ?? shipping?.method ?? order?.shipping_method;
  const shippingMethodLabel =
    {
      [OrderShippingMethod.COURIER]: t('order.parcel_delivery'),
      [OrderShippingMethod.QUICK]: t('order.quick_delivery'),
      [OrderShippingMethod.PICKUP]: t('order.pickup'),
      [OrderShippingMethod.DIRECT]: t('order.direct_delivery'),
    }[shippingMethod as OrderShippingMethod] ??
    shippingMethod ??
    '-';

  const openChangeShippingAddressModal = () => {
    changeShippingAddressModalRef.current?.open();
  };

  const openChangeAddressHistoryModal = () => {
    changeAddressHistoryModalRef.current?.open();
  };

  const openTrackingDeliveryModal = () => {
    if (trackingNumber) trackingDeliveryModalRef.current?.open();
  };

  return (
    <>
      <Description
        isCollapse={false}
        title={
          firstAddressChange ? (
            <p>
              {t('order.shipping_info')} {firstAddressChange.revision}{' '}
              <span className='title-14'>
                ({formatDate(firstAddressChange.changed_at, DATE_FORMAT.DATE_HOUR_MINUTE)} {t('common.changed')})
              </span>
            </p>
          ) : (
            t('order.shipping_info')
          )
        }
        extra={
          <Button variant='outline-primary' size='sm' onClick={openChangeAddressHistoryModal}>
            {t('common.check_change_history')}
          </Button>
        }>
        <DescriptionContent
          rows={[
            {
              items: [
                { label: t('common.person_receiving'), value: shipping?.name },
                {
                  label: t('common.contact_info'),
                  value:
                    shipping?.cellphone_number || shipping?.phone
                      ? formatKoreanPhone(shipping.cellphone_number || shipping.phone)
                      : '-',
                },
              ],
            },
            {
              items: [
                {
                  label: (
                    <div className='-my-0.5 flex items-center justify-between md:my-0'>
                      <p>{t('common.address')}</p>
                      {canEditOrder && (
                        <Button
                          size='xs'
                          variant='outline'
                          className='inline-block md:hidden'
                          onClick={openChangeShippingAddressModal}>
                          {t('common.change_delivery_address')}
                        </Button>
                      )}
                    </div>
                  ),
                  value: (
                    <div className='flex items-center gap-3 md:-my-1.5'>
                      <p>{address || '-'}</p>
                      {canEditOrder && (
                        <Button
                          size='sm'
                          variant='outline'
                          className='hidden md:inline-block'
                          onClick={openChangeShippingAddressModal}>
                          {t('common.change_delivery_address')}
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
                  label: t('common.shipping_method'),
                  value: shippingMethodLabel,
                },
                { label: t('common.delivery_manager'), value: shipment?.carrier_name ?? shipping?.shipping_carrier },
              ],
            },
            {
              items: [
                {
                  label: t('common.shipping_fee'),
                  value: order ? formatCurrency(order.shipping_fee) : '-',
                },
                {
                  label: t('common.shipping_date'),
                  value: shippingDate ? formatDate(shippingDate, DATE_FORMAT.DATE_WITH_DOT) : '-',
                },
              ],
            },
            {
              items: [
                {
                  label: (
                    <div className='-my-0.5 flex items-center justify-between md:my-0'>
                      <p>{t('common.delivery_status')}</p>
                      {trackingNumber && (
                        <Button
                          size='xs'
                          variant='outline'
                          className='inline-block md:hidden'
                          onClick={openTrackingDeliveryModal}>
                          {t('common.track_order')}
                        </Button>
                      )}
                    </div>
                  ),
                  value:
                    displayShippingStatus || trackingNumber ? (
                      <div className='flex items-center gap-3 md:-my-1.5'>
                        {displayShippingStatus && (
                          <p className='caption-12 rounded-lg bg-[#22C55E] px-2 py-0.5 font-bold text-gray-50'>
                            {displayShippingStatus}
                          </p>
                        )}
                        {trackingNumber && <p>({trackingNumber})</p>}
                        {trackingNumber && (
                          <Button
                            size='sm'
                            variant='outline'
                            className='hidden md:inline-block'
                            onClick={openTrackingDeliveryModal}>
                            {t('common.track_order')}
                          </Button>
                        )}
                      </div>
                    ) : (
                      '-'
                    ),
                },
              ],
            },
            {
              items: [
                {
                  label: t('common.delivery_message'),
                  value: deliveryMessage || '-',
                },
              ],
            },
            {
              items: [
                {
                  label: t('common.delivery_memo'),
                  value: (
                    <div className='flex items-center gap-3 md:gap-6'>
                      <div className='flex items-center gap-2'>
                        <p>{t('order.shipping_schedule', { date: shippingSchedule })}</p>
                        <Popover
                          contentClassName='w-[220px] caption-12 whitespace-pre-line'
                          trigger={<QuestionCircle className={cn('size-5 text-[#917965]')} />}
                          align='left'>
                          <p className='whitespace-pre-line'>
                            {t.rich('order.shipping_note', {
                              b: (chunks) => <b>{chunks}</b>,
                              br: () => <br />,
                            })}
                          </p>
                        </Popover>
                      </div>
                      <div className='vertical-seperator'></div>
                      <p>{t('product.box_count_pieces', { count: order?.metadata.box_count || 1 })}</p>
                      <div className='vertical-seperator'></div>
                      <p>
                        {t('product.weight')}: {order?.metadata.shipping_weight ? order.metadata.shipping_weight + 'kg' : '-'}
                      </p>
                    </div>
                  ),
                },
              ],
            },
          ]}
        />
      </Description>
      <ChangeShippingAddressModal ref={changeShippingAddressModalRef} orderNumber={order?.order_number} />
      <ChangeAddressHistoryModal ref={changeAddressHistoryModalRef} orderNumber={order?.order_number} />
      <OrderTrackingDeliveryModal ref={trackingDeliveryModalRef} invoiceNumber={trackingNumber} />
    </>
  );
};

export default ShippingInfo;
