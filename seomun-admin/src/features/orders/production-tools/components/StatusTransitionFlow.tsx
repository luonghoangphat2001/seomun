import { ArrowRight, GitBranch } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/features/orders/constants';
import type { OrderStatus } from '@/features/orders/enums';

import { NEXT_STATUS_MAP } from '../constants';

export function StatusTransitionFlow() {
  const { t } = useTranslation('page');

  return (
    <Card className='shadow-sm'>
      <CardHeader className='border-b pb-4'>
        <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
          <GitBranch className='text-primary size-5' aria-hidden='true' />
          {t('orders.production_tools.status_flow.title')}
        </CardTitle>
        <p className='text-muted-foreground text-sm'>{t('orders.production_tools.status_flow.description')}</p>
      </CardHeader>
      <CardContent className='pt-4'>
        <p className='text-muted-foreground mb-3 text-xs'>{t('orders.production_tools.status_flow.scan_hint')}</p>
        <ol className='space-y-2'>
          {Object.entries(NEXT_STATUS_MAP).map(([currentStatus, nextStatus]) => {
            const current = currentStatus as OrderStatus;
            const next = nextStatus as OrderStatus;

            return (
              <li key={current} className='bg-muted/30 flex items-center gap-2 rounded-lg border p-2.5'>
                <span className={`min-w-0 truncate rounded px-2 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[current]}`}>
                  {ORDER_STATUS_LABELS[current](t)}
                </span>
                <ArrowRight className='text-muted-foreground size-4 shrink-0' aria-hidden='true' />
                <span className={`min-w-0 truncate rounded px-2 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[next]}`}>
                  {ORDER_STATUS_LABELS[next](t)}
                </span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
