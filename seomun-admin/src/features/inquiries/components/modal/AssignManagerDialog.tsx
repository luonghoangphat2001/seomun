import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createAssignManagerSchema, type AssignManagerFormValues } from '../../schemas';
import type { InquiryManagerOption } from '../../types';

type AssignManagerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  managers: InquiryManagerOption[];
  defaultPersonInCharge?: string;
  isLoading?: boolean;
  onSubmit: (values: AssignManagerFormValues) => void;
};

export function AssignManagerDialog({ open, onOpenChange, managers, defaultPersonInCharge, isLoading, onSubmit }: AssignManagerDialogProps) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const { t: tValidationRaw } = useTranslation('validation');
  const tValidation = tValidationRaw as (key: string, options?: Record<string, unknown>) => string;

  const form = useForm<AssignManagerFormValues>({
    resolver: zodResolver(createAssignManagerSchema(t, tValidation)),
    defaultValues: { assigned_to: defaultPersonInCharge ?? '', note: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ assigned_to: defaultPersonInCharge ?? '', note: '' });
    }
  }, [defaultPersonInCharge, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('page.inquiries.dialog.assign_person.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <AppSelectFormField
            name='assigned_to'
            control={form.control}
            label={t('form.inquiries.fields.person_in_charge.label')}
            options={managers}
            placeholder={t('form.inquiries.fields.person_in_charge.placeholder')}
            searchable
            required
          />
          <AppTextareaFormField
            name='note'
            control={form.control}
            label={t('form.inquiries.fields.note.label')}
            placeholder={t('form.inquiries.fields.note.placeholder')}
            rows={4}
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common.action.cancel')}
            </Button>
            <Button type='submit' disabled={isLoading}>
              {t('common.action.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
