import type { FormEventHandler, ReactNode } from 'react';

import { Separator } from '@/components/ui/separator';

type SettingsFormCardProps = {
  title: string;
  description?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  footer: ReactNode;
};

export function SettingsFormCard({ title, description, onSubmit, children, footer }: SettingsFormCardProps) {
  return (
    <form onSubmit={onSubmit} className='bg-card overflow-hidden rounded-xl border shadow-sm' noValidate>
      <div className='px-5 py-4'>
        <h2 className='text-base font-semibold'>{title}</h2>
        {description ? <p className='text-muted-foreground mt-0.5 text-sm'>{description}</p> : null}
      </div>

      <Separator className='opacity-50' />

      <div className='space-y-5 px-5 py-5'>{children}</div>

      <div className='bg-muted/30 flex items-center justify-end gap-2 border-t px-5 py-3'>{footer}</div>
    </form>
  );
}
