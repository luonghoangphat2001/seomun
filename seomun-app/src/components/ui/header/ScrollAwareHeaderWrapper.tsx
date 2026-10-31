'use client';

import { useScrollDirection } from '@/hooks';
import { cn } from '@/lib/utils';

export const ScrollAwareHeaderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { direction } = useScrollDirection();
  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 bg-[#FEFEFE] shadow-sm transition-transform duration-300',
        direction === 'down' ? '-translate-y-full' : 'translate-y-0',
      )}>
      {children}
    </header>
  );
};
