import { cn } from '@/lib/utils';
import { flexRender, type ColumnDef, type Table as TanStackTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/common';
import { useTranslations } from 'next-intl';
import React, { ReactNode } from 'react';
import Loading from '../loading';

type MyDataTableProps<TData> = {
  table: TanStackTable<TData>;
  columns: ColumnDef<TData>[];
  emptyText?: string;
  emptyTextClassName?: string;
  classNames?: {
    table?: string;
    header?: string;
    headerRow?: string;
    head?: string;
    body?: string;
    bodyRow?: string | ((row: TData) => string);
    cell?: string;
  };
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  scrollable?: boolean;
  footerRows?: ReactNode;
  expandedRowIds?: Record<number, boolean>;
  renderExpandedRow?: (row: TData) => React.ReactNode;
};

export type MyColumnMeta = {
  width?: string;
  align?: 'left' | 'center' | 'right';
};

export const MyDataTable = <TData,>(props: MyDataTableProps<TData>) => {
  const tCommon = useTranslations('common');

  const {
    table,
    columns,
    emptyText = tCommon('no_data'),
    emptyTextClassName,
    classNames,
    isLoading,
    onRowClick,
    scrollable,
    footerRows,
    expandedRowIds,
    renderExpandedRow,
  } = props;

  const tableLayoutClass = scrollable ? 'table-auto min-w-0' : 'table-fixed';
  const headTruncateClass = scrollable ? 'whitespace-nowrap' : 'truncate';
  const cellTruncateClass = scrollable ? 'whitespace-nowrap' : 'truncate';

  return (
    <div className='w-full overflow-x-auto'>
      <Table className={cn('w-full', tableLayoutClass, classNames?.table)}>
        <TableHeader className={cn('bg-fill-soft border-text-third border-t border-b p-3', classNames?.header)}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className={cn('bg-muted border-text-third', classNames?.headerRow)}>
              {headerGroup.headers.map((header) => {
                const columnMeta = header.column.columnDef.meta as MyColumnMeta | undefined;

                return (
                  <TableHead
                    key={header.id}
                    style={{ width: columnMeta?.width }}
                    className={cn(
                      'text-text-main title-14 h-11 px-3',
                      headTruncateClass,
                      columnMeta?.align === 'center' && 'text-center',
                      columnMeta?.align === 'right' && 'text-right',
                      classNames?.head,
                    )}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className={cn(classNames?.body)}>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                <div className='flex items-center justify-center gap-2'>
                  <Loading />
                  <p className='body-16'>{tCommon('loading')}...</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            (table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const expanded = expandedRowIds?.[(row.original as { id: number }).id];

                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      key={row.id}
                      className={cn(
                        'group h-12 cursor-pointer border-b-0 hover:bg-gray-50',
                        typeof classNames?.bodyRow === 'function' ? classNames.bodyRow(row.original) : classNames?.bodyRow,
                      )}
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={onRowClick ? () => onRowClick(row.original) : undefined}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            'body-16 text-text-main border-border-soft border-b p-3',
                            cellTruncateClass,
                            (cell.column.columnDef.meta as MyColumnMeta | undefined)?.align === 'center' && 'text-center',
                            (cell.column.columnDef.meta as MyColumnMeta | undefined)?.align === 'right' && 'text-right',
                            classNames?.cell,
                            expanded && 'border-b border-dashed',
                          )}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {/* EXPANDED ROW */}
                    {expanded && renderExpandedRow && (
                      <TableRow className='border-b-border-soft'>
                        <TableCell colSpan={row.getVisibleCells().length} className='p-0'>
                          {renderExpandedRow(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className={cn('border-border-soft h-24 border-b text-center', emptyTextClassName)}>
                  {emptyText}
                </TableCell>
              </TableRow>
            ))}
          {footerRows}
        </TableBody>
      </Table>
    </div>
  );
};
