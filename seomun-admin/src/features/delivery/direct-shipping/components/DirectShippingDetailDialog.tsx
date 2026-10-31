import { CheckCircle2, ClipboardList, MapPin, Paperclip, RotateCcw, User, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { downloadFileFromUrl } from '@/utils/download-file';
import { formatKoreanDateTime } from '@/utils/format-date';
import { formatPhoneNumber } from '@/utils/format-phone';

import { DIRECT_SHIPPING_NAME_TRANSLATION_KEYS, DIRECT_SHIPPING_STATUS_BADGE_CLASSES, DIRECT_SHIPPING_STATUS_TRANSLATION_KEYS } from '../constants';
import { DirectShippingStatus } from '../enums';
import type { DirectShipping } from '../types';
import { useDirectShippingDetailQuery } from '../api';

// === Type definitions ===

interface DirectShippingDetailDialogProps {
  row: DirectShipping | null;
  isUpdating: boolean;
  onClose: () => void;
  onChangeStatus: (id: number, status: DirectShippingStatus) => void;
}

// === Components ===

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
      <span className='text-muted-foreground text-xs whitespace-nowrap'>{label}</span>
      <span className='text-right text-sm font-medium'>{value || '-'}</span>
    </div>
  );
}

export function DirectShippingDetailDialog({ row, isUpdating, onClose, onChangeStatus }: DirectShippingDetailDialogProps) {
  const { t } = useTranslation();
  const detailQuery = useDirectShippingDetailQuery(row?.id ?? null);
  const item = detailQuery.data?.data.item ?? row;

  const fullAddress = item ? [item.postcode ? `[${item.postcode}]` : '', item.address, item.detailed_address].filter(Boolean).join(' ') : '';

  return (
    <Dialog open={Boolean(row)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('page.delivery.direct_shipping.detail.title')}</DialogTitle>
          <DialogDescription>{t('page.delivery.direct_shipping.detail.description')}</DialogDescription>
        </DialogHeader>

        {item ? (
          <div className='max-h-[65vh] space-y-4 overflow-y-auto pr-1'>
            <div className='flex items-center justify-between rounded-lg border bg-gray-50/60 px-4 py-3'>
              <div>
                <p className='text-lg font-semibold'>{item.recipient_name}</p>
                <p className='text-muted-foreground text-xs'>{formatKoreanDateTime(item.created_at)}</p>
              </div>
              <Badge variant='outline' className={DIRECT_SHIPPING_STATUS_BADGE_CLASSES[item.status]}>
                {t(DIRECT_SHIPPING_STATUS_TRANSLATION_KEYS[item.status])}
              </Badge>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              <InfoCard icon={<User className='size-4' />} title={t('page.delivery.direct_shipping.detail.requester_info')}>
                <InfoRow label={t('page.delivery.direct_shipping.fields.requester')} value={item.user?.name} />
                <InfoRow label='ID' value={item.user?.username} />
                <InfoRow label='Email' value={item.user?.email} />
                <InfoRow label={t('page.delivery.direct_shipping.fields.company_name')} value={item.user?.customer?.company_name} />
              </InfoCard>

              <InfoCard icon={<MapPin className='size-4' />} title={t('page.delivery.direct_shipping.detail.recipient_info')}>
                <InfoRow label={t('page.delivery.direct_shipping.fields.recipient_name')} value={item.recipient_name} />
                <InfoRow label={t('page.delivery.direct_shipping.fields.phone')} value={formatPhoneNumber(item.phone)} />
                <InfoRow
                  label={t('page.delivery.direct_shipping.fields.shipping_name')}
                  value={t(DIRECT_SHIPPING_NAME_TRANSLATION_KEYS[item.shipping_name])}
                />
              </InfoCard>

              <div className='md:col-span-2'>
                <InfoCard icon={<ClipboardList className='size-4' />} title={t('page.delivery.direct_shipping.detail.request_info')}>
                  <InfoRow label={t('page.delivery.direct_shipping.fields.address')} value={fullAddress} />
                  <InfoRow label={t('page.delivery.direct_shipping.fields.storage_location')} value={item.storage_location} />
                  <InfoRow label={t('page.delivery.direct_shipping.fields.detail_request')} value={item.detail_request} />
                  <InfoRow
                    label={t('page.delivery.direct_shipping.fields.amount')}
                    value={item.amount ? `${item.amount.toLocaleString()} 원` : '-'}
                  />
                  {item.file_url || item.file_name ? (
                    <InfoRow
                      label={t('page.delivery.direct_shipping.fields.attachment')}
                      value={
                        item.file_url ? (
                          <button
                            type='button'
                            onClick={() => item.file_url && downloadFileFromUrl(item.file_url, item.file_name ?? item.file_url)}
                            className='text-primary inline-flex cursor-pointer items-center gap-1 hover:underline'
                          >
                            <Paperclip className='size-3.5' />
                            {item.file_name ?? item.file_url}
                          </button>
                        ) : (
                          <span className='inline-flex items-center gap-1'>
                            <Paperclip className='size-3.5' />
                            {item.file_name}
                          </span>
                        )
                      }
                    />
                  ) : null}
                </InfoCard>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className='gap-2 sm:justify-between'>
          <Button
            type='button'
            variant='outline'
            className='gap-1.5'
            disabled={!item || isUpdating || item.status === DirectShippingStatus.PENDING}
            onClick={() => item && onChangeStatus(item.id, DirectShippingStatus.PENDING)}
          >
            <RotateCcw className='size-4' />
            {t('page.delivery.direct_shipping.actions.revert')}
          </Button>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='destructive'
              className='gap-1.5'
              disabled={!item || isUpdating || item.status === DirectShippingStatus.CANCELLED}
              onClick={() => item && onChangeStatus(item.id, DirectShippingStatus.CANCELLED)}
            >
              <XCircle className='size-4' />
              {t('page.delivery.direct_shipping.actions.reject')}
            </Button>
            <Button
              type='button'
              className='gap-1.5'
              disabled={!item || isUpdating || item.status === DirectShippingStatus.CONFIRMED}
              onClick={() => item && onChangeStatus(item.id, DirectShippingStatus.CONFIRMED)}
            >
              <CheckCircle2 className='size-4' />
              {t('page.delivery.direct_shipping.actions.approve')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
