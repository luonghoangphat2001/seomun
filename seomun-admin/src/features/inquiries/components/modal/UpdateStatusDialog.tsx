import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppRadioGroupFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getInquiryStatusLabel, getStatusTransitionOptions } from '../../constants';
import type { InquiryStatus } from '../../enums';
import { createUpdateStatusSchema, type UpdateStatusFormValues } from '../../schemas';

type UpdateStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus?: InquiryStatus;
  isLoading?: boolean;
  onSubmit: (values: UpdateStatusFormValues) => void;
};

export function UpdateStatusDialog({ open, onOpenChange, currentStatus, isLoading, onSubmit }: UpdateStatusDialogProps) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const { t: tValidationRaw } = useTranslation('validation');
  const tValidation = tValidationRaw as (key: string, options?: Record<string, unknown>) => string;

  const [pendingValues, setPendingValues] = useState<UpdateStatusFormValues | null>(null);

  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(createUpdateStatusSchema(t, tValidation)),
    defaultValues: { status: currentStatus, note: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ status: currentStatus, note: '' });
      setPendingValues(null);
    }
  }, [currentStatus, form, open]);

  const handleFormSubmit = (values: UpdateStatusFormValues) => {
    setPendingValues(values);
  };

  const handleConfirm = () => {
    if (pendingValues) {
      onSubmit(pendingValues);
    }
  };

  const handleCancelConfirm = () => {
    setPendingValues(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('page.inquiries.dialog.change_status.title')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-4'>
            <AppRadioGroupFormField
              name='status'
              control={form.control}
              label={t('form.inquiries.fields.status.label')}
              options={getStatusTransitionOptions(t, currentStatus)}
              required
            />
            <AppTextareaFormField
              name='note'
              control={form.control}
              label={t('form.inquiries.fields.change_reason.label')}
              placeholder={t('form.inquiries.fields.change_reason.placeholder')}
              rows={4}
            />
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
                {t('common.action.cancel')}
              </Button>
              <Button type='submit' disabled={isLoading || form.watch('status') === currentStatus}>
                {t('page.inquiries.actions.update_status')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingValues !== null} onOpenChange={(next) => !next && handleCancelConfirm()}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='size-5 text-amber-500' />
              {t('page.inquiries.dialog.change_status.confirm_title')}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-2 text-sm'>
            <p>
              {t('page.inquiries.dialog.change_status.confirm_message', {
                from: currentStatus ? getInquiryStatusLabel(t, currentStatus) : '-',
                to: pendingValues ? getInquiryStatusLabel(t, pendingValues.status) : '-',
              })}
            </p>
            <p className='text-muted-foreground'>{t('page.inquiries.dialog.change_status.confirm_warning')}</p>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleCancelConfirm} disabled={isLoading}>
              {t('common.action.cancel')}
            </Button>
            <Button type='button' onClick={handleConfirm} disabled={isLoading}>
              {t('common.action.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
