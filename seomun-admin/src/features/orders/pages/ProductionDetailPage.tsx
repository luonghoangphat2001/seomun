import { getRouteApi, Link } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useOrderDetailQuery } from '../api';
import { OrderBasicInfo } from '../components/OrderBasicInfo';
import { OrderProductInfo } from '../components/OrderProductInfo';
import { OrderShippingInfo } from '../components/OrderShippingInfo';
import { OrderStatusHistory } from '../components/OrderStatusHistory';

const routeApi = getRouteApi('/orders/production/$orderId');

export function ProductionDetailPage() {
  const { t } = useTranslation('page');
  const { orderId } = routeApi.useParams();

  const { data: order, isLoading, isError, refetch, isFetching } = useOrderDetailQuery(orderId);

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center py-20'>
          <Loader2 className='text-primary size-8 animate-spin' />
        </div>
      </PageContainer>
    );
  }

  if (isError || !order) {
    return (
      <PageContainer>
        <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
          <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
            <AlertCircle className='size-6' />
          </div>

          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>{t('orders.detail.error.load_title')}</h2>
            <p className='text-muted-foreground text-sm'>{t('orders.detail.error.load_description')}</p>
          </div>

          <Button type='button' variant='outline' onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
            {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
            {t('orders.detail.retry')}
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild className='-ml-2'>
            <Link to='/orders/production'>
              <ArrowLeft className='size-5' />
              <span className='sr-only'>{t('orders.detail.back')}</span>
            </Link>
          </Button>
          <div>
            <h1 className='text-xl font-semibold'>{t('orders.detail.title', { order_number: order.order_number })}</h1>
          </div>
        </div>
      </div>

      <Separator />

      <div className='space-y-6'>
        <OrderBasicInfo order={order} />

        <OrderProductInfo
          items={order.product_information?.items ?? []}
          orderItems={order.items}
          orderNumber={order.order_number}
          orderStatus={order.status}
          productImage={order.product.images}
        />

        <OrderShippingInfo order={order} />

        <OrderStatusHistory orderNumber={order.order_number} />
      </div>
    </PageContainer>
  );
}
