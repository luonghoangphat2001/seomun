import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppInputFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import type { Shipment } from '../../types';

// === Type definitions ===

type ShipmentTrackingNumberDialogProps = {
  shipment: Shipment | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: TrackingNumberForm) => void;
};

export type TrackingNumberForm = {
  tracking_number: string;
};

// === Component ===

export function ShipmentTrackingNumberDialog({ shipment, isSaving, onClose, onSave }: ShipmentTrackingNumberDialogProps) {
  const { t } = useTranslation('page');

  // === Hooks ===

  const { control, handleSubmit, reset } = useForm<TrackingNumberForm>({
    defaultValues: { tracking_number: '' },
  });

  // === Functions ===

  const handleSave = handleSubmit((values) => {
    onSave({ tracking_number: values.tracking_number.trim() });
  });

  // === Effects ===

  useEffect(() => {
    if (shipment) reset({ tracking_number: shipment.tracking_number ?? '' });
  }, [shipment, reset]);

  // === JSX return ===

  const footer = (
    <div className='flex justify-end gap-2'>
      <Button variant='outline' onClick={onClose} disabled={isSaving}>
        {t('delivery.shipments.tracking_dialog.cancel')}
      </Button>
      <Button onClick={() => void handleSave()} disabled={isSaving}>
        {isSaving && <Loader2 className='mr-2 size-4 animate-spin' />}
        {t('delivery.shipments.tracking_dialog.confirm')}
      </Button>
    </div>
  );

  return (
    <AppDialogModal isOpen={shipment !== null} setIsOpen={onClose} title={t('delivery.shipments.tracking_dialog.title')} width={480} footer={footer}>
      <div className='space-y-4'>
        <p className='text-muted-foreground text-sm'>
          {t('delivery.shipments.tracking_dialog.description', { orderNumber: shipment?.order_number ?? '' })}
        </p>

        <AppInputFormField
          control={control}
          name='tracking_number'
          label={t('delivery.shipments.fields.tracking_number')}
          required
          rules={{ required: t('delivery.shipments.tracking_dialog.tracking_number_required') }}
        />
      </div>
    </AppDialogModal>
  );
}
