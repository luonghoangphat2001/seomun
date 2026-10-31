import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState, SortingState } from '@tanstack/react-table';
import type { ReactNode } from 'react';

export type DataTablePageInfo = {
  pageCount: number;
  rowCount: number;
};

export type DataTableState = {
  pagination: PaginationState;
  sorting: SortingState;
};

export type DataTableProps<TData, TValue = unknown> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  hasPagination?: boolean;
  showPaginationSummary?: boolean;
  state: DataTableState;
  pageInfo: DataTablePageInfo;
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortingChange: OnChangeFn<SortingState>;
  enableRowSelection?: boolean;
  isLoading?: boolean;
  emptyMessage?: ReactNode;
  getRowId?: (originalRow: TData, index: number) => string;
  getRowClassName?: (originalRow: TData, index: number) => string | undefined;
  onRowClick?: (originalRow: TData) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
};
