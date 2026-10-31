'use client';

import { Button } from '@/components/common';
import AccountInfo from './AccountInfo';
import OrdererInfo from './OrdererInfo';
import { useGetOrderDetail } from '@/apis/order/order.query';
import { useDownloadQuotationPDFMutation } from '@/apis/my/order/order.query';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { handleBlobDownload } from '@/lib/utils';
import { ROUTES } from '@/routes';
import PopbillPaymentStatus from './PopbillPaymentStatus';

const OrderResultComponent = () => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || undefined;
  const transactionId = searchParams.get('transactionId') || undefined;

  //api order detail
  const { data: orderDetail } = useGetOrderDetail(orderNumber);
  const { mutateAsync: downloadQuotationPDF, isPending: isDownloadingQuotation } = useDownloadQuotationPDFMutation();

  const backToHome = () => {
    router.push(ROUTES.HOME);
  };

  const viewDetailOrder = () => {
    router.push(ROUTES.MY_PAGE.ORDER_DETAIL(orderNumber || ''));
  };

  if (transactionId) {
    return <PopbillPaymentStatus orderNumber={orderNumber} transactionId={transactionId} />;
  }

  const handleDownloadQuotation = async () => {
    if (!orderNumber || isDownloadingQuotation) return;

    try {
      const blob = await downloadQuotationPDF(orderNumber);
      handleBlobDownload(blob, `견적서_${orderNumber}.pdf`);
    } catch (error) {
      console.error('Failed to download quotation PDF:', error);
    }
  };

  return (
    <main className='mx-auto mt-14 mb-12 max-w-284 space-y-6 px-4 md:mt-12 md:mb-37.5 md:space-y-12'>
      <div className='space-y-2 pb-6 text-center md:pb-0'>
        <h2 className='title-20 md:title-32'>{t('order.success_complete')}</h2>
        <p className='body-16'>{t('order.please_deposit_amount')}</p>
      </div>
      <AccountInfo order={orderDetail} />
      <OrdererInfo order={orderDetail} />
      <div className='flex gap-3 md:justify-center md:gap-4'>
        <Button
          variant='outline'
          className='body-16 flex-2 px-3 py-2 md:h-12 md:flex-none md:px-6 md:py-3'
          onClick={() => void handleDownloadQuotation()}
          loading={isDownloadingQuotation}
          disabled={!orderNumber}>
          {t('order.quotation')}
        </Button>
        <Button
          variant='outline-primary'
          className='body-16 flex-3 px-3 py-2 md:h-12 md:flex-none md:px-6 md:py-3'
          onClick={backToHome}>
          {t('order.continue_shopping')}
        </Button>
        <Button className='body-16 flex-3 px-3 py-2 md:h-12 md:flex-none md:px-6 md:py-3' onClick={viewDetailOrder}>
          {t('sidebar.items.order_tracking')}
        </Button>
      </div>
    </main>
  );
};

export default OrderResultComponent;
