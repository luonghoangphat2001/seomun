import { useTranslation } from 'react-i18next';

import type { BankFeedSyncRESP } from '../api';

type PopbillSyncStatusProps = {
  syncs: BankFeedSyncRESP[];
};

const formatDateTime = (value: string | null) =>
  value ? new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';

export function PopbillSyncStatus({ syncs }: PopbillSyncStatusProps) {
  const { t } = useTranslation('page');

  return (
    <section className='space-y-3'>
      <h2 className='text-base font-semibold'>{t('payments.popbill_deposits.sync_status', 'POPBiLL sync status')}</h2>
      {syncs.length ? (
        <div className='grid gap-3 md:grid-cols-3'>
          {syncs.map((sync) => {
            const hasLatestError = Boolean(sync.last_error_at && (!sync.last_success_at || sync.last_error_at > sync.last_success_at));
            return (
              <div key={sync.id} className='bg-card rounded-lg border p-4 text-sm'>
                <p className='font-medium'>{t(`payments.popbill_deposits.banks.${sync.account_key}`, sync.account_key)}</p>
                <p className={hasLatestError ? 'text-destructive mt-2' : 'text-muted-foreground mt-2'}>
                  {hasLatestError
                    ? t('payments.popbill_deposits.sync_error', 'Latest sync failed (code: {{code}})', { code: sync.last_error_code ?? '-' })
                    : t('payments.popbill_deposits.last_success', 'Last success: {{date}}', { date: formatDateTime(sync.last_success_at) })}
                </p>
                <p className='text-muted-foreground mt-1'>
                  {t('payments.popbill_deposits.completed_through', 'Completed through: {{date}}', { date: formatDateTime(sync.completed_through) })}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className='text-muted-foreground rounded-lg border border-dashed px-4 py-5 text-sm'>
          {t('payments.popbill_deposits.no_sync_data', 'No sync data is available yet.')}
        </p>
      )}
    </section>
  );
}
