import { functionalUpdate, type SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';

import type { PointHistoryItem } from '../../types/customer.type';
import { getPointDetailCategoryLabel, getPointHistoryCategoryLabel, translatePointRemark } from '../../utils/i18n';
import type { PointManagementFilterFormValues } from '../schemas';

type PointHistoryTableProps = {
  items: PointHistoryItem[];
  filters: PointManagementFilterFormValues;
  isLoading?: boolean;
  totalPage: number;
  totalItem: number;
  onChange: (next: PointManagementFilterFormValues) => void;
};

export function PointHistoryTable({ items, filters, isLoading, totalPage, totalItem, onChange }: PointHistoryTableProps) {
  const { t } = useTranslation();
  const state = {
    pagination: { pageIndex: filters.page - 1, pageSize: filters.per_page },
    sorting: [] as SortingState,
  };

  return (
    <DataTable
      data={items}
      columns={[
        {
          id: 'rowNumber',
          header: t('page.customers.points.table.no'),
          cell: ({ row }) => (filters.page - 1) * filters.per_page + row.index + 1,
        },
        {
          accessorKey: 'issuedAt',
          header: t('page.customers.points.table.issued_at'),
          cell: ({ row }) => new Date(row.original.issuedAt).toLocaleString(),
        },
        {
          accessorKey: 'category',
          header: t('page.customers.points.table.category'),
          cell: ({ row }) => row.original.category.label || getPointHistoryCategoryLabel(t, row.original.category.value),
        },
        {
          accessorKey: 'detailCategory',
          header: t('page.customers.points.table.detail_category'),
          cell: ({ row }) => row.original.detailCategory.label || getPointDetailCategoryLabel(t, row.original.detailCategory.value),
        },
        {
          accessorKey: 'memberName',
          header: t('page.customers.points.table.member'),
          cell: ({ row }) => `${row.original.memberLoginId} / ${row.original.memberName}`,
        },
        {
          accessorKey: 'contact',
          header: t('page.customers.points.table.contact'),
          cell: ({ row }) => `${row.original.contact ?? '-'} / ${row.original.email}`,
        },
        { accessorKey: 'orderNumber', header: t('page.customers.points.table.order_number'), cell: ({ row }) => row.original.orderNumber ?? '-' },
        { accessorKey: 'amount', header: t('page.customers.points.table.amount'), cell: ({ row }) => row.original.amount.toLocaleString() },
        {
          accessorKey: 'remarks',
          header: t('page.customers.points.table.remarks'),
          cell: ({ row }) => translatePointRemark(t, row.original.remarks),
        },
      ]}
      state={state}
      pageInfo={{ pageCount: totalPage, rowCount: totalItem }}
      onPaginationChange={(updater) => {
        const next = functionalUpdate(updater, state.pagination);
        onChange({
          ...filters,
          page: next.pageIndex + 1,
          per_page: next.pageSize,
        });
      }}
      onSortingChange={() => undefined}
      isLoading={isLoading}
      enableRowSelection={false}
      getRowId={(row) => String(row.id)}
    />
  );
}
