'use client';

import type { OrderHistoryItemRESP } from '@/apis/my/order/order.response';
import { Description, DescriptionContent, SafeImage } from '@/components/common';
import { DATE_FORMAT } from '@/constants/common';
import { PaymentStatus } from '@/enums/common';
import { OrderPaymentMethod } from '@/enums/order';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type PaymentInfoProps = {
  order?: OrderHistoryItemRESP;
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { labelKey: string; className: string }> = {
  [PaymentStatus.PENDING]: { labelKey: 'order.payment_status.pending', className: 'bg-[#F59E0B]' },
  [PaymentStatus.PROCESSING]: { labelKey: 'order.payment_status.processing', className: 'bg-[#3B82F6]' },
  [PaymentStatus.PAID]: { labelKey: 'order.payment_status.paid', className: 'bg-[#22C55E]' },
  [PaymentStatus.FAILED]: { labelKey: 'order.payment_status.failed', className: 'bg-[#EF4444]' },
  [PaymentStatus.CANCELLED]: { labelKey: 'order.payment_status.cancelled', className: 'bg-[#6B7280]' },
  [PaymentStatus.REFUNDED]: { labelKey: 'order.payment_status.refunded', className: 'bg-[#8B5CF6]' },
  [PaymentStatus.PARTIALLY_REFUNDED]: { labelKey: 'order.payment_status.partially_refunded', className: 'bg-[#8B5CF6]' },
  [PaymentStatus.EXPIRED]: { labelKey: 'order.payment_status.expired', className: 'bg-[#6B7280]' },
};

const PaymentInfo = ({ order }: PaymentInfoProps) => {
  const t = useTranslations();
  const transaction = order?.payment_transaction;
  const paymentStatus = transaction?.status ?? order?.payment_status;
  const paymentMethod = transaction?.payment_method ?? order?.payment_method;
  const paymentStatusConfig = paymentStatus ? PAYMENT_STATUS_CONFIG[paymentStatus as PaymentStatus] : undefined;

  return (
    <Description isCollapse={false} title={t('order.payment_info')}>
      <DescriptionContent
        rows={[
          {
            items: [
              {
                label: t('common.payment_method'),
                value: paymentMethod ? (
                  paymentMethod === OrderPaymentMethod.VIRTUAL_ACCOUNT ? (
                    '전용계좌'
                  ) : (
                    <div className='flex items-center gap-1'>
                      <p>기타결제</p>
                      <SafeImage src='/images/toss-logo.png' alt='toss' width={20} height={20} />
                    </div>
                  )
                ) : (
                  '-'
                ),
              },
              {
                label: t('common.payment_status'),
                value: paymentStatus ? (
                  <div className='flex flex-wrap items-center gap-2'>
                    <p
                      className={cn(
                        'caption-12 rounded-lg px-2 py-0.5 font-bold text-gray-50',
                        paymentStatusConfig?.className ?? 'bg-gray-500',
                      )}>
                      {paymentStatusConfig ? t(paymentStatusConfig.labelKey) : paymentStatus}
                    </p>
                    {transaction?.paid_at && (
                      <p className='body-14'>
                        {t('order.payment_time')}: {formatDate(transaction.paid_at, DATE_FORMAT.DEFAULT)}
                      </p>
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
                label: t('common.order_amount'),
                value: order ? (
                  <div className='flex flex-wrap items-center gap-1'>
                    <p className='title-16 md:title-18 text-text-brand font-semibold'>{formatCurrency(order.totals.total)}</p>
                    <p className='caption-12 md:body-14'>
                      (제품 금액 : {formatCurrency(order.totals.subtotal)} / 운임료 : {formatCurrency(order.totals.shipping_fee)}{' '}
                      / 세금 : {formatCurrency(order.totals.tax)})
                    </p>
                  </div>
                ) : (
                  '-'
                ),
              },
            ],
          },
        ]}
      />
    </Description>
  );
};

export default PaymentInfo;
