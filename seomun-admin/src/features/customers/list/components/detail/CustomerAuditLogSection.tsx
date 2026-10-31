import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { PaginationMeta } from '@/types/api';
import { cn } from '@/utils/cn';
import { formatKoreanDateTime } from '@/utils/format-date';

import type { CustomerAuditLog } from '../../../types/customer.type';
import { getCustomerAuditActionBadgeClass, getCustomerAuditActionLabel } from '../../../utils/audit-log';
import { CustomerDetailPagination } from './CustomerDetailPagination';

type CustomerAuditLogSectionProps = {
  logs: CustomerAuditLog[];
  pagination?: PaginationMeta;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export function CustomerAuditLogSection({ logs, pagination, isLoading, onPageChange, onPageSizeChange }: CustomerAuditLogSectionProps) {
  const { t } = useTranslation();

  return (
    <section className='rounded-xl border'>
      <div className='border-b px-5 py-4'>
        <h2 className='text-sm font-semibold'>{t('page.customers.detail.sections.audit_log')}</h2>
      </div>
      <div className='space-y-3 p-5'>
        {isLoading ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className='h-16 w-full rounded-xl' />) : null}
        {!isLoading && logs.length === 0 ? <p className='text-muted-foreground text-sm'>{t('page.customers.detail.audit_log.empty')}</p> : null}
        {logs.map((log) => (
          <article key={log.id} className='bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3'>
            <div className='flex items-center gap-2.5'>
              <Badge variant='outline' className={cn('rounded-md px-2.5 py-1', getCustomerAuditActionBadgeClass(log.action))}>
                {getCustomerAuditActionLabel(t, log.action)}
              </Badge>
              <div className='text-left text-sm'>
                <p className='font-medium'>{log.changedBy?.name ?? log.actor ?? '-'}</p>
                {log.changedBy?.email ? <p className='text-muted-foreground text-xs'>{log.changedBy.email}</p> : null}
              </div>
            </div>

            {log.action ? <p className='text-muted-foreground flex-1 text-center text-xs'>{log.action}</p> : null}

            <p className='text-muted-foreground text-xs'>{formatKoreanDateTime(log.changedAt)}</p>
          </article>
        ))}
        {pagination && onPageChange && onPageSizeChange ? (
          <CustomerDetailPagination pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        ) : null}
      </div>
    </section>
  );
}
