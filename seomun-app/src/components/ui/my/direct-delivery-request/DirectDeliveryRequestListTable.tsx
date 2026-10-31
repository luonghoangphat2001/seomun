'use client';

import { Badge, MyDataTable, MyPagination } from '@/components/common';
import { getDirectDeliveryStatusConfig } from '@/constants/inquiry';
import { DirectDeliveryStatus } from '@/enums/inquiry';
import { useRouter } from '@/i18n/navigation';
import { cn, formatKoreanPhone } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { DirectDeliveryRequest } from '@/types/inquiry';
import { ColumnDef, getCoreRowModel, OnChangeFn, PaginationState, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

type DirectDeliveryRequestListTableProps = {
  data: DirectDeliveryRequest[];
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  isLoading: boolean;
  totalPage: number;
};

export const DirectDeliveryRequestListTable = ({
  data,
  pagination,
  onPaginationChange,
  isLoading,
  totalPage,
}: DirectDeliveryRequestListTableProps) => {
  const t = useTranslations('inquiry');
  const router = useRouter();

  const columns: ColumnDef<DirectDeliveryRequest>[] = [
    {
      header: t('application_date'),
      accessorKey: 'createdAt',
      cell: (info) => <p className='tracking-[-0.25px]'>{info.getValue() as string}</p>,
      meta: { width: '13%' },
    },
    {
      header: t('delivery_address'),
      accessorKey: 'type',
      cell: (info) => (info.getValue() as string) || '-',
      meta: { width: '13%', align: 'center' },
    },
    {
      header: t('name'),
      accessorKey: 'name',
      meta: { width: '12%', align: 'center' },
    },
    {
      header: t('cell_phone'),
      accessorKey: 'phone',
      cell: (info) => formatKoreanPhone(info.getValue() as string),
      meta: { width: '15%', align: 'center' },
    },
    {
      header: t('address'),
      accessorKey: 'address',
      cell: (info) => <p className='truncate'>{info.getValue() as string}</p>,
      // No width: address fills the remaining space
    },
    {
      header: t('situation'),
      accessorKey: 'status',
      cell: (info) => {
        const status = info.getValue() as DirectDeliveryRequest['status'];
        const statusConfig = getDirectDeliveryStatusConfig(t);
        const config = statusConfig[status] || statusConfig.pending;

        return (
          <Badge
            color={config.color}
            variant={config.variant}
            className={cn(status === DirectDeliveryStatus.UNDERREVIEW && 'text-text-main! bg-border-soft')}>
            {config.label}
          </Badge>
        );
      },
      meta: { width: '11%', align: 'center' },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange,
    manualPagination: true,
    pageCount: totalPage,
  });

  return (
    <div className='hidden grid-cols-1 md:grid'>
      <div>
        <MyDataTable
          table={table}
          columns={columns}
          isLoading={isLoading}
          onRowClick={(row) => router.push(ROUTES.MY_PAGE.DIRECT_SHIPPING_REQUEST_DETAIL(row.id))}
        />
      </div>
      <MyPagination
        currentPage={pagination.pageIndex + 1}
        totalPage={totalPage}
        onPageChange={(page: number) => table.setPageIndex(page - 1)}
        pageSize={pagination.pageSize}
        className='mt-3 px-6'
      />
    </div>
  );
};
