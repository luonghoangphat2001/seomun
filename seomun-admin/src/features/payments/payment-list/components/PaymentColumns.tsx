import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { Eye, Loader2, MoreHorizontal, Printer, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { OrderStatus } from '@/features/orders';

import { getPaymentReceiptAPI, useRefundPaymentMutation } from '../api';
import { PAYMENT_METHOD_STYLES, PAYMENT_STATUS_STYLES } from '../constants';
import { PaymentStatus } from '../enums';
import { PaymentDetailDialog } from './PaymentDetailDialog';
import type { PaymentRESP } from '../api';
import { AppLabel } from '@/components/shared/app-label';
import { formatKrw } from '@/utils/format-currency';

// === Type definitions ===

type PaymentColumnsOptions = {
  t: TFunction<'page'>;
  rowOffset?: number;
};

// === Components ===

function PaymentActionsCell({ payment, t }: { payment: PaymentRESP; t: TFunction<'page'> }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  const refundDisabled = payment.status !== PaymentStatus.PAID || payment.order.status === OrderStatus.COMPLETED;

  const refundMutation = useRefundPaymentMutation({
    onSuccess: () => {
      toast.success(t('payments.list.actions.refund_success', 'Refund processed successfully'));
      setRefundOpen(false);
      setReason('');
      setAmount('');
      setAmountError('');
    },
    onError: () => {
      toast.error(t('payments.list.actions.refund_error', 'Failed to process refund'));
    },
  });

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const res = await getPaymentReceiptAPI(payment.id);
      if (res.data?.pdf_url) {
        window.open(res.data.pdf_url, '_blank');
      }
    } catch {
      toast.error(t('payments.list.actions.print_error', 'Failed to load receipt.'));
    } finally {
      setIsPrinting(false);
    }
  };

  const handleRefundSubmit = () => {
    if (!reason.trim()) return;
    refundMutation.mutate({
      transactionId: payment.transaction_id,
      payload: { reason: reason.trim(), amount: amount ? Number(amount) : null },
    });
  };

  return (
    <div className='flex justify-center'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setDetailOpen(true)} className='cursor-pointer'>
            <Eye className='mr-2 size-4' />
            {t('payments.list.actions.detail', 'Detail')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint} disabled={isPrinting} className='cursor-pointer'>
            {isPrinting ? <Loader2 className='mr-2 size-4 animate-spin' /> : <Printer className='mr-2 size-4' />}
            {t('payments.list.actions.print_receipt', 'Print')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setRefundOpen(true)} disabled={refundDisabled} className='cursor-pointer text-red-600 focus:text-red-600'>
            <Undo2 className='mr-2 size-4' />
            {t('payments.list.actions.refund', 'Refund')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PaymentDetailDialog paymentId={detailOpen ? payment.id : null} onClose={() => setDetailOpen(false)} t={t} />

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('payments.list.actions.refund_dialog_title', 'Process Refund')}</DialogTitle>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <AppLabel required>{t('payments.list.actions.refund_reason_label', 'Reason')}</AppLabel>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('payments.list.actions.refund_reason_placeholder', 'Enter refund reason')}
              />
            </div>
            <div className='space-y-1.5'>
              <AppLabel>{t('payments.list.actions.refund_amount_AppLabel', 'Amount (KRW)')}</AppLabel>
              <Input
                type='number'
                min={1}
                max={Number(payment.amount)}
                value={amount}
                aria-invalid={Boolean(amountError)}
                onChange={(e) => {
                  const raw = e.target.value;
                  const maxAmount = Number(payment.amount);
                  if (raw !== '' && Number(raw) > maxAmount) {
                    setAmount(String(maxAmount));
                    setAmountError(
                      t('payments.list.actions.refund_amount_error', 'Refund amount cannot exceed the paid amount ({{amount}})', {
                        amount: maxAmount,
                      }),
                    );
                    return;
                  }
                  setAmount(raw);
                  setAmountError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                }}
                placeholder={t('payments.list.actions.refund_amount_placeholder', 'Enter refund amount')}
              />
              {amountError ? (
                <p className='text-destructive text-xs'>{amountError}</p>
              ) : (
                <p className='text-muted-foreground text-xs'>{t('payments.list.actions.refund_amount_hint', 'Leave empty for full refund')}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setRefundOpen(false)} disabled={refundMutation.isPending}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleRefundSubmit} disabled={!reason.trim() || refundMutation.isPending}>
              {refundMutation.isPending ? <Loader2 className='size-4 animate-spin' /> : t('payments.list.actions.refund_submit', 'Submit Refund')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// === Helpers ===

// function formatAmount(amount: string): string {
//   return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(Number(amount));
// }

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
}

// === Column definitions ===

export function getPaymentColumns({ t, rowOffset = 0 }: PaymentColumnsOptions): ColumnDef<PaymentRESP>[] {
  return [
    {
      id: 'no',
      header: t('payments.list.columns.no', 'No'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{rowOffset + row.index + 1}</span>,
    },
    {
      id: 'transaction_id',
      accessorKey: 'transaction_id',
      header: t('payments.list.columns.transaction_id', 'Transaction ID'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.transaction_id}</span>,
    },
    {
      id: 'order',
      accessorKey: 'order',
      header: t('payments.list.columns.order', 'Order'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='text-sm font-medium'>{row.original.order.order_number}</div>
          <div className='text-muted-foreground text-xs'>{row.original.order.contact.company_name ?? row.original.order.user.name}</div>
        </div>
      ),
    },
    {
      id: 'payment_method',
      accessorKey: 'payment_method',
      header: t('payments.list.columns.payment_method', 'Payment Method'),
      enableSorting: false,
      cell: ({ row }) => {
        const method = row.original.payment_method;
        const style = PAYMENT_METHOD_STYLES[method] ?? 'bg-gray-100 text-gray-800';
        return <span className={`rounded px-2 py-0.5 text-xs font-medium ${style}`}>{t(`payments.list.payment_method.${method}`, method)}</span>;
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('payments.list.columns.status', 'Status'),
      enableSorting: true,
      cell: ({ row }) => {
        const s = row.original.status;
        const style = PAYMENT_STATUS_STYLES[s] ?? 'bg-gray-100 text-gray-800';
        return <span className={`rounded px-2 py-0.5 text-xs font-medium ${style}`}>{t(`payments.list.payment_status.${s}`, s)}</span>;
      },
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: t('payments.list.columns.amount', 'Amount'),
      enableSorting: true,
      cell: ({ row }) => <span className='text-sm font-medium'>{formatKrw(row.original.amount)}</span>,
    },
    {
      id: 'paid_at',
      accessorKey: 'paid_at',
      header: t('payments.list.columns.paid_at', 'Paid At'),
      enableSorting: true,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{formatDate(row.original.paid_at)}</span>,
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: t('payments.list.columns.created_at', 'Created At'),
      enableSorting: true,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{formatDate(row.original.created_at)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('payments.list.columns.actions', 'Actions')}</div>,
      enableSorting: false,
      cell: ({ row }) => <PaymentActionsCell payment={row.original} t={t} />,
    },
  ];
}
