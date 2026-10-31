import { getRouteApi, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { OrderDetailPanel } from '../components/OrderDetailPanel';

const routeApi = getRouteApi('/orders/$orderId');

export function OrderDetailPage() {
  const { t } = useTranslation('page');
  const { orderId } = routeApi.useParams();

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild className='-ml-2'>
            <Link to='/orders'>
              <ArrowLeft className='size-5' />
              <span className='sr-only'>{t('orders.detail.back')}</span>
            </Link>
          </Button>
          <div>
            <h1 className='text-xl font-semibold'>{t('orders.detail.title', { order_number: orderId })}</h1>
            <p className='text-muted-foreground mt-0.5 text-sm'>{t('orders.detail.description')}</p>
          </div>
        </div>
      </div>

      <Separator />

      <OrderDetailPanel orderNumber={orderId} hideHeader />
    </PageContainer>
  );
}
