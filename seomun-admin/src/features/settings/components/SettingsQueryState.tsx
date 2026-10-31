import type { UseQueryResult } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

type SettingsQueryStateProps<TData> = {
  query: UseQueryResult<TData, unknown>;
  errorTitle: string;
  errorDescription: string;
  children: (data: TData) => ReactNode;
};

/** Loading / error-with-retry card for a settings section, then the section itself once its data is in. */
export function SettingsQueryState<TData>({ query, errorTitle, errorDescription, children }: SettingsQueryStateProps<TData>) {
  const { t: tCommon } = useTranslation('common');

  if (query.isPending) {
    return (
      <div className='bg-card flex min-h-60 items-center justify-center rounded-xl border shadow-sm'>
        <Loader2 className='text-muted-foreground size-5 animate-spin' aria-hidden='true' />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className='bg-card flex min-h-60 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
        <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
          <AlertCircle className='size-6' />
        </div>

        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>{errorTitle}</h2>
          <p className='text-muted-foreground text-sm'>{errorDescription}</p>
        </div>

        <Button type='button' variant='outline' onClick={() => void query.refetch()} disabled={query.isFetching} className='gap-2'>
          {query.isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
          {tCommon('action.retry')}
        </Button>
      </div>
    );
  }

  return <>{children(query.data)}</>;
}
