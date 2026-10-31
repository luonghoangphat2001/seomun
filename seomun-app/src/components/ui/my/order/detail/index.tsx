'use client';

import { ROUTES } from '@/routes';
import OrdererInfo from './OrdererInfo';
import ProductInfo from './ProductInfo';
import ShippingInfo from './ShippingInfo';
import PaymentInfo from './PaymentInfo';
import { Button, ModalHandle, OrderStatusBar, Skeleton } from '@/components/common';
import { ChevronRightThin, Printer } from '@/icons';
import { OrderHistoryStatus } from '@/enums/order';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { ReviewOrderModal } from './review-modal/ReviewOrderModal';
import { isShippingOrderHistoryStatus, ORDER_STATUS_CONFIG, SHIPPING_STATUS_CONFIG } from '@/constants/order';
import PageTitle from '../../components/PageTitle';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import {
  useDownloadQuotationPDFMutation,
  useDownloadTransactionStatementPDFMutation,
  useOrderHistoryDetailQuery,
} from '@/apis/my/order/order.query';
import { DATE_FORMAT } from '@/constants/common';
import { formatDate, handleBlobDownload } from '@/lib/utils';

const OrderDetailSkeleton = () => (
  <div className='mt-4 space-y-4 md:mt-6 md:space-y-12'>
    <Skeleton className='h-8 w-36' />
    <Skeleton className='h-22 w-full' />
    {[1, 2, 3, 4].map((item) => (
      <div key={item} className='space-y-4'>
        <Skeleton className='h-7 w-48' />
        <Skeleton className='h-48 w-full' />
      </div>
    ))}
  </div>
);

const MyOrderDetailComponent = () => {
  const t = useTranslations();
  const router = useRouter();
  const { orderNumber } = useParams();
  const reviewModalRef = useRef<ModalHandle>(null);
  const [isDownloadingQuotation, setIsDownloadingQuotation] = useState(false);
  const [isDownloadingTransactionStatement, setIsDownloadingTransactionStatement] = useState(false);
  const { mutateAsync: downloadQuotationPDF } = useDownloadQuotationPDFMutation();
  const { mutateAsync: downloadTransactionStatementPDF } = useDownloadTransactionStatementPDFMutation();

  const { data: dataDetail, isLoading } = useOrderHistoryDetailQuery(orderNumber as string);
  const currentStatus = dataDetail?.status;
  const isShippingStatus = isShippingOrderHistoryStatus(currentStatus);
  const hasReview = (dataDetail?.reviews.length ?? 0) > 0;
  const designGroupTitles =
    dataDetail?.items
      .map((item) => item.configuration.design.design_group?.title)
      .filter((title): title is string => Boolean(title))
      .join(' / ') || '-';

  const openReviewModal = () => {
    reviewModalRef.current?.open();
  };

  const handleDownloadQuotation = async () => {
    if (!dataDetail?.order_number) return;

    setIsDownloadingQuotation(true);

    try {
      const blob = await downloadQuotationPDF(dataDetail.order_number);
      handleBlobDownload(blob, `견적서_${dataDetail.order_number}.pdf`);
    } catch (error) {
      console.error('Failed to download quotation PDF:', error);
    } finally {
      setIsDownloadingQuotation(false);
    }
  };

  const handleDownloadTransactionStatement = async () => {
    if (!dataDetail?.order_number) return;

    setIsDownloadingTransactionStatement(true);

    try {
      const blob = await downloadTransactionStatementPDF(dataDetail.order_number);
      handleBlobDownload(blob, `거래명세서_${dataDetail.order_number}.pdf`);
    } catch (error) {
      console.error('Failed to download transaction statement PDF:', error);
    } finally {
      setIsDownloadingTransactionStatement(false);
    }
  };

  return (
    <section className='relative'>
      <PageTitle title={t('order.order_history')} returnRoute={ROUTES.MY_PAGE.ORDER} />
      {isLoading ? (
        <OrderDetailSkeleton />
      ) : (
        <>
          <div className='mt-4 space-y-4 md:mt-6 md:space-y-12'>
            <div className='mobile-seperator'></div>
            <OrderStatusBar
              statusConfig={isShippingStatus ? SHIPPING_STATUS_CONFIG : ORDER_STATUS_CONFIG}
              title={t(isShippingStatus ? 'order.shipping_status' : 'order.production_status')}
              showArrow
              status={currentStatus}
            />
            <div className='mobile-seperator'></div>
            <div className='flex flex-wrap items-center gap-x-6 gap-y-3'>
              <p className='title-16 md:title-18'>{designGroupTitles}</p>
              <div className='vertical-seperator hidden md:block'></div>
              <div className='flex items-center gap-3'>
                <p className='body-14'>{t('common.order_number')}</p>
                <p className='title-16 text-text-brand'>{dataDetail?.order_number ?? '-'}</p>
              </div>
              <div className='vertical-seperator hidden md:block'></div>
              <div className='flex items-center gap-3'>
                <p className='body-14'>{t('common.order_date')}</p>
                <p className='title-16 font-semibold'>
                  {dataDetail?.created_at ? formatDate(dataDetail.created_at, DATE_FORMAT.DATE_TIME_WITH_DOT) : '-'}
                </p>
              </div>
            </div>
            <OrdererInfo order={dataDetail} />
            <div className='mobile-seperator'></div>
            <ProductInfo
              orderNumber={dataDetail?.order_number}
              status={dataDetail?.status}
              totalPrice={dataDetail?.totals.total}
              items={dataDetail?.items ?? []}
              productThumbnail={dataDetail?.product?.images}
            />
            <div className='mobile-seperator'></div>
            <ShippingInfo order={dataDetail} />
            <div className='mobile-seperator'></div>
            <PaymentInfo order={dataDetail} />
          </div>
          <div className='border-border-soft fixed bottom-0 left-0 flex w-full flex-col flex-wrap gap-3 border-t bg-white p-4 pb-6 shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.1),-2px_-31px_30px_0px_rgba(0,0,0,0.02)] md:static md:mt-10 md:flex-row md:justify-between md:border-none md:p-0 md:shadow-none'>
            <Button
              variant='outline'
              size='lg'
              className='body-16 hidden md:inline-flex'
              leftIcon={<ChevronRightThin className='size-6 rotate-180' />}
              onClick={() => router.push(ROUTES.MY_PAGE.ORDER)}>
              {t('customer_service.inventory')}
            </Button>
            <div className='flex flex-col flex-wrap gap-3 md:flex-row'>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  size='lg'
                  className='body-16 flex-1 md:flex-none'
                  rightIcon={<Printer className='size-6' />}
                  loading={isDownloadingQuotation}
                  onClick={() => void handleDownloadQuotation()}>
                  {t('order.quotation')}
                </Button>
                <Button
                  variant='outline'
                  size='lg'
                  className='body-16 flex-1 truncate md:flex-none'
                  rightIcon={<Printer className='size-6' />}
                  loading={isDownloadingTransactionStatement}
                  onClick={() => void handleDownloadTransactionStatement()}>
                  {t('order.transaction_statement')}
                </Button>
              </div>
              {(currentStatus === OrderHistoryStatus.PRODUCTION_DONE || currentStatus === OrderHistoryStatus.COMPLETED) && (
                <Button size='lg' className='body-16 flex-1 truncate md:flex-none' onClick={openReviewModal} disabled={hasReview}>
                  {t('sidebar.items.write_review')}
                </Button>
              )}
            </div>
          </div>
          <ReviewOrderModal
            ref={reviewModalRef}
            orderId={dataDetail?.id}
            items={dataDetail?.items}
            productThumbnail={dataDetail?.product?.images}
          />
        </>
      )}
    </section>
  );
};

export default MyOrderDetailComponent;
