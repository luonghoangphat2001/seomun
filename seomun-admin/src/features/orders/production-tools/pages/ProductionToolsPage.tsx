import { useRef } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useProductionScanner } from '../hooks/useProductionScanner';
import { ScannerConsole } from '../components/ScannerConsole';
import { StatusTransitionFlow } from '../components/StatusTransitionFlow';

export function ProductionToolsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation('page');

  const {
    barcodeValue,
    setBarcodeValue,
    // scanResult,
    // recentScans,
    // previewOrder,
    // summaryCounts,
    // isLoading,
    isError,
    isFetching,
    isProcessingScan,
    refetch,
    handleScan,
    //handleSelectRecentScan,
  } = useProductionScanner(inputRef);

  return (
    <PageContainer>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold tracking-tight'>{t('orders.production_tools.title')}</h1>
            <span className='relative flex size-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
              <span className='relative inline-flex size-2 rounded-full bg-emerald-500'></span>
            </span>
          </div>
          {/* <p className='text-muted-foreground mt-1 text-sm'>{t('orders.production_tools.description')}</p> */}
        </div>

        {/* <div className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={() => void refetch()}
            disabled={isFetching || isProcessingScan}
          >
            <RefreshCcw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            {t('orders.production_tools.refresh')}
          </Button>
        </div> */}
      </div>

      <Separator />

      {isError ? (
        <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
          <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
            <AlertCircle className='size-6' />
          </div>

          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>{t('orders.production_tools.error.load_title')}</h2>
            <p className='text-muted-foreground text-sm'>{t('orders.production_tools.error.load_description')}</p>
          </div>

          <Button type='button' variant='outline' onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
            <RefreshCcw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            {t('orders.production_tools.retry')}
          </Button>
        </div>
      ) : (
        <>
          {/* Workload Counters - Top Row */}
          {/* {isLoading ? (
            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='bg-muted h-24 w-full animate-pulse rounded-xl border' />
              ))}
            </div>
          ) : (
            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
              {summaryCounts.map(({ status, count }) => (
                <SummaryCard key={status} title={getStatusLabel(status)} count={count} status={status} />
              ))}
            </div>
          )} */}

          {/* Core Scanner Console Layout */}
          <div className='grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_1fr]'>
            {/* Left Column - Scanning Terminal and Results */}
            <div className='space-y-6'>
              <ScannerConsole
                ref={inputRef}
                barcodeValue={barcodeValue}
                isProcessingScan={isProcessingScan}
                onBarcodeChange={setBarcodeValue}
                onScan={handleScan}
              />

              {/* <ScanFeedbackBox scanResult={scanResult} /> */}
            </div>

            {/* Right Column - Status Flow, Scanned Context & History */}
            <div className='space-y-6'>
              <StatusTransitionFlow />

              {/* <div className='space-y-6'>
              <ActiveOrderPreview previewOrder={previewOrder} />

              <ScanHistoryList recentScans={recentScans} onSelectScan={handleSelectRecentScan} />
              </div> */}
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
