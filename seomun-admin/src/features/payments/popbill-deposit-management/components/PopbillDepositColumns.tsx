import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';

import { Button } from '@/components/ui/button';
import type { BankDepositRESP } from '../api';
import { BankDepositStatus } from '../enums';
import { formatKrw } from '@/utils/format-currency';

type PopbillDepositColumnsOptions = {
  t: TFunction<'page'>;
  rowOffset?: number;
  onManualConfirm: (deposit: BankDepositRESP) => void;
};

const bankLabels = {
  woori: 'Woori Bank',
  hana: 'Hana Bank',
  im: 'iM Bank',
} as const;

export function getPopbillDepositColumns({ t, rowOffset = 0, onManualConfirm }: PopbillDepositColumnsOptions): ColumnDef<BankDepositRESP>[] {
  return [
    {
      id: 'no',
      header: t('payments.popbill_deposits.columns.no', 'No'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{rowOffset + row.index + 1}</span>,
    },
    {
      id: 'provider_tid',
      accessorKey: 'provider_tid',
      header: t('payments.popbill_deposits.columns.provider_tid', 'Bank Transaction ID'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.provider_tid}</span>,
    },
    {
      id: 'deposited_at',
      accessorKey: 'deposited_at',
      header: t('payments.popbill_deposits.columns.deposited_at', 'Deposited at'),
      enableSorting: false,
      cell: ({ row }) => <span className='whitespace-nowrap'>{dayjs(row.original.deposited_at).format('YYYY-MM-DD HH:mm')}</span>,
    },
    {
      id: 'bank',
      accessorKey: 'account_key',
      header: t('payments.popbill_deposits.columns.bank', 'Bank'),
      enableSorting: false,
      cell: ({ row }) => <span>{t(`payments.popbill_deposits.banks.${row.original.account_key}`, bankLabels[row.original.account_key])}</span>,
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: t('payments.popbill_deposits.columns.amount', 'Amount'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium whitespace-nowrap'>{formatKrw(row.original.amount)}</span>,
    },
    {
      id: 'remark',
      header: t('payments.popbill_deposits.columns.remark', 'Sender / remark'),
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.remarks[0] ?? '-'}</span>,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('payments.popbill_deposits.columns.status', 'Status'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='space-y-1'>
          <span
            className={
              row.original.status === BankDepositStatus.MATCHED
                ? 'rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800'
                : 'rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800'
            }
          >
            {t(`payments.popbill_deposits.status.${row.original.status}`, row.original.status)}
          </span>
          <p className='text-muted-foreground text-xs'>
            {row.original.match_reason ? t(`payments.popbill_deposits.match_reasons.${row.original.match_reason}`, row.original.match_reason) : '-'}
          </p>
        </div>
      ),
    },
    {
      id: 'payment_transaction_id',
      accessorKey: 'payment_transaction_id',
      header: t('payments.popbill_deposits.columns.payment_transaction_id', 'Transaction ID'),
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.payment_transaction_id ?? '-'}</span>,
    },
    {
      id: 'order_id',
      accessorKey: 'order_id',
      header: t('payments.popbill_deposits.columns.order_id', 'Order ID'),
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.order_id ?? '-'}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('payments.popbill_deposits.columns.actions', 'Actions')}</div>,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.status === BankDepositStatus.UNMATCHED ? (
          <div className='flex justify-center'>
            <Button variant='outline' size='sm' onClick={() => onManualConfirm(row.original)}>
              {t('payments.popbill_deposits.manual_confirm.action', 'Manual confirm')}
            </Button>
          </div>
        ) : (
          <span className='text-muted-foreground block text-center'>-</span>
        ),
    },
  ];
}
