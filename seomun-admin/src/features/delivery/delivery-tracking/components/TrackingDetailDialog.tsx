import { CheckCircle2, ClipboardList, Loader2, MapPin, Package, ShoppingBag, Truck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/utils/cn';

import { DELIVERY_STAGE_BADGE_CLASSES, DELIVERY_STAGE_TRANSLATION_KEYS, DELIVERY_TRACKING_STAGES } from '../../constants';
import { DeliveryTrackingStage } from '../../enums';
import type { DeliveryTracking } from '../../types';
import { useDeliveryTrackingDetailQuery } from '../api';

interface TrackingDetailDialogProps {
  rowData: DeliveryTracking | null;
  onClose: () => void;
}

const STAGE_ICON: Record<DeliveryTrackingStage, ReactNode> = {
  [DeliveryTrackingStage.PICKUP]: <Package className='size-4' />,
  [DeliveryTrackingStage.IN_TRANSIT]: <Truck className='size-4' />,
  [DeliveryTrackingStage.DELIVERED]: <CheckCircle2 className='size-4' />,
};

const STAGE_BANNER_CLASSES: Record<DeliveryTrackingStage, string> = {
  [DeliveryTrackingStage.PICKUP]: 'from-sky-500 to-sky-400',
  [DeliveryTrackingStage.IN_TRANSIT]: 'from-amber-500 to-amber-400',
  [DeliveryTrackingStage.DELIVERED]: 'from-emerald-500 to-emerald-400',
};

const STAGE_CURRENT_DOT_CLASSES: Record<DeliveryTrackingStage, string> = {
  [DeliveryTrackingStage.PICKUP]: 'border-sky-500 bg-sky-500 text-white',
  [DeliveryTrackingStage.IN_TRANSIT]: 'border-amber-500 bg-amber-500 text-white',
  [DeliveryTrackingStage.DELIVERED]: 'border-emerald-500 bg-emerald-500 text-white',
};

const STAGE_CURRENT_LABEL_CLASSES: Record<DeliveryTrackingStage, string> = {
  [DeliveryTrackingStage.PICKUP]: 'text-sky-600',
  [DeliveryTrackingStage.IN_TRANSIT]: 'text-amber-600',
  [DeliveryTrackingStage.DELIVERED]: 'text-emerald-600',
};

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className='rounded-lg border bg-white p-4 shadow-sm'>
      <div className='mb-3 flex items-center gap-2'>
        <div className='bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-md'>{icon}</div>
        <h4 className='text-sm font-semibold'>{title}</h4>
      </div>
      <div className='space-y-2'>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-3'>
      <span className='text-muted-foreground text-xs'>{label}</span>
      <span className='text-right text-sm font-medium'>{value || '-'}</span>
    </div>
  );
}

export function TrackingDetailDialog({ rowData, onClose }: TrackingDetailDialogProps) {
  const { t } = useTranslation();
  const { data: detailData, isLoading: isDetailLoading } = useDeliveryTrackingDetailQuery(rowData?.invoice_number ?? '');
  const detail = detailData?.data.delivery_tracking;

  const currentStageIndex = rowData ? DELIVERY_TRACKING_STAGES.indexOf(rowData.delivery_status) : 0;

  return (
    <Dialog open={Boolean(rowData)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{t('page.delivery.tracking.detail_title')}</DialogTitle>
          <DialogDescription>{t('page.delivery.tracking.detail_description')}</DialogDescription>
        </DialogHeader>

        {rowData ? (
          <div className='max-h-[70vh] space-y-4 overflow-y-auto pr-1'>
            <div
              className={cn(
                'flex items-center justify-between rounded-lg bg-linear-to-r p-4 text-white',
                STAGE_BANNER_CLASSES[rowData.delivery_status],
              )}
            >
              <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-full bg-white/20'>{STAGE_ICON[rowData.delivery_status]}</div>
                <div>
                  <p className='text-sm text-white/80'>{rowData.courier_name}</p>
                  <p className='text-lg font-semibold'>{rowData.invoice_number}</p>
                </div>
              </div>
              <Badge
                variant='outline'
                className={cn('border-white/40 bg-white/15 text-white', DELIVERY_STAGE_BADGE_CLASSES[rowData.delivery_status])}
              >
                {t(DELIVERY_STAGE_TRANSLATION_KEYS[rowData.delivery_status])}
              </Badge>
            </div>

            <div className='rounded-lg border bg-gray-50/60 p-5'>
              <div className='flex items-start'>
                {DELIVERY_TRACKING_STAGES.map((stage, index) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;

                  return (
                    <div key={stage} className={cn('flex items-start', index < DELIVERY_TRACKING_STAGES.length - 1 && 'flex-1')}>
                      <div className='flex flex-col items-center gap-2'>
                        <div
                          className={cn(
                            'flex size-9 items-center justify-center rounded-full border-2 bg-white transition-colors',
                            isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                            isCurrent && `${STAGE_CURRENT_DOT_CLASSES[stage]} shadow-sm`,
                            !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground',
                          )}
                        >
                          {isCompleted ? <CheckCircle2 className='size-4' /> : STAGE_ICON[stage]}
                        </div>
                        <span
                          className={cn(
                            'text-center text-xs font-medium whitespace-nowrap',
                            isCompleted && 'text-emerald-600',
                            isCurrent && STAGE_CURRENT_LABEL_CLASSES[stage],
                            !isCompleted && !isCurrent && 'text-muted-foreground',
                          )}
                        >
                          {t(DELIVERY_STAGE_TRANSLATION_KEYS[stage])}
                        </span>
                      </div>

                      {index < DELIVERY_TRACKING_STAGES.length - 1 ? (
                        <div className='mt-4.5 flex-1 px-2'>
                          <div className={cn('h-0.5 rounded', index < currentStageIndex ? 'bg-emerald-400' : 'border-t-2 border-dashed')} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              <InfoCard icon={<ClipboardList className='size-4' />} title={t('page.delivery.tracking.order_info')}>
                <InfoRow label={t('page.delivery.tracking.fields.order_number')} value={rowData.order_number} />
                <InfoRow label={t('page.delivery.tracking.fields.customer_name')} value={rowData.customer_name} />
              </InfoCard>

              <InfoCard icon={<ShoppingBag className='size-4' />} title={t('page.delivery.tracking.product_info')}>
                <InfoRow label={t('page.delivery.tracking.fields.product_name')} value={rowData.product_name} />
                <InfoRow label={t('page.delivery.tracking.fields.quantity')} value={rowData.quantity.toLocaleString()} />
              </InfoCard>

              <div className='md:col-span-2'>
                <InfoCard icon={<Truck className='size-4' />} title={t('page.delivery.tracking.shipping_info')}>
                  {isDetailLoading ? (
                    <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                      <Loader2 className='size-4 animate-spin' />
                      {t('common.message.loading')}
                    </div>
                  ) : (
                    <div className='grid gap-2 md:grid-cols-3'>
                      <InfoRow label={t('page.delivery.tracking.fields.courier_name')} value={detail?.courier_service ?? rowData.courier_name} />
                      <InfoRow label={t('page.delivery.tracking.fields.waybill_registered_at')} value={rowData.waybill_registered_at} />
                      <InfoRow label={t('page.delivery.tracking.fields.tracking_info')} value={detail?.tracking_info?.carrier} />
                      <InfoRow label={t('page.delivery.tracking.current_location')} value={detail?.tracking_info?.location} />
                      <InfoRow label={t('page.delivery.tracking.estimated_delivery_date')} value={detail?.tracking_info?.estimated_delivery} />
                    </div>
                  )}
                </InfoCard>
              </div>
            </div>

            {!isDetailLoading && detail?.real_time_location ? (
              <div className='flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-blue-800'>
                <MapPin className='size-4 shrink-0' />
                <div>
                  <p className='text-xs font-medium text-blue-600'>{t('page.delivery.tracking.current_location')}</p>
                  <p className='text-sm font-semibold'>{detail.real_time_location}</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
