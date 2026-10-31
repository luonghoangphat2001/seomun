import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApiErrorMessage } from '@/utils/api-error';

import { useCreateSizeOptionMutation, useUpdateSizeOptionMutation } from '../api/option.query';
import type { SizeOption } from '../api/option.response';
import { blockNonPositiveNumericKeys, NO_SPIN_INPUT_CLASS } from '../constants/option.constants';
import {
  buildSizeOptionName,
  getSizeOptionFormDefaults,
  sizeOptionFormSchema,
  WORKING_SIZE_MARGIN_MM,
  type SizeOptionFormValues,
} from '../schemas/size-option-form.schema';

type SizeOptionFormDialogProps = {
  isOpen: boolean;
  editOption?: SizeOption;
  onClose: () => void;
};

export function SizeOptionFormDialog({ isOpen, editOption, onClose }: SizeOptionFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = editOption !== undefined;

  const { control, handleSubmit, reset, watch, setValue, formState } = useForm<SizeOptionFormValues>({
    resolver: zodResolver(sizeOptionFormSchema),
    defaultValues: getSizeOptionFormDefaults(),
  });

  const createMutation = useCreateSizeOptionMutation({
    onSuccess: () => {
      toast.success(t('page.products.options.size_dialog.create_success'));
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('page.products.options.size_dialog.create_error'))),
  });

  const updateMutation = useUpdateSizeOptionMutation(editOption?.id ?? 0, {
    onSuccess: () => {
      toast.success(t('page.products.options.size_dialog.update_success'));
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('page.products.options.size_dialog.update_error'))),
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(getSizeOptionFormDefaults(editOption));
  }, [isOpen, editOption, reset]);

  const cuttingWidth = watch('cutting_width');
  const cuttingHeight = watch('cutting_height');
  const hasValidSize = Boolean(cuttingWidth) && Boolean(cuttingHeight) && !isNaN(Number(cuttingWidth)) && !isNaN(Number(cuttingHeight));
  const workingWidth = hasValidSize ? Number(cuttingWidth) + WORKING_SIZE_MARGIN_MM : undefined;
  const workingHeight = hasValidSize ? Number(cuttingHeight) + WORKING_SIZE_MARGIN_MM : undefined;

  useEffect(() => {
    if (isEdit || !hasValidSize || formState.dirtyFields.name) return;
    setValue('name', buildSizeOptionName(cuttingWidth, cuttingHeight));
  }, [isEdit, cuttingWidth, cuttingHeight, hasValidSize, formState.dirtyFields.name, setValue]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: SizeOptionFormValues) => {
    const cuttingWidthValue = Number(values.cutting_width);
    const cuttingHeightValue = Number(values.cutting_height);
    const payload = {
      name: values.name,
      cutting_width: cuttingWidthValue,
      cutting_height: cuttingHeightValue,
      working_width: cuttingWidthValue + WORKING_SIZE_MARGIN_MM,
      working_height: cuttingHeightValue + WORKING_SIZE_MARGIN_MM,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('page.products.options.size_dialog.edit_title') : t('page.products.options.size_dialog.create_title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
          <AppInputFormField
            name='cutting_width'
            control={control}
            label={t('page.products.options.size_dialog.width')}
            type='number'
            min={0}
            required
            suffix='mm'
            onKeyDown={blockNonPositiveNumericKeys}
            inputClassName={NO_SPIN_INPUT_CLASS}
          />

          <AppInputFormField
            name='cutting_height'
            control={control}
            label={t('page.products.options.size_dialog.height')}
            type='number'
            min={0}
            required
            suffix='mm'
            onKeyDown={blockNonPositiveNumericKeys}
            inputClassName={NO_SPIN_INPUT_CLASS}
          />

          <AppInputFormField name='name' control={control} label={t('page.products.options.size_dialog.name')} required />

          {hasValidSize ? (
            <p className='text-muted-foreground text-xs whitespace-pre-line'>
              {t('page.products.options.size_dialog.working_size_note', { workingHeight, workingWidth })}
            </p>
          ) : null}

          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
              {t('common.action.cancel')}
            </Button>
            <AppButton type='submit' isLoading={isPending}>
              {isEdit ? t('common.action.edit') : t('common.action.save')}
            </AppButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
