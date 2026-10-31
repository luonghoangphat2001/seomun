'use client';

import { OrderHistoryOrderItemRESP, OrderHistoryRESP } from '@/apis/my/order/order.response';
import { getOrderHistoryDescription, getOrderOptionDescription } from '@/apis/my/order/order.service';
import { Button } from '@/components/common';
import OrderStatusBage from '@/components/common/badge/OrderStatusBage';
import { DATE_FORMAT } from '@/constants/common';
import { DesignSourceType } from '@/enums/common';
import { OrderHistoryStatus } from '@/enums/order';
import { ChevronRightThin } from '@/icons';
import { useRouter } from '@/i18n/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createProductOptionGroupNameTranslator } from '@/lib/product-option-labels';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type OrderCardListProps = {
  orders: OrderHistoryRESP[];
};

const getOrderItems = (order: OrderHistoryRESP) => order.items ?? [];

const getOrderItemName = (item: OrderHistoryOrderItemRESP) =>
  item.product_snapshot?.name || item.configuration?.product_name || item.title;

const getOrderItemImage = (item: OrderHistoryOrderItemRESP, fallbackImage: string | null) => {
  const isWebEditor = item.configuration?.design?.design_group?.source_type === DesignSourceType.WEB_EDITOR;

  if (!isWebEditor && item.product_snapshot?.first_image) return item.product_snapshot.first_image;

  return (
    item.design?.front?.preview_image_path ||
    item.design?.back?.preview_image_path ||
    item.configuration?.design_preview ||
    fallbackImage
  );
};

const OrderCardList = ({ orders }: OrderCardListProps) => {
  const t = useTranslations();
  const router = useRouter();
  const translateGroupName = createProductOptionGroupNameTranslator(t);

  const goToOrderDetail = (orderNumber: string) => {
    router.push(ROUTES.MY_PAGE.ORDER_DETAIL(orderNumber));
  };

  return (
    <div className='text-text-main block space-y-4 md:hidden'>
      {orders.map((order, index) => {
        const orderStatus = order.status;
        const isResubmitFile =
          orderStatus === OrderHistoryStatus.AWAITING_PAYMENT ||
          orderStatus === OrderHistoryStatus.PENDING_RECEPTION ||
          orderStatus === OrderHistoryStatus.PENDING_CORRECTION;
        const isConfirmDraft = orderStatus === OrderHistoryStatus.DESIGN_CONFIRMATION_REQUESTED;
        const hasReview = order.review.has_review;
        const hasOrderActions = isResubmitFile || isConfirmDraft;
        const items = getOrderItems(order);

        return (
          <div
            key={`${order.order_number}-${order.product_spec?.cart_item_id ?? 'item'}-${index}`}
            className='border-border-soft rounded-xl border p-4'
            onClick={() => router.push(ROUTES.MY_PAGE.ORDER_DETAIL(order.order_number))}>
            <div className='flex flex-wrap items-center justify-between'>
              <p className='caption-12 text-text-secondary'>{formatDate(order.ordered_at, DATE_FORMAT.DATE_HOUR_MINUTE)}</p>
              <OrderStatusBage status={order.status} label={order.status_label} />
            </div>
            <div className='border-border-soft mt-4 border-t pt-4'>
              <p className='body-14'>{order.order_number}</p>
              {items.length ? (
                <div className='mt-3 space-y-3'>
                  {items.map((item) => {
                    const imageUrl = getOrderItemImage(item, order.thumbnail_url);

                    return (
                      <div key={item.id} className='flex justify-between gap-3'>
                        <div className='max-w-49.25 space-y-1'>
                          <p className='title-14'>{getOrderItemName(item)}</p>
                          <p className='caption-12'>{getOrderOptionDescription(item.options, translateGroupName)}</p>
                        </div>
                        <div className='relative h-14 w-14 shrink-0'>
                          {imageUrl && <Image src={imageUrl} alt={getOrderItemName(item)} fill className='object-cover' />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className='mt-3 flex justify-between'>
                  <div className='max-w-49.25 space-y-1'>
                    <p className='title-14'>{order.product_name}</p>
                    <p className='caption-12'>{getOrderHistoryDescription(order, translateGroupName)}</p>
                  </div>
                  <div className='relative h-14 w-14'>
                    {order.thumbnail_url && (
                      <Image src={order.thumbnail_url} alt={order.product_name} fill className='object-cover' />
                    )}
                  </div>
                </div>
              )}
              <div className='mt-2 flex items-center justify-between'>
                <p className='body-16'>{formatCurrency(order.amount)}</p>
              </div>
              {hasOrderActions && (
                <div className='mt-3 flex gap-3'>
                  {(isResubmitFile || isConfirmDraft) && (
                    <Button
                      size='sm'
                      variant='outline'
                      className='body-14 flex-1'
                      onClick={(event) => {
                        event.stopPropagation();
                        goToOrderDetail(order.order_number);
                      }}>
                      {t('order.proofreading_confirm')}
                    </Button>
                  )}
                  {isResubmitFile && (
                    <Button
                      size='sm'
                      variant='outline-primary'
                      className='body-14 flex-1'
                      onClick={(event) => {
                        event.stopPropagation();
                        goToOrderDetail(order.order_number);
                      }}>
                      {t('order.resubmit_file')}
                    </Button>
                  )}
                  {isConfirmDraft && (
                    <Button
                      size='sm'
                      className='body-14 flex-1'
                      onClick={(event) => {
                        event.stopPropagation();
                        goToOrderDetail(order.order_number);
                      }}>
                      {t('order.confirm_draft')}
                    </Button>
                  )}
                </div>
              )}
              {hasReview && (
                <div className='border-border-soft mt-4 flex items-center justify-between border-t pt-4'>
                  <p className='body-14'>[{t('common.review_completed')}]</p>
                  <button
                    type='button'
                    className='body-14 text-text-brand flex items-center gap-1'
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(ROUTES.MY_PAGE.REVIEW);
                    }}>
                    {t('common.view_review')}
                    <ChevronRightThin className='size-4' />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderCardList;
