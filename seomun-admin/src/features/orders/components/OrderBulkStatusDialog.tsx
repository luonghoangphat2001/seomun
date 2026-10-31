import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppSelect } from '@/components/shared/app-select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { getOrderStatusOptions } from '../constants';
import type { OrderStatus } from '../enums';

interface OrderBulkStatusDialogProps {
  isOpen: boolean;
  count: number;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (status: OrderStatus, reason: string) => void;
}

export function OrderBulkStatusDialog({ isOpen, count, isPending, onClose, onConfirm }: OrderBulkStatusDialogProps) {
  const { t } = useTranslation('page');

  // === State ===

  const [status, setStatus] = useState<OrderStatus>();
  const [reason, setReason] = useState('');

  // === Variables ===

  const trimmedReason = reason.trim();
  const canSubmit = !!status && !!trimmedReason;

  // === Functions ===

  function handleConfirm() {
    if (!status || !trimmedReason) return;
    onConfirm(status, trimmedReason);
  }

  const footer = (
    <div className='flex justify-end gap-2'>
      <Button variant='outline' className='h-10' onClick={onClose} disabled={isPending}>
        {t('orders.list.bulk_status.cancel')}
      </Button>
      <Button className='h-10' onClick={handleConfirm} disabled={!canSubmit || isPending}>
        {isPending ? <Loader2 className='mr-2 size-4 animate-spin' /> : null}
        {t('orders.list.bulk_status.confirm')}
      </Button>
    </div>
  );

  return (
    <AppDialogModal isOpen={isOpen} setIsOpen={(open) => !open && onClose()} title={t('orders.list.bulk_status.title')} width={460} footer={footer}>
      <div className='space-y-4'>
        <p className='text-muted-foreground text-sm'>{t('orders.list.bulk_status.description', { count })}</p>

        <div className='space-y-2'>
          <Label htmlFor='bulk-status'>
            {t('orders.list.bulk_status.status')} <span className='text-destructive'>*</span>
          </Label>
          <AppSelect
            id='bulk-status'
            options={getOrderStatusOptions(t)}
            value={status}
            onValueChange={setStatus}
            placeholder={t('orders.list.bulk_status.status_placeholder')}
            className='w-full'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='bulk-status-reason'>
            {t('orders.list.bulk_status.reason')} <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='bulk-status-reason'
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t('orders.list.bulk_status.reason_placeholder')}
            rows={3}
          />
        </div>
      </div>
    </AppDialogModal>
  );
}
