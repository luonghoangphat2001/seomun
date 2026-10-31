import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApiErrorMessage } from '@/utils/api-error';

import { useCreatePaperMutation, useErpOptionValuesByGroupCodeQuery, useUpdatePaperMutation } from '../api/option.query';
import type { Paper } from '../api/option.response';
import { blockNonPositiveNumericKeys, getPaperCategoryOptions, getPaperStatusOptions, NO_SPIN_INPUT_CLASS } from '../constants/option.constants';
import { ErpOptionGroupCode } from '../enums';
import { getPaperFormDefaults, paperFormSchema, type PaperFormValues } from '../schemas/paper-form.schema';

type PaperFormDialogProps = {
  isOpen: boolean;
  editPaper?: Paper;
  onClose: () => void;
};

export function PaperFormDialog({ isOpen, editPaper, onClose }: PaperFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = editPaper !== undefined;

  const { control, handleSubmit, reset } = useForm<PaperFormValues>({
    resolver: zodResolver(paperFormSchema),
    defaultValues: getPaperFormDefaults(),
  });

  const { data: paperTypeOptions } = useErpOptionValuesByGroupCodeQuery(ErpOptionGroupCode.PAPER_TYPE);
  const { data: paperColorOptions } = useErpOptionValuesByGroupCodeQuery(ErpOptionGroupCode.PAPER_COLOR);
  const { data: paperWeightOptions } = useErpOptionValuesByGroupCodeQuery(ErpOptionGroupCode.PAPER_WEIGHT);

  const createMutation = useCreatePaperMutation({
    onSuccess: () => {
      toast.success(t('page.products.options.paper_dialog.create_success'));
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('page.products.options.paper_dialog.create_error'))),
  });

  const updateMutation = useUpdatePaperMutation(editPaper?.id ?? 0, {
    onSuccess: () => {
      toast.success(t('page.products.options.paper_dialog.update_success'));
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('page.products.options.paper_dialog.update_error'))),
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(getPaperFormDefaults(editPaper));
  }, [isOpen, editPaper, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: PaperFormValues) => {
    const payload = {
      category: values.category,
      name: values.name,
      is_active: values.is_active,
      specification: { thickness_mm: Number(values.thickness_mm) },
      paper_type_option_value_id: Number(values.paper_type_option_value_id),
      paper_color_option_value_id: Number(values.paper_color_option_value_id),
      paper_weight_option_value_id: Number(values.paper_weight_option_value_id),
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('page.products.options.paper_dialog.edit_title') : t('page.products.options.paper_dialog.create_title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
          <div className='grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2'>
            <AppSelectFormField
              name='category'
              control={control}
              label={t('page.products.options.paper_dialog.category')}
              placeholder={t('page.products.options.paper_dialog.category_placeholder')}
              options={getPaperCategoryOptions(t)}
              clearable={false}
              required
            />

            <AppInputFormField name='name' control={control} label={t('page.products.options.paper_dialog.name')} required />

            <AppInputFormField
              name='thickness_mm'
              control={control}
              label={t('page.products.options.paper_dialog.thickness_mm')}
              type='number'
              min={0}
              required
              onKeyDown={blockNonPositiveNumericKeys}
              inputClassName={NO_SPIN_INPUT_CLASS}
            />

            <AppSelectFormField
              name='paper_type_option_value_id'
              control={control}
              label={t('page.products.options.paper_dialog.paper_type')}
              placeholder={t('page.products.options.paper_dialog.paper_type_placeholder')}
              options={paperTypeOptions.map((option) => ({ value: String(option.id), label: option.label }))}
              clearable={false}
              required
            />

            <AppSelectFormField
              name='paper_color_option_value_id'
              control={control}
              label={t('page.products.options.paper_dialog.paper_color')}
              placeholder={t('page.products.options.paper_dialog.paper_color_placeholder')}
              options={paperColorOptions.map((option) => ({ value: String(option.id), label: option.label }))}
              clearable={false}
              required
            />

            <AppSelectFormField
              name='paper_weight_option_value_id'
              control={control}
              label={t('page.products.options.paper_dialog.paper_weight')}
              placeholder={t('page.products.options.paper_dialog.paper_weight_placeholder')}
              options={paperWeightOptions.map((option) => ({ value: String(option.id), label: option.label }))}
              clearable={false}
              required
            />

            <AppSelectFormField
              name='is_active'
              control={control}
              label={t('page.products.options.paper_dialog.is_active')}
              placeholder={t('page.products.options.paper_dialog.is_active_placeholder')}
              options={getPaperStatusOptions(t)}
              clearable={false}
              required
            />
          </div>

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
