import { forwardRef } from 'react';
import { Barcode, Play, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ScannerConsoleProps = {
  barcodeValue: string;
  isProcessingScan: boolean;
  onBarcodeChange: (value: string) => void;
  onScan: () => void;
};

export const ScannerConsole = forwardRef<HTMLInputElement, ScannerConsoleProps>(
  ({ barcodeValue, isProcessingScan, onBarcodeChange, onScan }, ref) => {
    const { t } = useTranslation('page');

    return (
      <Card className='border-primary/20 border-2 shadow-md'>
        <CardHeader className='bg-accent/30 rounded-t-xl pb-4'>
          <CardTitle className='flex items-center gap-3 text-lg font-semibold'>
            <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
              <Barcode className='size-5 animate-pulse' />
            </div>
            {t('orders.production_tools.scanner.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-5 pt-6'>
          <div className='space-y-2'>
            <label htmlFor='production-barcode' className='text-sm font-medium'>
              {t('orders.production_tools.scanner.barcode_label')}
            </label>
            <div className='relative'>
              <AppInput
                ref={ref}
                id='production-barcode'
                value={barcodeValue}
                onChange={(event) => onBarcodeChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onScan();
                  }
                }}
                autoComplete='off'
                placeholder={t('orders.production_tools.scanner.barcode_placeholder')}
                className='focus-within:ring-primary/30 h-14 pr-12 text-lg font-medium tracking-wide placeholder:font-normal focus-within:ring-2'
                disabled={isProcessingScan}
              />
              <div className='absolute top-1/2 right-4 -translate-y-1/2'>
                <Play className='text-muted-foreground size-5 animate-pulse' />
              </div>
            </div>
          </div>

          <Button
            type='button'
            className='h-12 w-full gap-2 text-base font-medium shadow-sm transition hover:shadow'
            onClick={onScan}
            disabled={isProcessingScan}
          >
            {isProcessingScan ? (
              <>
                <RefreshCcw className='size-5 animate-spin' />
                {t('orders.production_tools.scanner.processing')}
              </>
            ) : (
              <>
                {/* <Volume2 className='size-5' /> */}
                {t('orders.production_tools.scanner.submit')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  },
);
ScannerConsole.displayName = 'ScannerConsole';
