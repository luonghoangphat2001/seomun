'use client';

import { OrderCreateRESP } from '@/apis/order/order.response';
import { Description, DescriptionContent, SafeImage } from '@/components/common';
import { DATE_FORMAT } from '@/constants/common';
import { OrderPaymentMethod } from '@/enums/order';
import { useAuthStore } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type AccountInfoProps = {
  order?: OrderCreateRESP;
};

const AccountInfo = ({ order }: AccountInfoProps) => {
  const t = useTranslations();
  const { profile } = useAuthStore();

  return (
    <div>
      <Description
        isCollapse={false}
        title={
          <div className='flex flex-wrap items-center gap-3'>
            <h3>{t('my.dedicated_account')}</h3>
            {order?.payment_method === OrderPaymentMethod.VIRTUAL_ACCOUNT && (
              <p className='title-16 text-text-brand'>
                {profile?.virtual_account?.bank.name} ({profile?.virtual_account?.account_number})
              </p>
            )}
          </div>
        }>
        <DescriptionContent
          labelClassName='md:w-50'
          rows={[
            {
              items: [
                {
                  label: t('order.total_amount_received'),
                  value: order ? `${formatCurrency(order.totals.subtotal)} (${formatCurrency(order.totals.tax)})` : '-',
                },
                { label: t('common.point_usage_amount'), value: `${order?.totals.point_used || 0} P` },
              ],
            },
            {
              items: [
                {
                  label: `${t('common.shipping_fee')}`,
                  value: order ? formatCurrency(Number(order.totals.shipping_fee)) : '-',
                },
                {
                  label: t('order.amount_deposited'),
                  value: (
                    <p className='text-text-brand'>
                      {order ? formatCurrency(Number(order.totals.total)) : '-'}{' '}
                      <span className='body-16 text-text-secondary ml-1'>
                        ({t('order.point_earned')}: {order?.metadata.estimated_points_earned || 0} P)
                      </span>
                    </p>
                  ),
                },
              ],
            },
            {
              items: [
                {
                  label: t('order.payment_method'),
                  value:
                    order?.payment_method === OrderPaymentMethod.VIRTUAL_ACCOUNT ? (
                      '전용계좌'
                    ) : (
                      <div className='flex items-center gap-1'>
                        <p>기타결제</p>
                        <SafeImage src='/images/toss-logo.png' alt='toss' width={20} height={20} />
                      </div>
                    ),
                },
                {
                  label: t('order.order_date_time'),
                  value: order?.created_at ? formatDate(order.created_at, DATE_FORMAT.DATE_TIME) : '-',
                },
              ],
            },
          ]}
        />
      </Description>
    </div>
  );
};

export default AccountInfo;
