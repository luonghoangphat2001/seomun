'use client';

import { MyDataTable } from '@/components/common';
import { MyAccountRESP } from '@/apis/my/account/account.response';
import { BANK } from '@/enums/dedicated-account';
import { DATE_FORMAT } from '@/constants/common';
import { formatDate } from '@/lib/utils';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import Image from 'next/image';

type CurrentAccountTableProps = {
  account: MyAccountRESP;
  bank?: BANK;
  bankImage: string;
};

const CurrentAccountTable = ({ account, bank, bankImage }: CurrentAccountTableProps) => {
  const t = useTranslations();

  const columns: ColumnDef<MyAccountRESP>[] = [
    {
      header: t('my.registration_date'),
      accessorKey: 'created_at',
      cell: ({ row }) => formatDate(row.original.created_at, DATE_FORMAT.DATE_WITH_DOT),
      meta: { align: 'center' },
    },
    {
      header: t('my.account_holder'),
      accessorKey: 'account_holder',
      meta: { align: 'center' },
    },
    {
      header: t('my.bank'),
      accessorKey: 'bank_code',
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1.5'>
          <p>{bank ? t(`bank.${bank}`) : '-'}</p>
          {bank && <Image src={bankImage} alt={row.original.bank_code} width={24} height={24} unoptimized />}
        </div>
      ),
      meta: { align: 'center' },
    },
    {
      header: t('my.account_number'),
      accessorKey: 'account_number',
      meta: { align: 'center' },
    },
    {
      header: t('my.last_transaction_time'),
      accessorKey: 'last_transaction_at',
      cell: ({ row }) =>
        row.original.last_transaction_at ? formatDate(row.original.last_transaction_at, DATE_FORMAT.DATE_HOUR_MINUTE) : '-',
      meta: { align: 'center' },
    },
  ];

  // tanstack-table loops forever if `data` is a fresh array each render
  const data = useMemo(() => [account], [account]);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return <MyDataTable table={table} columns={columns} scrollable />;
};

export default CurrentAccountTable;
