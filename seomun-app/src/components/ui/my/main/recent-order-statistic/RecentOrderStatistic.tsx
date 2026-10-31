'use client';

import { DashboardRESP, DashboardStatusRESP } from '@/apis/my/dashboard/dashboard.response';
import { OrderStatusBar, Popover } from '@/components/common';
import { DESIGN_STATUS_CONFIG, ORDER_STATUS_CONFIG, SHIPPING_STATUS_CONFIG } from '@/constants/order';
import { DesignStatus, ShippingStatus } from '@/enums/order';
import { HelpCircle } from '@/icons';
import { useTranslations } from 'next-intl';

type RecentOrderStatisticProps = {
  dataDashboard?: DashboardRESP;
};

const getStatusCounts = (statuses: DashboardStatusRESP[] = [], statusKeyMap: Record<string, string> = {}) =>
  Object.fromEntries(statuses.map(({ key, count }) => [statusKeyMap[key] ?? key, count]));

const DESIGN_STATUS_KEY_MAP: Record<string, DesignStatus> = {
  awaiting_payment: DesignStatus.PAYMENT_PENDING,
  pending_reception: DesignStatus.RECEIPT_PENDING,
  designing: DesignStatus.IN_DESIGN,
  draft_delivery: DesignStatus.DRAFT_DELIVERY,
  design_done: DesignStatus.DESIGN_COMPLETE,
};

const DELIVERY_STATUS_KEY_MAP: Record<string, ShippingStatus> = {
  pickup: ShippingStatus.PICKUP,
  courier: ShippingStatus.SHIPPING,
  quick: ShippingStatus.QUICK_DELIVERY,
  direct: ShippingStatus.DIRECT_DELIVERY,
  delivered: ShippingStatus.DELIVERY_COMPLETE,
};

const RecentOrderStatistic = ({ dataDashboard }: RecentOrderStatisticProps) => {
  const t = useTranslations();
  const productionCounts = getStatusCounts(dataDashboard?.production_status);
  const designCounts = getStatusCounts(dataDashboard?.design_status, DESIGN_STATUS_KEY_MAP);
  const deliveryCounts = getStatusCounts(dataDashboard?.delivery_status, DELIVERY_STATUS_KEY_MAP);

  return (
    <section className='hidden space-y-4 md:block md:space-y-8'>
      {/**Production Status */}
      <OrderStatusBar
        statusConfig={ORDER_STATUS_CONFIG}
        title={t('order.production_status')}
        titleClassName='mb-4 title-20'
        count={productionCounts}
      />
      <div className='mobile-seperator'></div>
      {/**Design Status */}
      <OrderStatusBar
        statusConfig={DESIGN_STATUS_CONFIG}
        title={t('order.design_status')}
        titleClassName='mb-4 title-20'
        count={designCounts}
      />
      <div className='mobile-seperator'></div>
      {/**Shipping Status */}
      <OrderStatusBar
        statusConfig={SHIPPING_STATUS_CONFIG}
        title={t('order.shipping_status')}
        titleClassName='mb-4 title-20'
        count={deliveryCounts}
        renderExtra={
          <Popover align='left' contentClassName='w-[180px]' trigger={<HelpCircle className='text-text-secondary size-5' />}>
            {t('order.shipping_status_note')}
          </Popover>
        }
      />
    </section>
  );
};

export default RecentOrderStatistic;
