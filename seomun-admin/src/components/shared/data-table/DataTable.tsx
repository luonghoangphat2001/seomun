import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type Header, type RowSelectionState } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/utils/cn';

import { SELECTION_COLUMN_ID } from './constants';
import { DataTablePagination } from './DataTablePagination';
import { createSelectionColumn } from './DataTableSelectionColumn';
import type { DataTableProps } from './types';

type DataTableColumnMeta = {
  headerClassName?: string;
};

function SortButton<TData, TValue>({ header }: { header: Header<TData, TValue> }) {
  const sorted = header.column.getIsSorted();

  return (
    <Button type='button' variant='ghost' size='sm' className='-ml-3 h-8 px-3' onClick={header.column.getToggleSortingHandler()}>
      {flexRender(header.column.columnDef.header, header.getContext())}
      {sorted === 'asc' ? (
        <ArrowUp className='size-4' />
      ) : sorted === 'desc' ? (
        <ArrowDown className='size-4' />
      ) : (
        <ArrowUpDown className='text-muted-foreground size-4' />
      )}
    </Button>
  );
}

export function DataTable<TData, TValue = unknown>({
  data,
  columns,
  hasPagination = true,
  showPaginationSummary = true,
  state,
  pageInfo,
  onPaginationChange,
  onSortingChange,
  enableRowSelection = true,
  isLoading = false,
  emptyMessage,
  getRowId,
  getRowClassName,
  onRowClick,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const rowSelection = controlledRowSelection ?? internalRowSelection;

  const tableColumns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!enableRowSelection) {
      return columns;
    }

    return [createSelectionColumn<TData, TValue>(), ...columns];
  }, [columns, enableRowSelection]);

  const resolvedEmptyMessage = emptyMessage ?? t('table.empty');

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting: state.sorting,
      pagination: state.pagination,
      rowSelection,
    },
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pageInfo.pageCount,
    rowCount: pageInfo.rowCount,
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    enableRowSelection: true,
    enableMultiSort: false,
  });

  return (
    <div data-slot='data-table' className='flex min-h-0 flex-1 flex-col gap-4'>
      <div className='bg-card flex min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm'>
        <Table containerClassName='min-h-0'>
          <TableHeader className='bg-card sticky top-0 z-10 shadow-[0_1px_0_var(--border)]'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                  const className = [header.column.id === SELECTION_COLUMN_ID ? 'w-12 px-3' : undefined, meta?.headerClassName]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <TableHead key={header.id} className={className || undefined}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <SortButton header={header} />
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className='h-24'>
                  <div className='text-muted-foreground flex items-center justify-center'>
                    <Loader2 className='size-5 animate-spin' aria-hidden='true' />
                    <span className='sr-only'>{t('common.message.loading')}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && 'cursor-pointer', getRowClassName?.(row.original, row.index))}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className='text-muted-foreground h-24 text-center text-sm'>
                  {resolvedEmptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hasPagination ? (
        <DataTablePagination
          table={table}
          pageInfo={pageInfo}
          pagination={state.pagination}
          onPaginationChange={onPaginationChange}
          showSummary={showPaginationSummary}
        />
      ) : null}
    </div>
  );
}
