'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export type ContentRow = {
  items: {
    label: React.ReactNode;
    value?: React.ReactNode;
  }[];
};

type DescriptionContentProps = {
  rows: ContentRow[];
  className?: string;
  labelClassName?: string;
  mobileInRow?: boolean;
};

export function DescriptionContent({ rows, className, labelClassName, mobileInRow }: DescriptionContentProps) {
  return (
    <div className={cn('border-border-soft overflow-hidden border', className)}>
      {rows.map((row, i) => {
        return !mobileInRow ? (
          <div key={i} className='border-border-soft flex flex-col border-b last:border-0 md:flex-row'>
            {row.items.map((item, j) => (
              <React.Fragment key={j}>
                {/* Label */}
                <div
                  className={cn(
                    'bg-border-light body-14 md:body-16 flex w-full items-center py-3 pr-2 pl-4 md:w-29.5',
                    labelClassName,
                    j === 1 && 'md:border-border-soft md:border-l',
                  )}>
                  {item.label}
                </div>

                {/* Value */}
                <div
                  className={cn(
                    'title-14 md:title-16 flex flex-1 items-center px-4 py-3',
                    row.items.length > 1 && j === 0 && 'border-border-soft border-b md:border-none',
                  )}>
                  {item.value || '-'}
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div key={i} className='flex flex-col md:hidden'>
            {row.items.map((item, j) => {
              const isSingle = rows.length === 1 && row.items.length === 1;
              const isLast = i === rows.length - 1 && j === row.items.length - 1;

              return (
                <div key={j} className={cn('border-border-soft flex border-b', (isSingle || isLast) && 'border-none')}>
                  {/* Label */}
                  <div
                    className={cn(
                      'bg-border-light border-border-soft body-14 flex w-29.5 items-center border-r py-3 pr-2 pl-4',
                      labelClassName,
                    )}>
                    {item.label}
                  </div>

                  {/* Value */}
                  <div className={cn('title-14 flex flex-1 items-center px-4 py-3')}>{item.value || '-'}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
