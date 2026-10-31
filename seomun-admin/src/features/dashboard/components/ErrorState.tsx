import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';

type ErrorStateProps = {
  title: string;
  isFetching: boolean;
  onRetry: () => void;
};

export function ErrorState({ title, isFetching, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border px-6 py-10 text-center shadow-sm'>
      <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
        <AlertCircle className='size-6' />
      </div>
      <div className='space-y-1'>
        <h2 className='text-lg font-semibold'>{title}</h2>
        <p className='text-muted-foreground text-sm'>{t('page.dashboard.error.description')}</p>
      </div>
      <AppButton type='button' variant='outline' onClick={onRetry} isLoading={isFetching} leftIcon={<RefreshCw className='size-4' />}>
        {t('page.dashboard.error.retry')}
      </AppButton>
    </div>
  );
}
