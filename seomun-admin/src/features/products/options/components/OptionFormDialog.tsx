import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppFormField, AppInputFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { AppSingleImageUpload } from '@/components/shared/app-single-image-upload';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileType } from '@/enums';
import { useUploadFileMutation } from '@/features/system-content/images';
import { getApiErrorMessage } from '@/utils/api-error';

import type { ErpOptionRESP } from '../api/option.response';
import { useCreateErpOptionMutation, useUpdateErpOptionMutation } from '../api/option.query';
import { blockNonPositiveNumericKeys, NO_SPIN_INPUT_CLASS } from '../constants/option.constants';
import { ErpOptionGroupCode } from '../enums';
import { getOptionFormDefaults, optionFormSchema, type OptionFormValues } from '../schemas/option-form.schema';

// ponytail: group id hardcoded as the API exposes no flag for "this group holds a gram value"
const PAPER_WEIGHT_GROUP_ID = 4;

type OptionFormDialogProps = {
  isOpen: boolean;
  groupId: number;
  groupCode?: string;
  editOption?: ErpOptionRESP;
  onClose: () => void;
};

export function OptionFormDialog({ isOpen, groupId, groupCode, editOption, onClose }: OptionFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = editOption !== undefined;
  const isPaperTypeGroup = groupCode === ErpOptionGroupCode.PAPER_TYPE;
  const isPaperWeightGroup = groupId === PAPER_WEIGHT_GROUP_ID;

  const { control, handleSubmit, reset } = useForm<OptionFormValues>({
    resolver: zodResolver(optionFormSchema),
    defaultValues: getOptionFormDefaults(),
  });

  const uploadImageMutation = useUploadFileMutation(FileType.PAPER_OPTIONS);

  const createMutation = useCreateErpOptionMutation({
    onSuccess: () => {
      toast.success(t('page.products.options.option_dialog.create_success'));
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('page.products.options.option_dialog.create_error'))),
  });

  const updateMutation = useUpdateErpOptionMutation(editOption?.id ?? 0, {
    onSuccess: () => {
      toast.success(t('page.products.options.option_dialog.update_success'));
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('page.products.options.option_dialog.update_error'))),
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(getOptionFormDefaults(editOption));
  }, [isOpen, editOption, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleUploadImage = async (file: File) => {
    const uploadedFile = await uploadImageMutation.mutateAsync(file);
    return uploadedFile.url;
  };

  const onSubmit = (values: OptionFormValues) => {
    const payload = {
      code: values.code,
      label: values.label,
      ...(isPaperWeightGroup ? { value: values.value } : {}),
      ...(isPaperTypeGroup ? { attributes: { image: values.image || undefined, description: values.description || undefined } } : {}),
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate({ ...payload, erp_option_group_id: groupId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('page.products.options.option_dialog.edit_title') : t('page.products.options.option_dialog.create_title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
          <AppInputFormField name='code' control={control} label={t('page.products.options.option_dialog.code')} required disabled={isEdit} />

          <AppInputFormField name='label' control={control} label={t('page.products.options.option_dialog.label')} required />

          {isPaperWeightGroup ? (
            <AppInputFormField
              name='value'
              control={control}
              label={t('page.products.options.option_dialog.value')}
              type='number'
              min={0}
              suffix='g'
              onKeyDown={blockNonPositiveNumericKeys}
              inputClassName={NO_SPIN_INPUT_CLASS}
            />
          ) : null}

          {isPaperTypeGroup ? (
            <>
              <AppTextareaFormField name='description' control={control} label={t('page.products.options.option_dialog.description')} />

              <Controller
                control={control}
                name='image'
                render={({ field, fieldState: { error } }) => (
                  <AppFormField label={t('page.products.options.option_dialog.image')} error={error?.message}>
                    {() => (
                      <AppSingleImageUpload
                        label={t('page.products.options.option_dialog.image')}
                        value={field.value}
                        onChange={(value) => field.onChange(typeof value === 'string' ? value : '')}
                        onUpload={handleUploadImage}
                        isUploading={uploadImageMutation.isPending}
                      />
                    )}
                  </AppFormField>
                )}
              />
            </>
          ) : null}

          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
              {t('common.action.cancel')}
            </Button>
            <AppButton type='submit' isLoading={isPending}>
              {t('common.action.save')}
            </AppButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
