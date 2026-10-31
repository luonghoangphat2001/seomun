import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createInternalMemoSchema, type InternalMemoFormValues } from '../../schemas';

type InternalMemoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onSubmit: (values: InternalMemoFormValues) => void;
};

export function InternalMemoDialog({ open, onOpenChange, isLoading, onSubmit }: InternalMemoDialogProps) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const { t: tValidationRaw } = useTranslation('validation');
  const tValidation = tValidationRaw as (key: string, options?: Record<string, unknown>) => string;

  const form = useForm<InternalMemoFormValues>({ resolver: zodResolver(createInternalMemoSchema(t, tValidation)), defaultValues: { content: '' } });

  const submit = (values: InternalMemoFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('page.inquiries.dialog.internal_memo.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(submit)} className='space-y-4'>
          <AppTextareaFormField
            name='content'
            control={form.control}
            label={t('form.inquiries.fields.internal_memo.label')}
            placeholder={t('form.inquiries.fields.internal_memo.placeholder')}
            rows={5}
            required
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common.action.cancel')}
            </Button>
            <Button type='submit' disabled={isLoading}>
              {t('page.inquiries.actions.save_memo')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
