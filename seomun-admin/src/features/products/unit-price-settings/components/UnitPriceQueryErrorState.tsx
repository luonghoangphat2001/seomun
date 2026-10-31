import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

type UnitPriceQueryErrorStateProps = {
  onRetry: () => void;
  isFetching: boolean;
};

export function UnitPriceQueryErrorState({ onRetry, isFetching }: UnitPriceQueryErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
      <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
        <AlertCircle className='size-6' />
      </div>

      <div className='space-y-1'>
        <h2 className='text-lg font-semibold'>{t('page.products.unit_price_settings.messages.load_error')}</h2>
      </div>

      <Button type='button' variant='outline' onClick={onRetry} disabled={isFetching}>
        {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
        {t('common.action.retry')}
      </Button>
    </div>
  );
}
