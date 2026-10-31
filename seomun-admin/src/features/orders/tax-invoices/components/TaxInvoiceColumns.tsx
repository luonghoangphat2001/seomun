import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { MoreHorizontal, RotateCcw, Send, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatKrw } from '@/utils/format-currency';

import type { TaxInvoice } from '../api';
import { TAX_INVOICE_STATUS_STYLES, getPaymentMethodLabel, getTaxInvoiceIssueStatusLabel } from '../constants';
import { TaxInvoiceIssueStatus, TaxInvoiceSortField } from '../enums';

type TaxInvoiceColumnsOptions = {
  t: TFunction<'page'>;
  onIssue: (id: string) => void;
  onPending: (id: string) => void;
  onDelete: (id: string) => void;
  busyId: string | null;
};

function formatAmount(amount: string | number): string {
  return formatKrw(amount);
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

function renderHeader(label: string) {
  return () => <span className='whitespace-nowrap'>{label}</span>;
}

export function getTaxInvoiceColumns({ t, onIssue, onPending, onDelete, busyId }: TaxInvoiceColumnsOptions): ColumnDef<TaxInvoice>[] {
  return [
    {
      id: TaxInvoiceSortField.ORDER_NUMBER,
      header: renderHeader(t('orders.tax_invoices.columns.order_number')),
      enableSorting: true,
      minSize: 130,
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.order.order_number}</span>,
    },
    // {
    //   id: TaxInvoiceSortField.COMPANY_NAME,
    //   header: renderHeader(t('orders.tax_invoices.columns.company_name')),
    //   enableSorting: true,
    //   minSize: 140,
    //   cell: ({ row }) => <span>{row.original.order.company_name ?? row.original.order.user.customer?.company_name ?? '-'}</span>,
    // },
    {
      id: 'payment_method',
      header: renderHeader(t('orders.tax_invoices.original.columns.payment_method')),
      enableSorting: false,
      minSize: 110,
      cell: ({ row }) => <span className='text-sm'>{getPaymentMethodLabel(row.original.payment_method, t)}</span>,
    },
    {
      id: TaxInvoiceSortField.PAYMENT_AMOUNT,
      header: renderHeader(t('orders.tax_invoices.columns.payment_amount')),
      enableSorting: true,
      minSize: 140,
      cell: ({ row }) => <span className='text-sm font-semibold'>{formatAmount(row.original.amount)}</span>,
    },
    {
      id: TaxInvoiceSortField.ISSUE_STATUS,
      header: renderHeader(t('orders.tax_invoices.columns.status')),
      enableSorting: true,
      minSize: 110,
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded px-2.5 py-1 text-xs leading-none font-medium whitespace-nowrap ${TAX_INVOICE_STATUS_STYLES[row.original.tax_invoice_status]}`}
        >
          {getTaxInvoiceIssueStatusLabel(row.original.tax_invoice_status, t)}
        </span>
      ),
    },
    {
      id: 'tax_invoice_issued_at',
      header: renderHeader(t('orders.tax_invoices.columns.issued_at')),
      enableSorting: false,
      minSize: 140,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{formatDate(row.original.tax_invoice_issued_at)}</span>,
    },
    {
      id: TaxInvoiceSortField.CREATED_AT,
      header: renderHeader(t('orders.tax_invoices.columns.created_at')),
      enableSorting: true,
      minSize: 130,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{formatDate(row.original.created_at)}</span>,
    },
    {
      accessorKey: 'receipt_notes',
      header: renderHeader(t('orders.tax_invoices.columns.notes')),
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
      header: () => <div className='text-center'>{t('orders.tax_invoices.columns.actions')}</div>,
      enableSorting: false,
      minSize: 80,
      cell: ({ row }) => {
        const invoice = row.original;
        const id = String(invoice.id);
        const isBusy = busyId === id;
        const isDeleted = invoice.tax_invoice_status === TaxInvoiceIssueStatus.DELETED;

        return (
          <div className='flex justify-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type='button' variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {invoice.tax_invoice_status === TaxInvoiceIssueStatus.PENDING ? (
                  <DropdownMenuItem onClick={() => onIssue(id)} disabled={isBusy} className='cursor-pointer'>
                    <Send className='mr-2 size-4' />
                    {t('orders.tax_invoices.actions.issue')}
                  </DropdownMenuItem>
                ) : null}
                {invoice.tax_invoice_status === TaxInvoiceIssueStatus.ISSUED ? (
                  <DropdownMenuItem onClick={() => onPending(id)} disabled={isBusy} className='cursor-pointer'>
                    <RotateCcw className='mr-2 size-4' />
                    {t('orders.tax_invoices.actions.pending')}
                  </DropdownMenuItem>
                ) : null}
                {!isDeleted ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(id)} disabled={isBusy} className='cursor-pointer text-red-600 focus:text-red-600'>
                      <Trash2 className='mr-2 size-4' />
                      {t('orders.tax_invoices.actions.delete')}
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
