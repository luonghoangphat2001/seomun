'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { OrderStatusCard } from './OrderStatusCard';
import { ArrowRight } from '@/icons';
import { DesignStatus, OrderHistoryStatus, OrderStatus, ShippingStatus } from '@/enums/order';
import { OrderStatusConfig } from '@/types';

type StatusType = OrderHistoryStatus | OrderStatus | DesignStatus | ShippingStatus;

type OrderStatusBarProps = {
  status?: StatusType;
  statusConfig: Record<string, OrderStatusConfig>;
  title: string;
  showArrow?: boolean;
  count?: Partial<Record<string, number>>;
  titleClassName?: string;
  renderExtra?: React.ReactNode;
};

export const OrderStatusBar = ({
  status,
  statusConfig,
  title,
  showArrow,
  count,
  titleClassName,
  renderExtra,
}: OrderStatusBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const activeEl = activeCardRef.current;
    if (!scrollEl || !activeEl) return;

    const scrollLeft = activeEl.offsetLeft - scrollEl.offsetLeft - scrollEl.clientWidth / 2 + activeEl.clientWidth / 2;

    scrollEl.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, [status]);

  return (
    <div className='grid grid-cols-1'>
      <div className={cn('title-14 md:title-20 mb-2 flex items-center gap-1.5', titleClassName)}>
        <h2>{title}</h2>
        {renderExtra}
      </div>

      <div ref={scrollRef} className={cn('scrollbar-hide flex w-full items-center overflow-auto', showArrow ? 'gap-3' : 'gap-2')}>
        {Object.entries(statusConfig).map(([key, config], index, array) => {
          const isLast = index === array.length - 1;
          const isActive = key === status;
          const countStatus = count?.[key as StatusType];

          return (
            <React.Fragment key={key}>
              <OrderStatusCard
                status={key as StatusType}
                config={config}
                helperMessage={config.helperMessage}
                isActive={isActive}
                cardRef={isActive ? activeCardRef : undefined}
                showArrow={showArrow}
                count={countStatus}
              />

              {showArrow && !isLast && (
                <div className='flex w-5 shrink-0 justify-center'>
                  <ArrowRight />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
