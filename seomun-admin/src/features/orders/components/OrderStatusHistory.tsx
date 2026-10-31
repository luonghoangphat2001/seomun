import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatLocalDateTime } from '@/utils/format-date';

import { useOrderStatusChangeHistoryQuery } from '../api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../constants';
import { type OrderStatus } from '../enums';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

interface OrderStatusHistoryProps {
  orderNumber: string;
}

export function OrderStatusHistory({ orderNumber }: OrderStatusHistoryProps) {
  const { t } = useTranslation('page');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(PAGE_SIZE_OPTIONS[1]);

  const { data, isLoading } = useOrderStatusChangeHistoryQuery(orderNumber, { page, per_page: perPage });
  const histories = data?.data.histories ?? [];
  const pagination = data?.pagination;

  function renderStatusBadge(status: OrderStatus | null) {
    if (!status) return <span className='text-muted-foreground text-xs'>-</span>;
    const label = ORDER_STATUS_LABELS[status]?.(t) ?? status;
    const style = ORDER_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-800';
    return <span className={`rounded px-2 py-0.5 text-xs font-medium ${style}`}>{label}</span>;
  }

  return (
    <div className='bg-card @container overflow-hidden rounded-xl border p-4 shadow-sm'>
      <h3 className='mb-4 text-lg font-semibold'>{t('orders.detail.status_history.title')}</h3>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('orders.detail.status_history.columns.changed_at')}</TableHead>
              <TableHead>{t('orders.detail.status_history.columns.from_status')}</TableHead>
              <TableHead>{t('orders.detail.status_history.columns.to_status')}</TableHead>
              <TableHead>{t('orders.detail.status_history.columns.changed_by')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && histories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-muted-foreground py-6 text-center'>
                  {t('orders.detail.status_history.empty')}
                </TableCell>
              </TableRow>
            ) : (
              histories.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className='text-sm whitespace-nowrap'>{formatLocalDateTime(record.change_at)}</TableCell>
                  <TableCell>{renderStatusBadge(record.old_status)}</TableCell>
                  <TableCell>{renderStatusBadge(record.new_status)}</TableCell>
                  <TableCell className='text-sm font-medium'>{record.changed_by?.name ?? '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total_item > 0 ? (
        <div className='mt-4 flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground text-sm'>{t('rows_per_page', { ns: 'table' })}</span>
            <Select
              value={String(perPage)}
              onValueChange={(value) => {
                setPerPage(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger size='sm' className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
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
                    if (pagination.current_page > 1) setPage(pagination.current_page - 1);
                  }}
                  aria-disabled={pagination.current_page <= 1}
                  className={pagination.current_page <= 1 ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>

              {getPaginationPages(pagination.current_page, pagination.total_page).map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href='#'
                    isActive={pageNumber === pagination.current_page}
                    onClick={(event) => {
                      event.preventDefault();
                      setPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href='#'
                  onClick={(event) => {
                    event.preventDefault();
                    if (pagination.current_page < pagination.total_page) setPage(pagination.current_page + 1);
                  }}
                  aria-disabled={pagination.current_page >= pagination.total_page}
                  className={pagination.current_page >= pagination.total_page ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}

function getPaginationPages(currentPage: number, totalPage: number) {
  if (totalPage <= 7) {
    return Array.from({ length: totalPage }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPage - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}
