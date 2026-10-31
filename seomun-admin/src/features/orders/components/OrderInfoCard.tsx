import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface OrderInfoCardProps {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Label/value card used by the order detail sections.
 *
 * The <dl> itself is the two-column grid and each row contributes its <dt>/<dd> directly, so the
 * label column is sized once from the widest label in the card instead of being a fixed width that
 * forces every label to wrap. The value column keeps a floor of 8rem and the label is allowed to
 * shrink below max-content, so a cramped card wraps its labels rather than squeezing values down
 * to a few characters per line.
 */
export function OrderInfoCard({ title, action, className, children }: OrderInfoCardProps) {
  return (
    <section className={cn('bg-card flex flex-col rounded-xl border p-4 shadow-sm', className)}>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <h3 className='text-base font-semibold'>{title}</h3>
        {action}
      </div>

      <dl className='grid grid-cols-[minmax(0,max-content)_minmax(8rem,1fr)] overflow-hidden rounded-md border [&>*:nth-last-child(-n+2)]:border-b-0'>
        {children}
      </dl>
    </section>
  );
}

export function OrderInfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className='bg-muted/50 border-b px-3 py-2.5 text-sm font-medium'>{label}</dt>
      <dd className='min-w-0 border-b px-3 py-2.5 text-sm wrap-break-word'>{children}</dd>
    </>
  );
}
