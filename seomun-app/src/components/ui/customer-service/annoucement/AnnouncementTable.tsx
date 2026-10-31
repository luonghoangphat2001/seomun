'use client';

import { MyDataTable, MyPagination } from '@/components/common';
import { type MyColumnMeta } from '@/components/common/table/my-data-table';
import { cn, formatDate } from '@/lib/utils';
import { getCoreRowModel, OnChangeFn, PaginationState, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { TitleCell } from './TitleCell';
import { NoticeRESP } from '@/apis/notice/notice.response';
import { fillNumber, getRowNumberInTable } from '@/lib/utils/helper';
import { DATE_FORMAT } from '@/constants/common';

type AnnouncementTableProps = {
  data: NoticeRESP[];
  pagination: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  totalPage?: number;
  totalItems: number;
  isLoading: boolean;
  toDetail: (id: number) => void;
};

export const AnnouncementTable = ({
  data,
  pagination,
  onPaginationChange,
  totalPage,
  totalItems,
  isLoading,
  toDetail,
}: AnnouncementTableProps) => {
  const t = useTranslations('customer_service');

  const columns = useMemo<ColumnDef<NoticeRESP>[]>(
    () => [
      {
        id: 'no',
        header: t('no'),
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;

          return fillNumber(getRowNumberInTable(totalItems || 0, pageIndex, pageSize, row.index));
        },
        meta: { width: '80px', align: 'center' } as MyColumnMeta,
      },
      {
        header: t('division'),
        accessorKey: 'type',
        cell: (info) => t(info.getValue() as string),
        meta: { width: '100px', align: 'center' } as MyColumnMeta,
      },
      {
        header: t('title'),
        accessorKey: 'title',
        cell: (info) => <TitleCell title={info.row.original.title} isNew={info.row.original.is_new} />,
        meta: { width: '400px' },
      },
      {
        header: t('views'),
        accessorKey: 'view_count',
        cell: (info) => (info.getValue() as number).toLocaleString(),
        meta: { width: '120px', align: 'center' } as MyColumnMeta,
      },
      {
        header: t('date'),
        accessorKey: 'date',
        cell: ({ row }) => formatDate(row.original.created_at, DATE_FORMAT.DATE_WITH_DOT),
        meta: { width: '150px', align: 'center' } as MyColumnMeta,
      },
    ],
    [t, totalItems],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
    onPaginationChange,
    manualPagination: true,
    pageCount: totalPage,
  });

  return (
    <div className='hidden grid-cols-1 md:grid'>
      <MyDataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(row) => toDetail(row.id)}
        classNames={{
          table: 'table-fixed',
          bodyRow: (item) =>
            cn(
              'h-[48px] cursor-pointer border-b border-border-soft transition-colors',
              item.is_new ? 'bg-[#FDF8DB] hover:bg-primary-100' : 'hover:bg-gray-50',
            ),
        }}
      />
      {onPaginationChange && (
        <MyPagination
          currentPage={pagination.pageIndex + 1}
          totalPage={totalPage}
          onPageChange={(page: number) => table.setPageIndex(page - 1)}
          pageSize={pagination.pageSize}
          totalRecords={totalItems}
          className='mt-3 px-6'
        />
      )}
    </div>
  );
};
