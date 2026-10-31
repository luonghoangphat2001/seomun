import type { TFunction } from 'i18next';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/features/orders';
import type { OrderStatus } from '@/features/orders';
import { formatKrw } from '@/utils/format-currency';

import { usePaymentDetailQuery } from '../api';
import { PAYMENT_METHOD_STYLES, PAYMENT_STATUS_STYLES } from '../constants';

// === Type definitions ===

type PaymentDetailDialogProps = {
  paymentId: number | null;
  onClose: () => void;
  t: TFunction<'page'>;
};

// === Helpers ===

function formatAmount(amount: string | number | null | undefined): string {
  return formatKrw(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('ko-KR');
}

// === Components ===

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className='rounded-lg border bg-white p-4 shadow-sm'>
      <h4 className='mb-3 text-sm font-semibold'>{title}</h4>
      <div className='space-y-2'>{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-3'>
      <span className='text-muted-foreground shrink-0 text-xs'>{label}</span>
      <span className='text-right text-sm font-medium break-all'>{value || '-'}</span>
    </div>
  );
}

export function PaymentDetailDialog({ paymentId, onClose, t }: PaymentDetailDialogProps) {
  const { data, isLoading } = usePaymentDetailQuery(paymentId ?? 0, { enabled: paymentId !== null });
  const payment = data?.data.payment;
  const order = payment?.order;

  const tr = (key: string) => String(t(`payments.list.detail_dialog.${key}` as never, { defaultValue: key } as never));

  return (
    <Dialog open={paymentId !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className='scrollbar-slim sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{tr('title')}</DialogTitle>
          <DialogDescription>{tr('description')}</DialogDescription>
        </DialogHeader>

        {isLoading || !payment || !order ? (
          <div className='text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm'>
            <Loader2 className='size-4 animate-spin' />
          </div>
        ) : (
          <div className='max-h-[70vh] space-y-3 overflow-y-auto py-1'>
            <Section title={tr('payment_info')}>
              <Row label={tr('transaction_id')} value={<span className='font-mono text-xs'>{payment.transaction_id}</span>} />
              <Row
                label={tr('payment_method')}
                value={
                  <span className={`rounded px-2 py-0.5 text-xs ${PAYMENT_METHOD_STYLES[payment.payment_method] ?? 'bg-gray-100 text-gray-800'}`}>
                    {t(`payments.list.payment_method.${payment.payment_method}`, payment.payment_method)}
                  </span>
                }
              />
              <Row
                label={tr('status')}
                value={
                  <span className={`rounded px-2 py-0.5 text-xs ${PAYMENT_STATUS_STYLES[payment.status] ?? 'bg-gray-100 text-gray-800'}`}>
                    {t(`payments.list.payment_status.${payment.status}`, payment.status)}
                  </span>
                }
              />
              {payment.pg_name ? <Row label={tr('pg_name')} value={payment.pg_name} /> : null}
              {payment.card_number ? (
                <Row label={tr('card_number')} value={<span className='font-mono text-xs'>{payment.card_number}</span>} />
              ) : null}
              {payment.virtual_account_number ? (
                <Row label={tr('virtual_account')} value={<span className='font-mono text-xs'>{payment.virtual_account_number}</span>} />
              ) : null}
              <Row label={tr('paid_at')} value={formatDate(payment.paid_at)} />
              <Row label={tr('created_at')} value={formatDate(payment.created_at)} />
            </Section>

            <Section title={tr('order_info')}>
              <Row label={tr('order_number')} value={order.order_number} />
              <Row
                label={tr('order_status')}
                value={
                  <span className={`rounded px-2 py-0.5 text-xs ${ORDER_STATUS_STYLES[order.status as OrderStatus] ?? 'bg-gray-100 text-gray-800'}`}>
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]?.(t) ?? order.status}
                  </span>
                }
              />
              <Row label={tr('product')} value={order.product?.name} />
            </Section>

            <Section title={tr('customer_info')}>
              <Row label={tr('customer_name')} value={order.user?.name} />
              <Row label={tr('email')} value={order.user?.email} />
              <Row label={tr('phone')} value={order.user?.phone ?? order.contact?.phone} />
            </Section>

            <Section title={tr('amount_info')}>
              <Row label={tr('subtotal')} value={formatAmount(order.totals?.subtotal)} />
              <Row label={tr('discount')} value={formatAmount(order.totals?.discount)} />
              <Row label={tr('tax')} value={formatAmount(order.totals?.tax)} />
              <Row label={tr('shipping_fee')} value={formatAmount(order.totals?.shipping_fee)} />
              <Row label={tr('total')} value={<span className='font-semibold'>{formatAmount(payment.amount)}</span>} />
            </Section>

            {order.shipping ? (
              <Section title={tr('shipping_info')}>
                <Row label={tr('recipient')} value={order.shipping.name} />
                <Row label={tr('phone')} value={order.shipping.phone} />
                <Row
                  label={tr('address')}
                  value={[order.shipping.postcode, order.shipping.address, order.shipping.address_detail].filter(Boolean).join(' ') || '-'}
                />
                {order.shipping.shipping_memo ? <Row label={tr('memo')} value={order.shipping.shipping_memo} /> : null}
              </Section>
            ) : null}

            {order.metadata?.selected_options?.length ? (
              <Section title={tr('selected_options')}>
                {order.metadata.selected_options.map((opt) => (
                  <Row key={opt.group.id} label={opt.group.name} value={opt.option.label} />
                ))}
                {order.metadata.customer_note ? <Row label={tr('customer_note')} value={order.metadata.customer_note} /> : null}
              </Section>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
