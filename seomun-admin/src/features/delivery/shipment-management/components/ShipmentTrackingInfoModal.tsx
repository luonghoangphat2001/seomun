import { AlertCircle, CheckCircle2, Loader2, MapPin, PackageCheck, RefreshCw, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { useShipmentTrackingInfoQuery } from '../api';

type ShipmentTrackingInfoModalProps = {
  trackingNumber: string | null;
  onClose: () => void;
};

export function ShipmentTrackingInfoModal({ trackingNumber, onClose }: ShipmentTrackingInfoModalProps) {
  const { t } = useTranslation();
  const trackingInfoQuery = useShipmentTrackingInfoQuery(trackingNumber ? { invoice_number: trackingNumber } : undefined);
  const trackingInfo = trackingInfoQuery.data?.data;

  return (
    <Dialog open={trackingNumber !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('page.delivery.shipments.tracking_info_dialog.title')}</DialogTitle>
          <DialogDescription>{t('page.delivery.shipments.tracking_info_dialog.description')}</DialogDescription>
        </DialogHeader>

        <div className='max-h-[70vh] space-y-5 overflow-y-auto pr-1'>
          <div className='from-primary to-primary/75 text-primary-foreground flex items-center justify-between gap-4 rounded-xl bg-linear-to-r p-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15'>
                <Truck className='size-5' aria-hidden='true' />
              </div>
              <div className='min-w-0'>
                <p className='text-primary-foreground/75 text-xs'>{t('page.delivery.shipments.fields.tracking_number')}</p>
                <p className='truncate font-mono text-lg font-semibold'>{trackingNumber}</p>
              </div>
            </div>
            {trackingInfo ? (
              <Badge variant='outline' className='max-w-48 border-white/30 bg-white/15 text-right text-white'>
                {trackingInfo.latestStatus.name}
              </Badge>
            ) : null}
          </div>

          {trackingInfoQuery.isLoading ? (
            <div className='text-muted-foreground flex min-h-52 flex-col items-center justify-center gap-3 text-sm'>
              <Loader2 className='text-primary size-6 animate-spin' aria-hidden='true' />
              {t('page.delivery.shipments.tracking_info_dialog.loading')}
            </div>
          ) : null}

          {trackingInfoQuery.isError ? (
            <div className='border-destructive/20 bg-destructive/5 flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border px-6 text-center'>
              <AlertCircle className='text-destructive size-7' aria-hidden='true' />
              <div>
                <p className='font-medium'>{t('page.delivery.shipments.tracking_info_dialog.error_title')}</p>
                <p className='text-muted-foreground mt-1 text-sm'>{t('page.delivery.shipments.tracking_info_dialog.error_description')}</p>
              </div>
              <Button type='button' variant='outline' size='sm' className='gap-1.5' onClick={() => void trackingInfoQuery.refetch()}>
                <RefreshCw className='size-3.5' aria-hidden='true' />
                {t('page.delivery.shipments.retry')}
              </Button>
            </div>
          ) : null}

          {trackingInfo ? (
            <>
              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='bg-muted/30 rounded-lg border p-3'>
                  <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                    <PackageCheck className='size-3.5' aria-hidden='true' />
                    {t('page.delivery.shipments.tracking_info_dialog.current_status')}
                  </div>
                  <p className='mt-1.5 font-semibold'>{trackingInfo.latestStatus.name}</p>
                </div>
                <div className='bg-muted/30 rounded-lg border p-3'>
                  <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                    <MapPin className='size-3.5' aria-hidden='true' />
                    {t('page.delivery.shipments.tracking_info_dialog.last_updated')}
                  </div>
                  <p className='mt-1.5 text-sm font-medium'>{trackingInfo.latestStatus.timestamp}</p>
                </div>
              </div>

              <section>
                <h3 className='mb-3 text-sm font-semibold'>{t('page.delivery.shipments.tracking_info_dialog.history')}</h3>
                {trackingInfo.history.length > 0 ? (
                  <ol className='relative ml-2 space-y-0 border-l'>
                    {trackingInfo.history.map((item, index) => (
                      <li key={`${item.status_code}-${item.status_date}-${index}`} className='relative pb-5 pl-5 last:pb-0'>
                        <span className='bg-primary ring-background absolute top-1 -left-2 flex size-4 items-center justify-center rounded-full ring-4'>
                          {index === 0 ? <CheckCircle2 className='text-primary-foreground size-2.5' aria-hidden='true' /> : null}
                        </span>
                        <div className='flex flex-col justify-between gap-1 sm:flex-row sm:gap-4'>
                          <div>
                            <p className='text-sm font-semibold'>{item.status_name}</p>
                            {item.description ? <p className='text-muted-foreground mt-0.5 text-sm'>{item.description}</p> : null}
                            {item.reason_message ? <p className='text-destructive mt-1 text-xs'>{item.reason_message}</p> : null}
                            {item.agency_name ? <p className='text-muted-foreground mt-1 text-xs'>{item.agency_name}</p> : null}
                          </div>
                          <time className='text-muted-foreground shrink-0 text-xs'>{item.status_date}</time>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className='text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm'>
                    {t('page.delivery.shipments.tracking_info_dialog.empty')}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
