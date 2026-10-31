import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppSelect } from '@/components/shared/app-select';
import { Button } from '@/components/ui/button';

import { useUpdateOrderStatusMutation } from '../api';
import type { OrderListItemRESP } from '../api/order.response';
import { BANK_CODE_TO_BANK, BANK_LABELS, getOrderStatusOptions, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, PAYMENT_METHOD_LABELS } from '../constants';
import { PaymentMethod, type OrderStatus } from '../enums';
import { formatKrw } from '@/utils/format-currency';
import { formatLocalDate } from '@/utils/format-date';

import { getOrderCompanyName } from '../utils/order-company-name';
import { OrderInfoCard, OrderInfoRow } from './OrderInfoCard';

interface OrderInfoProps {
  order: OrderListItemRESP;
  readOnly?: boolean;
}

function TossLogo() {
  return (
    <span className='inline-flex items-center gap-1'>
      <svg viewBox='0 0 40 40' className='size-4' aria-hidden>
        <path d='M20 3C10.6 3 3 10.6 3 20C3 29.4 10.6 37 20 37Z' fill='#4A94FF' />
        <path d='M20 3C29.4 3 37 10.6 37 20C37 29.4 29.4 37 20 37Z' fill='#0050E5' />
      </svg>
      <span className='text-[13px] leading-none font-extrabold tracking-tight text-[#191F28]'>toss</span>
    </span>
  );
}

export function OrderOrdererInfo({ order }: OrderInfoProps) {
  const { t } = useTranslation('page');

  return (
    <OrderInfoCard title={t('orders.detail.orderer_info.title')}>
      <OrderInfoRow label={t('orders.detail.basic_info.order_number')}>{order.order_number}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.basic_info.order_date')}>{formatLocalDate(order.metadata.placed_at ?? order.created_at)}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.basic_info.orderer_name')}>{order.user.name}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.basic_info.company')}>{getOrderCompanyName(order) || '-'}</OrderInfoRow>
      <OrderInfoRow label={t('orders.detail.basic_info.contact_number')}>{order.contact.phone || '-'}</OrderInfoRow>
    </OrderInfoCard>
  );
}

export function OrderPaymentInfo({ order, readOnly = false }: OrderInfoProps) {
  const { t } = useTranslation('page');

  // === Hooks ===

  const updateStatusMutation = useUpdateOrderStatusMutation();

  // === State ===

  // Undefined means "no pending edit" — the select falls back to the order's own status.
  const [pickedStatus, setPickedStatus] = useState<OrderStatus>();

  // === Variables ===

  const status = pickedStatus ?? (order.status as OrderStatus);
  const paymentMethodLabel = PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod]?.(t) ?? order.payment_method;
  const transaction = order.payment_transaction;
  const bank = transaction?.virtual_account_bank ? BANK_CODE_TO_BANK[transaction.virtual_account_bank] : undefined;

  // === Functions ===

  function handleUpdateStatus() {
    updateStatusMutation.mutate(
      { orderNumber: order.order_number, status },
      {
        onSuccess: () => {
          setPickedStatus(undefined);
          toast.success(t('orders.detail.messages.status_update_success'));
        },
        onError: () => toast.error(t('orders.detail.messages.status_update_error')),
      },
    );
  }

  return (
    <OrderInfoCard title={t('orders.detail.payment_info.title')}>
      <OrderInfoRow label={t('orders.detail.basic_info.payment_method')}>
        <span className='flex items-center gap-2'>
          {paymentMethodLabel}
          {order.payment_method === PaymentMethod.TOSS && <TossLogo />}
        </span>
      </OrderInfoRow>

      {order.payment_method === PaymentMethod.VIRTUAL_ACCOUNT && transaction?.virtual_account_number && (
        <OrderInfoRow label={t('orders.detail.basic_info.account_number')}>
          <span className='flex flex-wrap items-center gap-2'>
            {(bank || transaction.virtual_account_bank) && (
              <span className='rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800'>
                {bank ? BANK_LABELS[bank](t) : transaction.virtual_account_bank}
              </span>
            )}
            {transaction.virtual_account_number}
          </span>
        </OrderInfoRow>
      )}

      {order.payment_method === PaymentMethod.CARD && transaction?.card_number && (
        <OrderInfoRow label={t('orders.detail.basic_info.card_number')}>{transaction.card_number}</OrderInfoRow>
      )}

      <OrderInfoRow label={t('orders.detail.basic_info.payment_amount')}>
        <span className='font-semibold'>{formatKrw(order.payment_details.payment_amount)}</span>
      </OrderInfoRow>

      <OrderInfoRow label={t('orders.detail.basic_info.current_status')}>
        <div className='flex min-w-0 items-center gap-2'>
          {readOnly ? (
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-800'}`}>
              {ORDER_STATUS_LABELS[status]?.(t) ?? order.status}
            </span>
          ) : (
            <>
              <AppSelect
                options={getOrderStatusOptions(t)}
                value={status}
                onValueChange={setPickedStatus}
                size='sm'
                className='min-w-0 flex-1'
                aria-label={t('orders.detail.basic_info.current_status')}
              />
              <Button
                size='sm'
                className='shrink-0'
                onClick={handleUpdateStatus}
                disabled={status === order.status || updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? <Loader2 className='size-4 animate-spin' /> : null}
                {t('orders.detail.basic_info.update_status')}
              </Button>
            </>
          )}
        </div>
      </OrderInfoRow>
    </OrderInfoCard>
  );
}

export function OrderBasicInfo({ order, readOnly = false }: OrderInfoProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <OrderOrdererInfo order={order} />
      <OrderPaymentInfo order={order} readOnly={readOnly} />
    </div>
  );
}
