'use client';

import { ORDER_STATUS_CONFIG } from '@/constants/order';
import { OrderHistoryStatus } from '@/enums/order';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type OrderStatusBageProps = {
  status: OrderHistoryStatus;
  label?: string;
};

const OrderStatusBage = ({ status, label }: OrderStatusBageProps) => {
  const tOrder = useTranslations('order');
  const config = ORDER_STATUS_CONFIG[status];

  if (!config) {
    return (
      <div
        className={cn(
          'caption-12 text-text-main w-fit max-w-full rounded-lg bg-gray-100 px-3 py-1 text-center font-bold wrap-break-word whitespace-normal shadow-sm',
          status === OrderHistoryStatus.COMPLETED && 'bg-[#6BB77A] text-gray-50',
        )}>
        {label || status}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'caption-12 w-fit max-w-full rounded-lg px-3 py-1 text-center font-bold wrap-break-word whitespace-normal shadow-sm',
        config.className,
      )}>
      {label || tOrder(config.label)}
    </div>
  );
};

export default OrderStatusBage;
