import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

type UnitPriceQueryRefreshBannerProps = {
  onRetry: () => void;
  isFetching: boolean;
};

export function UnitPriceQueryRefreshBanner({ onRetry, isFetching }: UnitPriceQueryRefreshBannerProps) {
  const { t } = useTranslation();

  return (
    <div className='border-destructive/30 bg-destructive/5 text-destructive flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-start gap-2'>
        <AlertCircle className='mt-0.5 size-4 shrink-0' />
        <p className='text-sm font-medium'>{t('page.products.unit_price_settings.messages.load_error')}</p>
      </div>

      <Button type='button' variant='secondary' onClick={onRetry} disabled={isFetching}>
        {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
        {t('common.action.retry')}
      </Button>
    </div>
  );
}
