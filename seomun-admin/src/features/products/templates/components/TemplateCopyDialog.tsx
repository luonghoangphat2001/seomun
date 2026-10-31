import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppCheckboxFormField, AppInputFormField } from '@/components/shared/form-fields';

import { useTemplateCopyPreviewQuery } from '../api';

type TemplateCopyDialogProps = {
  templateId: number | null;
  isCopying: boolean;
  onClose: () => void;
  onConfirm: (payload: { copy_title: string; copy_layers: boolean }) => void;
};

type CopyForm = {
  copy_title: string;
  copy_layers: boolean;
};

export function TemplateCopyDialog({ templateId, isCopying, onClose, onConfirm }: TemplateCopyDialogProps) {
  const { t } = useTranslation('page');

  const isOpen = templateId !== null;
  const { data: response, isLoading, isError } = useTemplateCopyPreviewQuery(templateId);
  const preview = response?.data;

  const { control, handleSubmit, reset } = useForm<CopyForm>({
    defaultValues: { copy_title: '', copy_layers: true },
  });

  useEffect(() => {
    if (preview) {
      reset({ copy_title: preview.default_copy_title, copy_layers: preview.default_copy_layers });
    }
  }, [preview, reset]);

  const handleConfirm = handleSubmit((values) => onConfirm(values));

  return (
    <AppDialogModal
      isOpen={isOpen}
      setIsOpen={(open) => {
        if (!open) onClose();
      }}
      title={t('products.templates.list.copy_dialog.title', 'Copy Template')}
      footer={
        <>
          <AppButton variant='outline' onClick={onClose} disabled={isCopying}>
            {t('products.templates.list.copy_dialog.cancel', 'Cancel')}
          </AppButton>
          <AppButton onClick={() => void handleConfirm()} isLoading={isCopying} disabled={isLoading || isError || !preview}>
            {t('products.templates.list.copy_dialog.confirm', 'Copy')}
          </AppButton>
        </>
      }
    >
      {isLoading ? (
        <div className='flex h-24 items-center justify-center'>
          <Loader2 className='text-muted-foreground size-5 animate-spin' />
        </div>
      ) : isError || !preview ? (
        <p className='text-destructive text-sm'>{t('products.templates.list.copy_dialog.load_error', 'Failed to load copy preview.')}</p>
      ) : (
        <div className='space-y-4'>
          <div className='bg-muted/30 space-y-1 rounded-lg border p-3 text-sm'>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>{t('products.templates.list.copy_dialog.template_no', 'Template No.')}</span>
              <span className='font-medium'>{preview.template_no}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>{t('products.templates.list.copy_dialog.original_title', 'Original Title')}</span>
              <span className='font-medium'>{preview.title}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>{t('products.templates.list.copy_dialog.customer', 'Customer')}</span>
              <span className='font-medium'>{preview.customer ?? '-'}</span>
            </div>
          </div>

          <AppInputFormField
            name='copy_title'
            control={control}
            label={t('products.templates.list.copy_dialog.new_title', 'New Title')}
            id='template-copy-title'
            rules={{ required: t('products.templates.list.copy_dialog.new_title_required', 'Title is required') }}
          />

          <AppCheckboxFormField
            name='copy_layers'
            control={control}
            label={t('products.templates.list.copy_dialog.copy_layers', 'Copy layers')}
            id='template-copy-layers'
          />
        </div>
      )}
    </AppDialogModal>
  );
}
