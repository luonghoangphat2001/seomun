import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppSelect } from '@/components/shared/app-select';
import { AppFieldLabel, AppFieldMessage, AppInputFormField, AppSelectFormField, AppSwitchFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ErpOptionGroupType, useAdminErpOptionGroupsQuery, useAdminErpOptionsQuery } from '@/features/products/options';
import { getApiErrorMessage } from '@/utils/api-error';

import type { PostProcessingPrice } from '../../api';
import { useCreatePostProcessingPriceMutation, usePostProcessingPriceDetailQuery, useUpdatePostProcessingPriceMutation } from '../../api';
import { getPostProcessingSizeTypeOptions } from '../../constants';
import {
  createPostProcessingPriceFormSchema,
  getEmptyPostProcessingPriceItem,
  getPostProcessingPriceFormDefaults,
  type PostProcessingPriceFormValues,
} from '../../schemas/post-processing-price-form.schema';

const BLOCKED_NUMBER_KEYS = ['e', 'E', '+', '-'];
const ITEMS_PAGE_SIZE = 10;

function blockInvalidNumberKeys(event: KeyboardEvent<HTMLInputElement>) {
  if (BLOCKED_NUMBER_KEYS.includes(event.key)) {
    event.preventDefault();
  }
}

type PostProcessingPriceFormDialogProps = {
  isOpen: boolean;
  editPostProcessingPrice?: PostProcessingPrice;
  onClose: () => void;
};

export function PostProcessingPriceFormDialog({ isOpen, editPostProcessingPrice, onClose }: PostProcessingPriceFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = editPostProcessingPrice !== undefined;

  const detailQuery = usePostProcessingPriceDetailQuery(isOpen && editPostProcessingPrice ? editPostProcessingPrice.id : null);
  const detail = detailQuery.data?.data.post_processing_price;

  // Wait for the detail response before mounting the form so its state can be seeded once, at mount,
  // via useState initializers — no reset effects (react-hooks/set-state-in-effect).
  const isWaitingForDetail = isEdit && !detail;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('page.products.unit_price_settings.post_processing_price.dialog.edit_title', 'Edit post-processing price')
              : t('page.products.unit_price_settings.post_processing_price.dialog.create_title', 'Add post-processing price')}
          </DialogTitle>
        </DialogHeader>

        {isWaitingForDetail ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-9' />
                </div>
              ))}
            </div>
            <Separator />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className='h-24 rounded-lg' />
            ))}
          </div>
        ) : (
          <PostProcessingPriceForm
            key={editPostProcessingPrice ? `edit-${editPostProcessingPrice.id}` : 'create'}
            detail={editPostProcessingPrice ? detail : undefined}
            editId={editPostProcessingPrice?.id}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type PostProcessingPriceFormProps = {
  detail?: PostProcessingPrice;
  editId?: number;
  onClose: () => void;
};

function PostProcessingPriceForm({ detail, editId, onClose }: PostProcessingPriceFormProps) {
  const { t } = useTranslation();

  const schema = useMemo(() => createPostProcessingPriceFormSchema(t), [t]);

  // `detail` is stable for this component's lifetime (parent remounts via key); useForm only reads defaultValues at mount.
  const defaultValues: PostProcessingPriceFormValues = detail
    ? {
        code: detail.code,
        erp_option_id: String(detail.erp_option_id),
        post_processing_size_type: detail.post_processing_size_type,
        is_active: detail.is_active,
        items: detail.post_processing_price_items?.length
          ? [...detail.post_processing_price_items]
              .sort((a, b) => a.quantity - b.quantity)
              .map((item) => ({
                id: item.id,
                quantity: String(item.quantity),
                supply_price: String(item.supply_price),
                cost: String(item.cost),
              }))
          : [getEmptyPostProcessingPriceItem()],
      }
    : getPostProcessingPriceFormDefaults();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostProcessingPriceFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const itemsFieldArray = useFieldArray({ control, name: 'items' });

  const [erpOptionGroupId, setErpOptionGroupId] = useState(() =>
    detail?.erp_option?.erp_option_group_id != null ? String(detail.erp_option.erp_option_group_id) : '',
  );
  const [visibleItemCount, setVisibleItemCount] = useState(ITEMS_PAGE_SIZE);
  const itemsScrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const sizeTypeOptions = useMemo(() => getPostProcessingSizeTypeOptions(t), [t]);

  const erpOptionGroupsQuery = useAdminErpOptionGroupsQuery({ type: ErpOptionGroupType.POST_PROCESSING, current_page: 1, per_page: 100 });
  const erpOptionGroupOptions = useMemo(
    () => (erpOptionGroupsQuery.data?.data.erp_option_groups ?? []).map((group) => ({ value: String(group.id), label: group.label })),
    [erpOptionGroupsQuery.data],
  );

  const erpOptionsQuery = useAdminErpOptionsQuery(
    { erp_option_group_id: erpOptionGroupId ? Number(erpOptionGroupId) : undefined, current_page: 1, per_page: 100 },
    { enabled: Boolean(erpOptionGroupId) },
  );
  const erpOptionOptions = useMemo(
    () => (erpOptionsQuery.data?.data.erp_options ?? []).map((erpOption) => ({ value: String(erpOption.id), label: erpOption.label })),
    [erpOptionsQuery.data],
  );

  const createMutation = useCreatePostProcessingPriceMutation({
    onSuccess: () => {
      toast.success(
        t('page.products.unit_price_settings.post_processing_price.dialog.create_success', 'Post-processing price created successfully.'),
      );
      onClose();
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          t('page.products.unit_price_settings.post_processing_price.dialog.create_error', 'Failed to create post-processing price.'),
        ),
      ),
  });

  const updateMutation = useUpdatePostProcessingPriceMutation({
    onSuccess: () => {
      toast.success(
        t('page.products.unit_price_settings.post_processing_price.dialog.update_success', 'Post-processing price updated successfully.'),
      );
      onClose();
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          t('page.products.unit_price_settings.post_processing_price.dialog.update_error', 'Failed to update post-processing price.'),
        ),
      ),
  });

  useEffect(() => {
    const scrollRoot = itemsScrollRef.current;
    const sentinel = sentinelRef.current;
    if (!scrollRoot || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleItemCount((count) => Math.min(count + ITEMS_PAGE_SIZE, itemsFieldArray.fields.length));
        }
      },
      { root: scrollRoot, rootMargin: '80px', threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [itemsFieldArray.fields.length]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleErpOptionGroupChange = (value?: string) => {
    setErpOptionGroupId(value ?? '');
    setValue('erp_option_id', '', { shouldValidate: true, shouldDirty: true });
  };

  const handleErpOptionChange = (value?: string) => {
    setValue('erp_option_id', value ?? '', { shouldValidate: true, shouldDirty: true });
  };

  const erpOptionId = watch('erp_option_id');

  const onSubmit = (values: PostProcessingPriceFormValues) => {
    const payload = {
      code: values.code,
      erp_option_id: Number(values.erp_option_id),
      post_processing_size_type: values.post_processing_size_type,
      is_active: values.is_active,
      items: values.items.map((item) => ({
        id: item.id,
        quantity: Number(item.quantity),
        supply_price: Number(item.supply_price),
        cost: Number(item.cost),
      })),
    };

    if (editId !== undefined) {
      updateMutation.mutate({ id: editId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
      <div className='grid grid-cols-2 gap-4'>
        <AppInputFormField
          name='code'
          control={control}
          label={t('page.products.unit_price_settings.post_processing_price.dialog.code', 'Code')}
          placeholder={t('page.products.unit_price_settings.post_processing_price.dialog.code_placeholder', 'PP-001')}
          required
        />

        <AppSelectFormField
          name='post_processing_size_type'
          control={control}
          label={t('page.products.unit_price_settings.post_processing_price.dialog.size_type', 'Size type')}
          placeholder={t('page.products.unit_price_settings.post_processing_price.dialog.size_type_placeholder', 'Select size type')}
          options={sizeTypeOptions}
          required
        />

        <div className='space-y-2'>
          <AppFieldLabel
            htmlFor='post-processing-erp-option-group'
            label={t('page.products.unit_price_settings.post_processing_price.dialog.erp_option_group', 'Option group')}
          />
          <AppSelect
            id='post-processing-erp-option-group'
            value={erpOptionGroupId}
            onValueChange={handleErpOptionGroupChange}
            options={erpOptionGroupOptions}
            placeholder={t('page.products.unit_price_settings.post_processing_price.dialog.erp_option_group_placeholder', 'Select option group')}
            searchable
            disabled={isPending}
          />
        </div>

        <div className='space-y-2'>
          <AppFieldLabel
            htmlFor='post-processing-erp-option'
            label={t('page.products.unit_price_settings.post_processing_price.dialog.erp_option', 'Option')}
            required
          />
          <AppSelect
            id='post-processing-erp-option'
            value={erpOptionId || undefined}
            onValueChange={handleErpOptionChange}
            options={erpOptionOptions}
            placeholder={t('page.products.unit_price_settings.post_processing_price.dialog.erp_option_placeholder', 'Select option')}
            searchable
            disabled={isPending || !erpOptionGroupId}
            isInvalid={Boolean(errors.erp_option_id)}
          />
          <AppFieldMessage message={errors.erp_option_id?.message} variant='error' />
        </div>
      </div>

      <AppSwitchFormField
        name='is_active'
        control={control}
        label={t('page.products.unit_price_settings.post_processing_price.dialog.is_active', 'Active')}
        description={t(
          'page.products.unit_price_settings.post_processing_price.dialog.is_active_description',
          'Inactive prices are hidden from pricing calculations.',
        )}
      />

      <Separator />

      <div className='space-y-3'>
        <div className='space-y-1'>
          <p className='text-sm font-medium'>{t('page.products.unit_price_settings.post_processing_price.dialog.items_title', 'Quantity tiers')}</p>
          <p className='text-muted-foreground text-xs'>
            {t(
              'page.products.unit_price_settings.post_processing_price.dialog.items_description',
              'Add at least one quantity tier with its supply price and cost.',
            )}
          </p>
        </div>

        <div ref={itemsScrollRef} className='max-h-64 space-y-3 overflow-y-auto pr-1'>
          {itemsFieldArray.fields.slice(0, visibleItemCount).map((field, index) => (
            <div key={field.id} className='grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1fr_auto]'>
              <AppInputFormField
                name={`items.${index}.quantity`}
                control={control}
                label={t('page.products.unit_price_settings.post_processing_price.dialog.item_quantity', 'Quantity')}
                type='number'
                min={0}
                onKeyDown={blockInvalidNumberKeys}
                required
              />
              <AppInputFormField
                name={`items.${index}.supply_price`}
                control={control}
                label={t('page.products.unit_price_settings.post_processing_price.dialog.item_supply_price', 'Supply price')}
                type='number'
                min={0}
                suffix='원'
                onKeyDown={blockInvalidNumberKeys}
                required
              />
              <AppInputFormField
                name={`items.${index}.cost`}
                control={control}
                label={t('page.products.unit_price_settings.post_processing_price.dialog.item_cost', 'Cost')}
                type='number'
                min={0}
                suffix='원'
                onKeyDown={blockInvalidNumberKeys}
                required
              />
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='mt-6'
                onClick={() => itemsFieldArray.remove(index)}
                disabled={itemsFieldArray.fields.length <= 1}
                aria-label={t('page.products.unit_price_settings.post_processing_price.dialog.remove_item', 'Remove')}
              >
                <Trash2 className='size-4' />
              </Button>
            </div>
          ))}

          {visibleItemCount < itemsFieldArray.fields.length ? <div ref={sentinelRef} className='h-1' /> : null}
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-1.5'
          onClick={() => {
            itemsFieldArray.prepend(getEmptyPostProcessingPriceItem());
            setVisibleItemCount((count) => count + 1);
          }}
        >
          <Plus className='size-4' />
          {t('page.products.unit_price_settings.post_processing_price.dialog.add_item', 'Add tier')}
        </Button>
      </div>

      <div className='flex justify-end gap-2 border-t pt-4'>
        <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
          {t('common.action.cancel')}
        </Button>
        <AppButton type='submit' isLoading={isPending}>
          {t('common.action.save')}
        </AppButton>
      </div>
    </form>
  );
}
