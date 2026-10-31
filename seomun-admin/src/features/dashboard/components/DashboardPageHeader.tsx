import type { ReactNode } from 'react';

import { Separator } from '@/components/ui/separator';

type DashboardPageHeaderProps = {
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function DashboardPageHeader({ title, actions, children }: DashboardPageHeaderProps) {
  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>{title}</h1>
          {/* <p className='text-muted-foreground mt-1 text-sm'>{description}</p> */}
        </div>
        {actions ? <div className='w-full xl:w-auto'>{actions}</div> : null}
      </div>

      {children ? <div>{children}</div> : null}

      <Separator />
    </div>
  );
}
