'use client';

import { DesignStatus, OrderHistoryStatus, OrderStatus, ShippingStatus } from '@/enums/order';
import { HelpCircle } from '@/icons';
import { cn } from '@/lib/utils';
import { OrderStatusConfig } from '@/types';
import { useTranslations } from 'next-intl';
import { Popover } from '../popover';

type OrderStatusCardProps = {
  status: OrderHistoryStatus | OrderStatus | DesignStatus | ShippingStatus;
  config: OrderStatusConfig;
  helperMessage?: string;
  isActive?: boolean;
  cardRef?: React.Ref<HTMLDivElement>;
  count?: number;
  showArrow?: boolean;
};

export const OrderStatusCard = ({
  status,
  config,
  helperMessage,
  isActive,
  cardRef,
  count = 0,
  showArrow,
}: OrderStatusCardProps) => {
  const t = useTranslations('order');
  const { icon: Icon } = config;

  return (
    <div
      ref={cardRef}
      className={cn(
        'border-border-soft flex shrink-0 flex-col items-center overflow-hidden rounded-xl border pt-4 pb-2 whitespace-nowrap',
        isActive && 'bg-primary-50 border-border-brand text-text-brand',
        showArrow ? 'min-w-22.5 md:flex-1' : 'min-w-30 md:w-[calc((100%-64px)/9)]',
      )}>
      <Icon className={cn('size-8', status === ShippingStatus.PICKUP && 'stroke-2')} />
      <div className='body-14 mt-2 flex items-center justify-center gap-1'>
        <p className={cn('truncate', showArrow ? '' : 'max-w-26')} style={{ wordBreak: 'break-all' }}>
          {config.label ? t(config.label) : t(`order_status.${status}`)}
        </p>
        {helperMessage && (
          <Popover align='left' contentClassName='w-[180px]' trigger={<HelpCircle className='text-text-secondary size-3.5' />}>
            {t(`${helperMessage}`)}
          </Popover>
        )}
      </div>
      {!showArrow && <p className='title-32 mt-0.5'>{String(count).padStart(2, '0')}</p>}
    </div>
  );
};
