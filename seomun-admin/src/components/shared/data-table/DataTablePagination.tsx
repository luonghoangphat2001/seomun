import type { OnChangeFn, PaginationState, Table } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { PAGE_SIZE_OPTIONS } from '@/constants/pagination';
import type { DataTablePageInfo } from './types';

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  pageInfo: DataTablePageInfo;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  showSummary?: boolean;
};

export function DataTablePagination<TData>({ table, pageInfo, pagination, onPaginationChange, showSummary = true }: DataTablePaginationProps<TData>) {
  const { t } = useTranslation();

  return (
    <div className='@container'>
      <div className='bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm'>
        {showSummary ? (
          <div className='text-muted-foreground text-sm'>
            {t('table.pagination_summary', {
              page: pagination.pageIndex + 1,
              pageCount: Math.max(pageInfo.pageCount, 1),
              rowCount: pageInfo.rowCount,
            })}
          </div>
        ) : null}

        <div className={`flex flex-wrap items-center gap-3 ${showSummary ? '' : 'w-full justify-between'}`}>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground text-sm whitespace-nowrap'>{t('table.rows_per_page')}</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) =>
                onPaginationChange({
                  pageIndex: 0,
                  pageSize: Number(value),
                })
              }
            >
              <SelectTrigger size='sm' className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Pagination className='mx-0 w-auto justify-start @2xl:justify-end'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href='#'
                  onClick={(event) => {
                    event.preventDefault();
                    if (table.getCanPreviousPage()) {
                      table.previousPage();
                    }
                  }}
                  aria-disabled={!table.getCanPreviousPage()}
                  className={!table.getCanPreviousPage() ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>

              {getPaginationItems(pagination.pageIndex, pageInfo.pageCount).map((item, index) => (
                <PaginationItem key={`${item}-${index}`}>
                  {item === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href='#'
                      isActive={item === pagination.pageIndex}
                      onClick={(event) => {
                        event.preventDefault();
                        onPaginationChange({
                          pageIndex: item,
                          pageSize: pagination.pageSize,
                        });
                      }}
                    >
                      {item + 1}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href='#'
                  onClick={(event) => {
                    event.preventDefault();
                    if (table.getCanNextPage()) {
                      table.nextPage();
                    }
                  }}
                  aria-disabled={!table.getCanNextPage()}
                  className={!table.getCanNextPage() ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

function getPaginationItems(current: number, total: number) {
  if (total <= 1) {
    return [0];
  }

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index);
  }

  const items: Array<number | 'ellipsis'> = [0];
  const start = Math.max(1, Math.min(current - 1, total - 4));
  const end = Math.min(total - 2, Math.max(current + 1, 3));

  if (start > 1) {
    items.push('ellipsis');
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < total - 2) {
    items.push('ellipsis');
  }

  items.push(total - 1);
  return items;
}
