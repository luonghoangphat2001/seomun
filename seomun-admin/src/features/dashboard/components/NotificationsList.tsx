import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';

import type { DashboardNotification, OperationNotificationsHot } from '../api';
import { NOTIFICATION_CONFIG } from '../constants';
import { translateDashboardNotificationDescription, translateDashboardNotificationTitle } from '../utils';

type NotificationsListProps = {
  data?: OperationNotificationsHot;
  isLoading?: boolean;
};

const ITEMS: { id: string; field: keyof OperationNotificationsHot; severity: DashboardNotification['severity'] }[] = [
  { id: 'unapproved-customers', field: 'customer_unapproved', severity: 'critical' },
  { id: 'new-inquiries', field: 'inquiries_in_progress', severity: 'warning' },
  { id: 'low-stock', field: 'product_out_stock_total', severity: 'info' },
];

export function NotificationsList({ data, isLoading }: NotificationsListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <Skeleton className='h-[430px] rounded-lg' />;
  }

  if (!data) return null;

  return (
    <Card className='overflow-hidden border-gray-200 bg-white shadow-sm'>
      <CardHeader className='border-b border-gray-100 bg-linear-to-r from-gray-50 to-white pb-4'>
        <CardTitle className='flex items-center gap-2 text-lg font-bold text-gray-900'>{t('page.dashboard.notifications.title')}</CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='min-h-[340px] space-y-1 pb-8'>
          {ITEMS.map((item) => {
            const config = NOTIFICATION_CONFIG[item.severity];
            const Icon = config.icon;

            return (
              <div key={item.id} className='flex w-full items-start justify-between gap-3 border-b px-6 py-4 last:border-b-0'>
                <div className='flex min-w-0 items-start gap-3'>
                  <Icon className={cn('mt-0.5 size-5 shrink-0', config.color)} />
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold text-gray-900'>{translateDashboardNotificationTitle(t, item.id, item.id)}</p>
                    <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>{translateDashboardNotificationDescription(t, item.id, '')}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2 text-sm font-bold',
                    config.badgeClassName,
                  )}
                >
                  {data[item.field]}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
