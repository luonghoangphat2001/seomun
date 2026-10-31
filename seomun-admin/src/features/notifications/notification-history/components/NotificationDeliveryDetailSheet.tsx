import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import type { NotificationHistoryRESP } from '../api/notification-history.response';
import { getNotificationSendingResultLabel, getNotificationTypeLabel } from '../constants';
import { NotificationSendingResult } from '../enums';

interface NotificationDeliveryDetailSheetProps {
  history: NotificationHistoryRESP | null;
  open: boolean;
  isResending: boolean;
  onOpenChange: (open: boolean) => void;
  onResend: (notificationHistoryId: number) => void;
}

const RESULT_BADGE_CLASSES: Record<NotificationSendingResult, string> = {
  [NotificationSendingResult.SUCCESS]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  [NotificationSendingResult.FAILURE]: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function NotificationDeliveryDetailSheet({ history, open, isResending, onOpenChange, onResend }: NotificationDeliveryDetailSheetProps) {
  const { t } = useTranslation('page');

  if (!history) {
    return null;
  }

  const deliveryLogs = history.delivery_logs ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full overflow-y-auto sm:max-w-2xl'>
        <SheetHeader className='space-y-2 border-b'>
          <SheetTitle>{t('notifications.history.sheet.title')}</SheetTitle>
          <SheetDescription>{t('notifications.history.sheet.description')}</SheetDescription>
        </SheetHeader>

        <div className='space-y-6 p-4'>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='col-span-2'>
              <SummaryCard label={t('notifications.history.sheet.template_number')} value={history.template.template_number} />
            </div>
            <SummaryCard label={t('notifications.history.sheet.notification_type')} value={getNotificationTypeLabel(t, history.notification_type)} />
            <SummaryCard label={t('notifications.history.sheet.last_delivery_date')} value={history.sent_at} />
            <SummaryCard label={t('notifications.history.sheet.message_title')} value={history.message_title} />
            <SummaryCard label={t('notifications.history.sheet.sender')} value={history.sender?.name ?? '-'} />
            <div className='col-span-2'>
              <SummaryCard label={t('notifications.history.sheet.recipients')} value={`${history.recipient_name} / ${history.recipient_contact}`} />
            </div>
          </div>

          <Separator />

          <div className='space-y-3'>
            <div>
              <h2 className='text-sm font-semibold'>{t('notifications.history.sheet.delivery_log')}</h2>
              <p className='text-muted-foreground text-sm'>{t('notifications.history.sheet.delivery_log_description')}</p>
            </div>

            <div className='space-y-3'>
              {deliveryLogs.length === 0 ? (
                <p className='text-muted-foreground text-sm'>{t('notifications.history.sheet.delivery_log_empty')}</p>
              ) : (
                deliveryLogs.map((log) => (
                  <div key={log.id} className='rounded-xl border p-4 shadow-sm'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                      <div className='space-y-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <p className='font-medium'>{log.recipient_name}</p>
                          <span className='text-muted-foreground text-xs'>{log.recipient_role}</span>
                        </div>
                        <p className='text-muted-foreground text-sm'>{log.recipient_contact}</p>
                        <p className='text-sm'>{log.message_title}</p>
                      </div>

                      <Badge variant='outline' className={RESULT_BADGE_CLASSES[log.result]}>
                        {getNotificationSendingResultLabel(t, log.result)}
                      </Badge>
                    </div>

                    <div className='mt-4 grid gap-3 text-sm sm:grid-cols-2'>
                      <DetailItem
                        label={t('notifications.history.sheet.notification_type')}
                        value={getNotificationTypeLabel(t, log.notification_type)}
                      />
                      <DetailItem label={t('notifications.history.sheet.delivery_date')} value={log.delivered_at} />
                      <DetailItem label={t('notifications.history.sheet.recipient_contact')} value={log.recipient_contact} />
                      <DetailItem label={t('notifications.history.sheet.failure_reason')} value={log.failure_reason ?? '-'} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <SheetFooter className='border-t'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('notifications.history.sheet.close')}
          </Button>
          <Button onClick={() => onResend(history.id)} disabled={history.failure_count === 0 || isResending}>
            {isResending ? t('notifications.history.sheet.resending') : t('notifications.history.sheet.resend')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-muted/30 min-w-0 rounded-xl border p-4'>
      <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>{label}</p>
      <p className='mt-1 text-sm font-medium wrap-break-word'>{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>{label}</p>
      <p className='mt-1 text-sm'>{value}</p>
    </div>
  );
}
