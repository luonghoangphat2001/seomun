import { Barcode, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScanResultState } from '../types/production-tools.type';
import { getStatusLabel } from '../utils/production-tools.utils';

type ScanFeedbackBoxProps = {
  scanResult: ScanResultState;
};

export function ScanFeedbackBox({ scanResult }: ScanFeedbackBoxProps) {
  return (
    <Card className='shadow-sm'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-muted-foreground text-sm font-medium tracking-wider uppercase'>Scan Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`rounded-xl border p-5 transition-all duration-300 ${
            scanResult.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20'
              : scanResult.kind === 'error'
                ? 'border-destructive/20 bg-destructive/5 dark:border-destructive/30'
                : 'bg-muted/20 border-dashed'
          }`}
        >
          <div className='flex items-start gap-4'>
            {scanResult.kind === 'success' ? (
              <div className='rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'>
                <CheckCircle2 className='size-6 animate-bounce' />
              </div>
            ) : scanResult.kind === 'error' ? (
              <div className='bg-destructive/10 text-destructive rounded-full p-2'>
                <XCircle className='animate-shake size-6' />
              </div>
            ) : (
              <div className='bg-muted text-muted-foreground rounded-full p-2'>
                <Barcode className='size-6' />
              </div>
            )}

            <div className='flex-1 space-y-1'>
              <div className='text-base font-semibold'>{scanResult.title}</div>
              <p className='text-muted-foreground text-sm leading-relaxed'>{scanResult.description}</p>

              {scanResult.kind === 'success' ? (
                <div className='bg-background/80 mt-4 rounded-lg border p-4 shadow-sm'>
                  <div className='grid gap-4 sm:grid-cols-3'>
                    <div className='space-y-0.5'>
                      <div className='text-muted-foreground text-xs tracking-wider uppercase'>Order Number</div>
                      <div className='text-sm font-semibold'>{scanResult.order_number}</div>
                    </div>
                    <div className='space-y-0.5'>
                      <div className='text-muted-foreground text-xs tracking-wider uppercase'>Previous Status</div>
                      <div className='text-muted-foreground text-sm font-medium'>{getStatusLabel(scanResult.status_before)}</div>
                    </div>
                    <div className='space-y-0.5'>
                      <div className='flex items-center gap-1 text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400'>
                        Current Status <ArrowRight className='size-3' />
                      </div>
                      <div className='text-sm font-bold text-emerald-700 dark:text-emerald-300'>
                        {getStatusLabel(scanResult.status_after, scanResult.status_after_label)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
