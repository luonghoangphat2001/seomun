import { useTranslation } from 'react-i18next';

import type { PointChangeLog } from '../../types/customer.type';
import { translatePointChangeAction, translatePointChangeReason } from '../../utils/i18n';

type PointChangeLogSectionProps = {
  logs: PointChangeLog[];
  isLoading?: boolean;
};

export function PointChangeLogSection({ logs, isLoading }: PointChangeLogSectionProps) {
  const { t } = useTranslation();

  return (
    <section className='rounded-xl border p-5'>
      <div className='mb-4'>
        <h2 className='text-sm font-semibold'>{t('page.customers.points.change_log.title')}</h2>
      </div>
      {isLoading ? <p className='text-muted-foreground text-sm'>{t('common.message.loading')}</p> : null}
      {!isLoading && logs.length === 0 ? <p className='text-muted-foreground text-sm'>{t('page.customers.points.change_log.empty')}</p> : null}
      <div className='space-y-3'>
        {logs.map((log) => (
          <div key={log.id} className='rounded-lg border p-4'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <p className='font-medium'>{translatePointChangeAction(t, log.action)}</p>
              <p className='text-muted-foreground text-xs'>{new Date(log.createdAt).toLocaleString()}</p>
            </div>
            <p className='text-muted-foreground mt-1 text-sm'>
              {log.targetName} (#{log.targetMemberId}) | {log.amount.toLocaleString()}p
            </p>
            <p className='mt-2 text-sm'>
              {t('page.customers.points.change_log.reason')}: {translatePointChangeReason(t, log.reason)}
            </p>
            <p className='text-muted-foreground mt-1 text-xs'>
              {t('page.customers.points.change_log.actor')}: {log.actor}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
