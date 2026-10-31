import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField, AppSelectFormField, AppSwitchFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Paper } from '@/features/products/options';
import { getApiErrorMessage } from '@/utils/api-error';

import type { PaperPrice, PaperPriceSearchFilters } from '../../api';
import { useCreatePaperPriceMutation, useUpdatePaperPriceMutation } from '../../api';
import { localizePaperSizeDivisionOptions } from '../../constants';
import { createPaperPriceFormSchema, getPaperPriceFormDefaults, type PaperPriceFormValues } from '../../schemas/paper-price-form.schema';

const BLOCKED_NUMBER_KEYS = ['e', 'E', '+', '-'];

function blockInvalidNumberKeys(event: KeyboardEvent<HTMLInputElement>) {
  if (BLOCKED_NUMBER_KEYS.includes(event.key)) {
    event.preventDefault();
  }
}

type PaperPriceFormDialogProps = {
  isOpen: boolean;
  papers: Paper[];
  searchFilters: PaperPriceSearchFilters | undefined;
  editPaperPrice?: PaperPrice;
  onClose: () => void;
};

export function PaperPriceFormDialog({ isOpen, papers, searchFilters, editPaperPrice, onClose }: PaperPriceFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = editPaperPrice !== undefined;

  const paperOptions = useMemo(() => papers.map((paper) => ({ value: String(paper.id), label: paper.name })), [papers]);
  const sizeDivisionOptions = useMemo(
    () => localizePaperSizeDivisionOptions(t, searchFilters?.paper_size_division_code_options ?? []),
    [searchFilters, t],
  );

  const schema = useMemo(() => createPaperPriceFormSchema(t), [t]);

  const { control, handleSubmit, reset } = useForm<PaperPriceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getPaperPriceFormDefaults(),
  });

  const createMutation = useCreatePaperPriceMutation({
    onSuccess: () => {
      toast.success(t('page.products.unit_price_settings.paper_price.dialog.create_success', 'Paper price created successfully.'));
      onClose();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, t('page.products.unit_price_settings.paper_price.dialog.create_error', 'Failed to create paper price.'))),
  });

  const updateMutation = useUpdatePaperPriceMutation({
    onSuccess: () => {
      toast.success(t('page.products.unit_price_settings.paper_price.dialog.update_success', 'Paper price updated successfully.'));
      onClose();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, t('page.products.unit_price_settings.paper_price.dialog.update_error', 'Failed to update paper price.'))),
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editPaperPrice) {
      reset({
        paper_id: String(editPaperPrice.paper_id),
        paper_size_division_code: editPaperPrice.paper_size_division_code,
        supply_price: String(editPaperPrice.supply_price),
        cost: String(editPaperPrice.cost),
        is_hot_deal: editPaperPrice.is_hot_deal,
      });
    } else {
      reset(getPaperPriceFormDefaults());
    }
  }, [isOpen, editPaperPrice, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: PaperPriceFormValues) => {
    const payload = {
      paper_id: Number(values.paper_id),
      paper_size_division_code: values.paper_size_division_code,
      supply_price: Number(values.supply_price),
      cost: Number(values.cost),
      is_hot_deal: values.is_hot_deal,
    };

    if (isEdit) {
      updateMutation.mutate({ id: editPaperPrice.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('page.products.unit_price_settings.paper_price.dialog.edit_title', 'Edit paper price')
              : t('page.products.unit_price_settings.paper_price.dialog.create_title', 'Add paper price')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
          <AppSelectFormField
            name='paper_id'
            control={control}
            label={t('page.products.unit_price_settings.paper_price.dialog.paper', 'Paper')}
            options={paperOptions}
            placeholder={t('page.products.unit_price_settings.paper_price.dialog.paper_select_placeholder', 'Select paper')}
            searchable
            required
          />

          <AppSelectFormField
            name='paper_size_division_code'
            control={control}
            label={t('page.products.unit_price_settings.paper_price.dialog.paper_size', 'Paper size')}
            options={sizeDivisionOptions}
            placeholder={t('page.products.unit_price_settings.paper_price.dialog.paper_size_select_placeholder', 'Select paper size')}
            required
          />

          <div className='grid grid-cols-2 gap-4'>
            <AppInputFormField
              name='supply_price'
              control={control}
              label={t('page.products.unit_price_settings.paper_price.dialog.supply_price', 'Supply price')}
              type='number'
              min={0}
              suffix='원'
              onKeyDown={blockInvalidNumberKeys}
              required
            />

            <AppInputFormField
              name='cost'
              control={control}
              label={t('page.products.unit_price_settings.paper_price.dialog.cost', 'Cost')}
              type='number'
              min={0}
              suffix='원'
              onKeyDown={blockInvalidNumberKeys}
              required
            />
          </div>

          <AppSwitchFormField
            name='is_hot_deal'
            control={control}
            label={t('page.products.unit_price_settings.paper_price.dialog.is_hot_deal', 'Hot deal')}
            description={t(
              'page.products.unit_price_settings.paper_price.dialog.is_hot_deal_description',
              'Highlight this paper price as a promotional deal.',
            )}
          />

          <div className='flex justify-end gap-2 border-t pt-4'>
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
