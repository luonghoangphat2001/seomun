import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { MoreHorizontal, RotateCcw, Send, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import type { CashReceipt } from '../api';
import { CASH_RECEIPT_STATUS_STYLES, getCashReceiptIssueStatusLabel, getPaymentMethodLabel } from '../constants';
import { CashReceiptIssueStatus, CashReceiptSortField } from '../enums';
import { formatKrw } from '@/utils/format-currency';

type CashReceiptColumnsOptions = {
  t: TFunction<'page'>;
  onIssue: (id: string) => void;
  onPending: (id: string) => void;
  onDelete: (id: string) => void;
  busyId: string | null;
};

// function formatAmount(amount: string | number, currency = 'KRW'): string {
//   return new Intl.NumberFormat('ko-KR', { style: 'currency', currency }).format(Number(amount));
// }

function formatDate(value: string | null): string {
  if (!value) return '-';
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

function renderHeader(label: string) {
  return () => <span className='whitespace-nowrap'>{label}</span>;
}

export function getCashReceiptColumns({ t, onIssue, onPending, onDelete, busyId }: CashReceiptColumnsOptions): ColumnDef<CashReceipt>[] {
  return [
    {
      id: CashReceiptSortField.ORDER_NUMBER,
      header: renderHeader(t('orders.cash_receipts.columns.order_number')),
      enableSorting: true,
      minSize: 130,
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.order.order_number}</span>,
    },
    // {
    //   header: renderHeader(t('orders.cash_receipts.columns.company_name')),
    //   cell: ({ row }) => <span>{row.original.order.company_name ?? row.original.order.user.customer?.company_name ?? '-'}</span>,
    // },
    {
      id: 'payment_method',
      header: renderHeader(t('orders.cash_receipts.original.columns.payment_method')),
      enableSorting: false,
      minSize: 110,
      cell: ({ row }) => <span className='text-sm'>{getPaymentMethodLabel(row.original.payment_method, t)}</span>,
    },
    {
      id: CashReceiptSortField.TOTAL_TRANSACTION_AMOUNT,
      header: renderHeader(t('orders.cash_receipts.columns.total_transaction_amount')),
      enableSorting: true,
      minSize: 140,
      cell: ({ row }) => <span className='text-sm font-semibold'>{formatKrw(row.original.amount)}</span>,
    },
    {
      id: CashReceiptSortField.ISSUE_STATUS,
      header: renderHeader(t('orders.cash_receipts.columns.status')),
      enableSorting: true,
      minSize: 110,
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded px-2.5 py-1 text-xs leading-none font-medium whitespace-nowrap ${CASH_RECEIPT_STATUS_STYLES[row.original.cash_receipt_status]}`}
        >
          {getCashReceiptIssueStatusLabel(row.original.cash_receipt_status, t)}
        </span>
      ),
    },
    {
      id: 'cash_receipt_issued_at',
      header: renderHeader(t('orders.cash_receipts.columns.issuance_date')),
      enableSorting: false,
      minSize: 140,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{formatDate(row.original.cash_receipt_issued_at)}</span>,
    },
    {
      id: CashReceiptSortField.CREATED_AT,
      header: renderHeader(t('orders.cash_receipts.columns.created_at')),
      enableSorting: true,
      minSize: 130,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{formatDate(row.original.created_at)}</span>,
    },
    {
      accessorKey: 'receipt_notes',
      header: renderHeader(t('orders.cash_receipts.columns.remarks')),
      enableSorting: false,
      minSize: 140,
      cell: ({ row }) => (
        <div className='max-w-45 truncate text-sm' title={row.original.receipt_notes ?? undefined}>
          {row.original.receipt_notes || '-'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('orders.cash_receipts.columns.actions')}</div>,
      enableSorting: false,
      minSize: 80,
      cell: ({ row }) => {
        const receipt = row.original;
        const id = String(receipt.id);
        const isBusy = busyId === id;
        const isDeleted = receipt.cash_receipt_status === CashReceiptIssueStatus.DELETED;

        return (
          <div className='flex justify-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type='button' variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {receipt.cash_receipt_status === CashReceiptIssueStatus.PENDING ? (
                  <DropdownMenuItem onClick={() => onIssue(id)} disabled={isBusy} className='cursor-pointer'>
                    <Send className='mr-2 size-4' />
                    {t('orders.cash_receipts.actions.issue')}
                  </DropdownMenuItem>
                ) : null}
                {receipt.cash_receipt_status === CashReceiptIssueStatus.ISSUED ? (
                  <DropdownMenuItem onClick={() => onPending(id)} disabled={isBusy} className='cursor-pointer'>
                    <RotateCcw className='mr-2 size-4' />
                    {t('orders.cash_receipts.actions.pending')}
                  </DropdownMenuItem>
                ) : null}
                {!isDeleted ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(id)} disabled={isBusy} className='cursor-pointer text-red-600 focus:text-red-600'>
                      <Trash2 className='mr-2 size-4' />
                      {t('orders.cash_receipts.actions.delete')}
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
