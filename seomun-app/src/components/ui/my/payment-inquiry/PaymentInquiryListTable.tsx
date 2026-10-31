'use client';

import { MyDataTable, MyPagination } from '@/components/common';
import { useRouter } from '@/i18n/navigation';
import { Attachment, ChevronRightThin } from '@/icons';
import { formatKoreanPhone } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { PaymentInquiry } from '@/types/inquiry';
import { ColumnDef, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';

type PaymentInquiryListTableProps = {
  data: PaymentInquiry[];
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  totalPage: number;
  totalRecords: number;
};

export const PaymentInquiryListTable = ({
  data,
  pagination,
  setPagination,
  totalPage,
  totalRecords,
}: PaymentInquiryListTableProps) => {
  const t = useTranslations('inquiry');
  const router = useRouter();

  const columns: ColumnDef<PaymentInquiry>[] = [
    {
      header: t('data_written'),
      accessorKey: 'createdAt',
      cell: (info) => <p className='tracking-[-0.25px]'>{info.getValue() as string}</p>,
      meta: { width: '104px' },
    },
    {
      header: t('order_number'),
      accessorKey: 'order',
      meta: { width: '190px', align: 'center' },
      cell: (info) => (
        <p
          className='text-text-brand tracking-[-0.25px] underline'
          onClick={() => router.push(ROUTES.MY_PAGE.ORDER_DETAIL(info.getValue() as string))}>
          {info.getValue() as string}
        </p>
      ),
    },
    {
      header: t('title'),
      accessorKey: 'title',
      cell: (info) => {
        return <p className='truncate text-left'>{info.getValue() as string}</p>;
      },
      meta: { width: '400px', align: 'center' },
    },
    {
      header: t('person_in_charge'),
      accessorKey: 'manager',
      meta: { width: '120px', align: 'center' },
    },
    {
      header: t('mobile'),
      accessorKey: 'phone',
      cell: (info) => formatKoreanPhone(info.getValue() as string),
      meta: { width: '150px', align: 'center' },
    },
    {
      header: t('attachment'),
      accessorKey: 'attachment',
      cell: (info) => {
        const hasAttachment = info.getValue() as boolean;
        const attachmentUrl = info.row.original.attachmentUrl;
        if (!hasAttachment) return null;
        if (!attachmentUrl) {
          return (
            <div className='text-text-brand flex items-center gap-1.5'>
              <Attachment className='size-4' />
              <span className='title-16 underline'>{t('attachment_name')}</span>
            </div>
          );
        }
        return (
          <button
            type='button'
            onClick={() => window.open(attachmentUrl, '_blank', 'noopener,noreferrer')}
            className='text-text-brand flex items-center gap-1.5'>
            <Attachment className='size-4' />
            <span className='title-16 underline'>{t('attachment_name')}</span>
          </button>
        );
      },
      meta: { width: '150px', align: 'center' },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ChevronRightThin
          className='size-6'
          onClick={() => router.push(ROUTES.MY_PAGE.PAYMENT_INQUIRY_DETAIL(row.original.id))}
        />
      ),
      meta: { width: '76px', align: 'center' },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: totalPage,
  });

  return (
    <div className='hidden grid-cols-1 md:grid'>
      <div>
        <MyDataTable table={table} columns={columns} />
      </div>
      <MyPagination
        currentPage={pagination.pageIndex + 1}
        totalPage={totalPage}
        onPageChange={(page: number) => setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))}
        pageSize={pagination.pageSize}
        onPageSizeChange={(size: number) => setPagination((prev) => ({ ...prev, pageIndex: 0, pageSize: size }))}
        totalRecords={totalRecords}
        className='mt-3 px-6'
      />
    </div>
  );
};
