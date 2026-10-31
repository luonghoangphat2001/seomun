'use client';

import { MyDataTable, MyPagination } from '@/components/common';
import { useMediaQuery } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import { DepositStatus } from '@/types/deposit-status';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';

type DepositStatusListTableProps = {
  data: DepositStatus[];
  currentPage: number;
  totalPage: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
};

const DepositStatusListTable = ({
  data,
  currentPage,
  totalPage,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: DepositStatusListTableProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      ko: {
        card: '신용카드',
        toss: '토스',
        virtual_account: '가상계좌',
        NAVER_PAY: '네이버페이',
        KAKAO_PAY: '카카오페이',
      },
      en: {
        card: 'credit card',
        toss: 'Toss',
        virtual_account: 'Virtual account',
        NAVER_PAY: 'Naver Pay',
        KAKAO_PAY: 'Kakao Pay',
      },
    } as const;

    const currentLabels = labels[locale as keyof typeof labels] ?? labels.en;

    switch (method) {
      case 'card':
        return currentLabels.card;
      case 'toss':
        return currentLabels.toss;
      case 'virtual_account':
        return currentLabels.virtual_account;
      case 'NAVER_PAY':
        return currentLabels.NAVER_PAY;
      case 'KAKAO_PAY':
        return currentLabels.KAKAO_PAY;
      default:
        return method;
    }
  };

  const columns: ColumnDef<DepositStatus>[] = [
    {
      header: t('customer_service.no'),
      cell: ({ table, row }) => {
        return row.original.id;
      },
      meta: { align: 'center', width: isDesktop ? '130px' : '80px' },
    },
    {
      header: t('my.transaction_method'),
      accessorKey: 'method',
      cell: (info) => <p>{getPaymentMethodLabel(info.getValue() as string)}</p>,
      meta: { align: 'center', width: isDesktop ? '200px' : '120px' },
    },

    {
      header: t('my.transaction_date'),
      accessorKey: 'date',
      meta: { align: 'center', width: isDesktop ? '130px' : '120px' },
    },
    {
      header: t('my.deposit_withdrawal'),
      accessorKey: 'amount',
      cell: (info) => <p>{formatCurrency(info.getValue() as number, false)}</p>,
      meta: { align: 'center', width: isDesktop ? '200px' : '120px' },
    },
    {
      header: t('my.depositor'),
      accessorKey: 'depositor',
      meta: { align: 'center', width: isDesktop ? '200px' : '120px' },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  });

  return (
    <div className='grid grid-cols-1'>
      <MyDataTable table={table} columns={columns} classNames={{ bodyRow: 'h-12' }} isLoading={isLoading} />
      <MyPagination
        currentPage={currentPage}
        totalPage={totalPage}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        className='mt-3 px-6'
      />
    </div>
  );
};

export default DepositStatusListTable;
