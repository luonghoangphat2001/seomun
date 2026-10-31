'use client';

import { Badge, MyDataTable, MyPagination } from '@/components/common';
import { InquiryStatus } from '@/enums/inquiry';
import { useRouter } from '@/i18n/navigation';
import { Attachment } from '@/icons';
import { formatKoreanPhone } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { QuoteInquiry } from '@/types/inquiry';
import { ColumnDef, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';

type QuoteInquiryListTableProps = {
  data: QuoteInquiry[];
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  totalPage: number;
  totalRecords: number;
};

export const QuoteInquiryListTable = ({
  data,
  pagination,
  setPagination,
  totalPage,
  totalRecords,
}: QuoteInquiryListTableProps) => {
  const t = useTranslations('inquiry');
  const router = useRouter();

  const columns: ColumnDef<QuoteInquiry>[] = [
    {
      header: t('data_written'),
      accessorKey: 'createdAt',
      cell: (info) => <p className='tracking-[-0.25px]'>{info.getValue() as string}</p>,
      meta: { width: '104px' },
    },
    {
      header: t('title'),
      accessorKey: 'title',
      cell: (info) => {
        const isReply = info.row.original.isReply;
        return (
          <div className='flex items-center gap-2'>
            {isReply && (
              <Badge color='primary' className='bg-text-brand rounded-md px-2 py-0.5 text-xs'>
                Re
              </Badge>
            )}
            <p className='truncate'>{info.getValue() as string}</p>
          </div>
        );
      },
      meta: { width: '200px', align: 'center' },
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
            onClick={(event) => {
              event.stopPropagation();
              window.open(attachmentUrl, '_blank', 'noopener,noreferrer');
            }}
            className='text-text-brand flex items-center gap-1.5'>
            <Attachment className='size-4' />
            <span className='title-16 underline'>{t('attachment_name')}</span>
          </button>
        );
      },
      meta: { width: '150px', align: 'center' },
    },
    {
      header: t('progress_status'),
      accessorKey: 'status',
      cell: (info) => {
        const status = info.getValue() as InquiryStatus;
        return <span>{t(status)}</span>;
      },
      meta: { width: '120px', align: 'center' },
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
        <MyDataTable
          table={table}
          columns={columns}
          onRowClick={(row) => router.push(ROUTES.MY_PAGE.QUOTE_INQUIRY_DETAIL(row.id))}
        />
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
