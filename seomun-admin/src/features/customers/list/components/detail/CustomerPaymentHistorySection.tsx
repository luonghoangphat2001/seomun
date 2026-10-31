import dayjs from 'dayjs';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAYMENT_METHOD_STYLES, PAYMENT_STATUS_STYLES, PaymentDetailDialog } from '@/features/payments/payment-list';

import { useCustomerPaymentHistoryQuery } from '../../api/customer-payment-history.query';
import { formatKrw } from '@/utils/format-currency';

// === Type definitions ===

type CustomerPaymentHistorySectionProps = {
  customerId: number;
};

// === Variables ===

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

// === Helpers ===

// function formatAmount(amount: string): string {
//   return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(Number(amount));
// }

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
}

function getPaginationPages(currentPage: number, totalPage: number) {
  if (totalPage <= 7) return Array.from({ length: totalPage }, (_, index) => index + 1);
  const start = Math.max(1, Math.min(currentPage - 2, totalPage - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

// === Components ===

export function CustomerPaymentHistorySection({ customerId }: CustomerPaymentHistorySectionProps) {
  const { t } = useTranslation('page');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(PAGE_SIZE_OPTIONS[1]);
  const [detailPaymentId, setDetailPaymentId] = useState<number | null>(null);

  const { data, isLoading } = useCustomerPaymentHistoryQuery({ customer_id: customerId, page, per_page: perPage });
  const payments = data?.data.payments ?? [];
  const pagination = data?.pagination;

  return (
    <section className='rounded-xl border'>
      <div className='border-b px-5 py-4'>
        <h2 className='text-sm font-semibold'>{t('customers.detail.sections.payment_history', 'Payment History')}</h2>
      </div>
      <div className='space-y-3 p-5'>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('customers.detail.payment_history.columns.transaction_id', 'Transaction ID')}</TableHead>
                <TableHead>{t('customers.detail.payment_history.columns.order', 'Order')}</TableHead>
                <TableHead>{t('customers.detail.payment_history.columns.payment_method', 'Payment Method')}</TableHead>
                <TableHead>{t('customers.detail.payment_history.columns.status', 'Status')}</TableHead>
                <TableHead>{t('customers.detail.payment_history.columns.amount', 'Amount')}</TableHead>
                <TableHead>{t('customers.detail.payment_history.columns.paid_at', 'Paid At')}</TableHead>
                <TableHead className='text-center'>{t('customers.detail.payment_history.columns.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 7 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-muted-foreground py-6 text-center'>
                    {t('customers.detail.payment_history.empty', 'No payment history found.')}
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className='font-mono text-xs'>{payment.transaction_id}</TableCell>
                    <TableCell className='text-sm'>{payment.order.order_number}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${PAYMENT_METHOD_STYLES[payment.payment_method] ?? 'bg-gray-100 text-gray-800'}`}
                      >
                        {t(`payments.list.payment_method.${payment.payment_method}`, payment.payment_method)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_STYLES[payment.status] ?? 'bg-gray-100 text-gray-800'}`}
                      >
                        {t(`payments.list.payment_status.${payment.status}`, payment.status)}
                      </span>
                    </TableCell>
                    <TableCell className='text-sm font-medium'>{formatKrw(payment.amount)}</TableCell>
                    <TableCell className='text-muted-foreground text-sm'>{formatDate(payment.paid_at)}</TableCell>
                    <TableCell className='text-center'>
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0' onClick={() => setDetailPaymentId(payment.id)}>
                        <Eye className='size-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <PaymentDetailDialog paymentId={detailPaymentId} onClose={() => setDetailPaymentId(null)} t={t} />

        {pagination && pagination.total_item > 0 ? (
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
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

            <Pagination className='mx-0 w-auto justify-start sm:justify-end'>
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
    </section>
  );
}
