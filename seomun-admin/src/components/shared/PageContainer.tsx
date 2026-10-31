import type { PropsWithChildren } from 'react';

import { cn } from '@/utils/cn';

type PageContainerProps = PropsWithChildren<{
  className?: string;
}>;

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div data-slot='page-container' className={cn('mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-6 md:px-6', className)}>
      {children}
    </div>
  );
}
