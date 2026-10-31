import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

import { useInquiryAuditLogs } from '../../api';
import { getAuditLogActionLabel, getAuditLogFieldLabel, getInquiryStatusLabel } from '../../constants';
import { AuditLogField, InquiryStatus } from '../../enums';
import { formatLocalDateTimeShort } from '@/utils/format-date';

export function InquiryAuditLogSection({ inquiryId }: { inquiryId: string }) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const { data, isLoading } = useInquiryAuditLogs(inquiryId);
  const logs = data ?? [];

  const renderValue = (field: AuditLogField, value: string | number | null) => {
    if (value === null) return '-';
    if (field === AuditLogField.STATUS && Object.values(InquiryStatus).includes(value as InquiryStatus)) {
      return getInquiryStatusLabel(t, value as InquiryStatus);
    }
    return value;
  };

  return (
    <section className='bg-card rounded-xl border'>
      <div className='px-6 py-4'>
        <h2 className='text-sm font-semibold'>{t('page.inquiries.detail.activity_log')}</h2>
      </div>
      <Separator />
      <div className='space-y-3 p-6'>
        {isLoading ? <div className='text-muted-foreground text-sm'>{t('page.inquiries.messages.loading_logs')}</div> : null}
        {!isLoading && logs.length === 0 ? <div className='text-muted-foreground text-sm'>{t('page.inquiries.messages.no_logs')}</div> : null}
        {logs.map((log) => (
          <div key={log.id} className='rounded-lg border px-4 py-3 text-sm'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <span className='font-medium'>{getAuditLogActionLabel(t, log.action)}</span>
              <span className='text-muted-foreground text-xs'>{formatLocalDateTimeShort(log.changed_at)}</span>
            </div>
            <div className='text-muted-foreground mt-1 text-xs'>
              {t('page.inquiries.detail.actor')}: {log.changed_by?.name ?? '-'}
            </div>
            <div className='text-muted-foreground mt-1 text-xs'>
              {getAuditLogFieldLabel(t, log.field)}: {renderValue(log.field, log.old_value)} → {renderValue(log.field, log.new_value)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
