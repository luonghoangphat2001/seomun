import type { ColumnDef, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AppSelect, type AppSelectOption } from '@/components/shared/app-select';
import { DataTable } from '@/components/shared/data-table';
import type { PaginationMeta } from '@/types/api';

import type { AssignedDesignList } from '../api/order.response';
import { AssignedDesignStatus } from '../enums';

type DesignOrderTrackingListProps = {
  orders: AssignedDesignList[];
  pagination?: PaginationMeta;
  paginationState: PaginationState;
  selectedOrderNumber?: string;
  status?: AssignedDesignStatus;
  isLoading: boolean;
  onSelect: (orderNumber: string) => void;
  onStatusChange: (status?: AssignedDesignStatus) => void;
  onPaginationChange: OnChangeFn<PaginationState>;
};

const EMPTY_SORTING: SortingState = [];

export function DesignOrderTrackingList({
  orders,
  pagination,
  paginationState,
  selectedOrderNumber,
  status,
  isLoading,
  onSelect,
  onStatusChange,
  onPaginationChange,
}: DesignOrderTrackingListProps) {
  const { t } = useTranslation('page');
  const statusOptions = useMemo<AppSelectOption<AssignedDesignStatus>[]>(
    () =>
      Object.values(AssignedDesignStatus).map((designStatus) => ({
        value: designStatus,
        label: t(`orders.design_workflow.detail.item_status.${designStatus}`),
      })),
    [t],
  );

  const columns = useMemo<ColumnDef<AssignedDesignList>[]>(
    () => [
      {
        id: 'number',
        header: 'No.',
        meta: { headerClassName: 'w-12 text-center' },
        enableSorting: false,
        cell: ({ row }) => <span className='block text-center text-xs'>{paginationState.pageIndex * paginationState.pageSize + row.index + 1}</span>,
      },
      {
        accessorKey: 'order_number',
        header: t('orders.list.columns.order_number'),
        meta: { headerClassName: 'w-[36%]' },
        enableSorting: false,
        cell: ({ row }) => <span className='text-xs font-medium break-all'>{row.original.order_number}</span>,
      },
      {
        id: 'customer',
        header: t('orders.list.columns.orderer'),
        meta: { headerClassName: 'w-[29%]' },
        enableSorting: false,
        cell: ({ row }) => (
          <div className='space-y-0.5'>
            <p className='truncate text-xs font-medium' title={row.original.customer.name}>
              {row.original.customer.name}
            </p>
            <p className='text-muted-foreground truncate text-xs' title={row.original.customer.username}>
              ({row.original.customer.username})
            </p>
          </div>
        ),
      },
      {
        id: 'product',
        header: t('orders.list.columns.product'),
        meta: { headerClassName: 'w-[30%]' },
        enableSorting: false,
        cell: ({ row }) => (
          <div className='space-y-0.5'>
            <p className='truncate text-xs' title={row.original.product_name || row.original.product?.name}>
              {row.original.product_name || row.original.product?.name || '-'}
            </p>
            <p className='text-muted-foreground text-xs'>
              {t('orders.design_workflow.list.item_count', { count: row.original.assigned_design_item_count })}
            </p>
          </div>
        ),
      },
    ],
    [paginationState.pageIndex, paginationState.pageSize, t],
  );

  return (
    <section className='space-y-3'>
      <div className='bg-card space-y-3 rounded-xl border p-3 shadow-sm'>
        <div className='flex items-center justify-between px-1'>
          <h2 className='text-sm font-semibold'>{t('orders.design_workflow.list.title')}</h2>
          <span className='text-muted-foreground text-xs'>{pagination?.total_item ?? orders.length}</span>
        </div>

        <AppSelect
          options={statusOptions}
          value={status}
          onValueChange={onStatusChange}
          clearable
          placeholder={t('orders.design_workflow.list.status_filter')}
          aria-label={t('orders.design_workflow.list.status_filter')}
          className='w-64 max-w-full'
        />
      </div>

      <div className='[&_table]:table-fixed [&_td]:px-2 [&_td]:py-2 [&_th]:px-2'>
        <DataTable
          data={orders}
          columns={columns}
          state={{ pagination: paginationState, sorting: EMPTY_SORTING }}
          pageInfo={{
            pageCount: pagination?.total_page ?? 0,
            rowCount: pagination?.total_item ?? 0,
          }}
          onPaginationChange={onPaginationChange}
          onSortingChange={() => undefined}
          showPaginationSummary={false}
          isLoading={isLoading}
          emptyMessage={t('orders.design_workflow.list.empty')}
          enableRowSelection={false}
          getRowId={(row) => row.order_number}
          onRowClick={(row) => onSelect(row.order_number)}
          getRowClassName={(row) => (row.order_number === selectedOrderNumber ? 'bg-primary/10 hover:bg-primary/10' : undefined)}
        />
      </div>
    </section>
  );
}
