'use client';

import { useResubmitFileMutation } from '@/apis/my/order/order.query';
import { FileItem } from '@/components/common';
import { FormTextarea, FormUpload } from '@/components/form';
import { ALLOWED_DESIGN_FILE_ACCEPT, isAllowedDesignFile, UNSUPPORTED_DESIGN_FILE_MESSAGE } from '@/constants/common';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export const MODIFY_FILE_FORM_ID = 'modify-file-form';

type ModifyFileFormValues = {
  note: string;
  files: FileItem[];
};

type ModifyFileFormProps = {
  orderNumber?: string;
  orderItemId?: number;
  onSuccess: () => void;
  onPendingChange: (isPending: boolean) => void;
};

const modifyFileDefaultValues: ModifyFileFormValues = {
  note: '',
  files: [],
};

const ModifyFileForm = ({ orderNumber, orderItemId, onSuccess, onPendingChange }: ModifyFileFormProps) => {
  const t = useTranslations();
  const { control, handleSubmit, setError } = useForm<ModifyFileFormValues>({
    mode: 'all',
    defaultValues: modifyFileDefaultValues,
  });
  const { mutate: resubmitFile, isPending } = useResubmitFileMutation();

  useEffect(() => {
    onPendingChange(isPending);
  }, [isPending, onPendingChange]);

  const onSubmit = handleSubmit((input) => {
    if (isPending) return;

    const file = input.files[0]?.file;

    if (!input.note.trim()) {
      setError('note', { message: t('validation.required', { field: t('common.revision_request') }) });
      return;
    }

    if (!file) {
      setError('files', { message: t('validation.required', { field: t('common.attachment') }) });
      return;
    }

    if (!isAllowedDesignFile(file)) {
      setError('files', { message: UNSUPPORTED_DESIGN_FILE_MESSAGE });
      return;
    }

    if (!orderNumber || !orderItemId) return;

    resubmitFile(
      { orderNumber, order_item_id: orderItemId, file, note: input.note.trim() },
      {
        onSuccess: () => {
          toast.success(t('common.success_create'));
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.response?.data.message ?? t('common.fail_create'));
        },
      },
    );
  });

  return (
    <form
      id={MODIFY_FILE_FORM_ID}
      onSubmit={onSubmit}
      className={cn('border-border-soft max-h-111 space-y-4 overflow-auto border-y px-4 py-6 max-md:border-none md:px-10')}>
      <FormTextarea
        control={control}
        name='note'
        label={t('common.revision_request')}
        labelPlacement='top'
        required
        disabled={isPending}
        placeholder={t('placeholder.enter_description')}
        rows={8}
      />

      <div className='space-y-2'>
        <label className='body-16 block'>{t('common.attachment')}</label>
        <FormUpload
          control={control}
          name='files'
          labelButton={t('auth.upload')}
          multiple={false}
          maxFiles={1}
          accept={ALLOWED_DESIGN_FILE_ACCEPT}
          disabled={isPending}
        />

        <p className='body-14 text-text-secondary'>{t('common.file_modification_note')}</p>
      </div>
    </form>
  );
};

export default ModifyFileForm;
