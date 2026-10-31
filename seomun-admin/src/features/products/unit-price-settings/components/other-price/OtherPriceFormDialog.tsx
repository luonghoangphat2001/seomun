import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getLocalizedText, useErpOptionGroupsQuery, useProductDetailQuery, useProductsInfiniteQuery } from '@/features/products/management';
import { ErpOptionGroupCode, getPaperCategoryLabel, usePapersQuery, type Paper } from '@/features/products/options';
import { useDebounce } from '@/hooks/use-debounce';
import { getApiErrorMessage } from '@/utils/api-error';

import { useCreateOtherUnitPriceMutation, useOtherUnitPriceItemsQuery, useUpdateOtherUnitPriceMutation, type OtherUnitPrice } from '../../api';
import { OTHER_PRICE_OPTION_FIELDS, SUBJECT_MASTER_OPTION_GROUP_ID } from '../../constants/other-price.constants';
import { createOtherPriceFormSchema, getOtherPriceFormDefaults, type OtherPriceFormValues } from '../../schemas/other-price-form.schema';
import { getOtherPriceItemFormDefaults } from '../../schemas/other-price-item-form.schema';
import { dedupeByValue } from '../../utils/dedupe-by-value';

const BLOCKED_NUMBER_KEYS = ['e', 'E', '+', '-'];
const ITEMS_PAGE_SIZE = 10;
const PAPER_LOOKUP_PER_PAGE = 100;
// Label / field on one row at 1:3 — `grid` beats AppFormField's own `flex flex-col` through twMerge.
const OPTION_ROW_CLASS = 'grid grid-cols-4 items-center gap-x-4';

function toOptionId(value: string | undefined) {
  return value ? Number(value) : null;
}

function blockInvalidNumberKeys(event: KeyboardEvent<HTMLInputElement>) {
  if (BLOCKED_NUMBER_KEYS.includes(event.key)) {
    event.preventDefault();
  }
}

type OtherPriceFormDialogProps = {
  isOpen: boolean;
  editOtherUnitPrice?: OtherUnitPrice;
  onClose: () => void;
};

export function OtherPriceFormDialog({ isOpen, editOtherUnitPrice, onClose }: OtherPriceFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = editOtherUnitPrice !== undefined;

  const schema = useMemo(() => createOtherPriceFormSchema(t), [t]);

  const { control, handleSubmit, reset, setValue, trigger, formState } = useForm<OtherPriceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getOtherPriceFormDefaults(),
    mode: 'onChange',
  });
  const itemsFieldArray = useFieldArray({ control, name: 'items' });

  const [visibleItemCount, setVisibleItemCount] = useState(ITEMS_PAGE_SIZE);
  const itemsScrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const productId = useWatch({ control, name: 'product_id' });
  const [sizeOptionId, paperOptionId, subjectMasterOptionId] = useWatch({ control, name: [...OTHER_PRICE_OPTION_FIELDS] });
  const optionError = OTHER_PRICE_OPTION_FIELDS.map((field) => formState.errors[field]).find(Boolean);

  const { data: itemsData, isLoading: isItemsLoading } = useOtherUnitPriceItemsQuery(isOpen && editOtherUnitPrice ? editOtherUnitPrice.id : null);

  const [productSearchTerm, setProductSearchTerm] = useState('');
  const debouncedProductSearchTerm = useDebounce(productSearchTerm);
  const productsQuery = useProductsInfiniteQuery({ product_name: debouncedProductSearchTerm || undefined }, 'ko', {
    enabled: isOpen && !isEdit,
  });
  const productDetailQuery = useProductDetailQuery(productId, { enabled: isOpen && Boolean(productId) });
  const erpOptionGroupsQuery = useErpOptionGroupsQuery({ enabled: isOpen });
  const papersQuery = usePapersQuery({ per_page: PAPER_LOOKUP_PER_PAGE }, { enabled: isOpen });
  const productOptionGroups = useMemo(() => productDetailQuery.data?.data.product.option_groups ?? [], [productDetailQuery.data]);

  const productOptions = useMemo(() => {
    if (isEdit) {
      const product = productDetailQuery.data?.data.product;
      if (!product) return [];
      return [{ value: String(product.id), label: getLocalizedText(product.name, 'ko') }];
    }

    return dedupeByValue(
      (productsQuery.data?.pages.flatMap((page) => page.data.products) ?? []).map((product) => {
        const nameEn = product.product_name_en !== product.product_name ? product.product_name_en : null;
        const code = product.product_code !== '-' ? product.product_code : null;

        return {
          value: product.id,
          label: product.product_name,
          description: [nameEn, code].filter(Boolean).join(' · ') || undefined,
          keywords: [nameEn, code].filter((keyword): keyword is string => Boolean(keyword)),
        };
      }),
    );
  }, [isEdit, productDetailQuery.data, productsQuery.data]);

  const sizeOptionOptions = useMemo(() => {
    const options = productOptionGroups.find((group) => group.code === ErpOptionGroupCode.SIZE)?.options ?? [];
    return options
      .filter((option) => option.erp_option_id != null)
      .map((option) => ({ value: String(option.erp_option_id), label: option.erp_option.label }));
  }, [productOptionGroups]);

  const paperByErpOptionId = useMemo(() => {
    const papersById = new Map((papersQuery.data?.data.papers ?? []).map((paper) => [paper.id, paper]));
    const erpPaperOptions =
      (erpOptionGroupsQuery.data?.data.erp_option_groups ?? []).find((group) => group.code === ErpOptionGroupCode.PAPER)?.erp_options ?? [];
    const byErpOptionId = new Map<number, Paper>();

    erpPaperOptions.forEach((erpOption) => {
      const paper = erpOption.paper_id == null ? undefined : papersById.get(erpOption.paper_id);
      if (paper) byErpOptionId.set(erpOption.id, paper);
    });

    return byErpOptionId;
  }, [erpOptionGroupsQuery.data, papersQuery.data]);

  const paperOptionOptions = useMemo(() => {
    const options = productOptionGroups.find((group) => group.code === ErpOptionGroupCode.PAPER)?.options ?? [];
    return options
      .filter((option) => option.erp_option_id != null)
      .map((option) => {
        const paper = option.erp_option_id == null ? undefined : paperByErpOptionId.get(option.erp_option_id);

        return {
          value: String(option.erp_option_id),
          label: paper?.name ?? option.label,
          description: paper ? getPaperCategoryLabel(t, paper.category) : undefined,
        };
      });
  }, [productOptionGroups, paperByErpOptionId, t]);

  const subjectMasterOptionOptions = useMemo(() => {
    const options = productOptionGroups.find((group) => group.erp_option_group_id === SUBJECT_MASTER_OPTION_GROUP_ID)?.options ?? [];
    return options.filter((option) => option.erp_option_id != null).map((option) => ({ value: String(option.erp_option_id), label: option.label }));
  }, [productOptionGroups]);

  const isProductSelected = Boolean(productId);
  const isProductDetailReady = isProductSelected && Boolean(productDetailQuery.data) && !productDetailQuery.isFetching;
  const isMissingRequiredOptions =
    isProductDetailReady && sizeOptionOptions.length === 0 && paperOptionOptions.length === 0 && subjectMasterOptionOptions.length === 0;

  const createMutation = useCreateOtherUnitPriceMutation({
    onSuccess: () => {
      toast.success(t('page.products.unit_price_settings.other_price.dialog.create_success', 'Unit price created successfully.'));
      onClose();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, t('page.products.unit_price_settings.other_price.dialog.create_error', 'Failed to create unit price.'))),
  });

  const updateMutation = useUpdateOtherUnitPriceMutation({
    onSuccess: () => {
      toast.success(t('page.products.unit_price_settings.other_price.dialog.update_success', 'Unit price updated successfully.'));
      onClose();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, t('page.products.unit_price_settings.other_price.dialog.update_error', 'Failed to update unit price.'))),
  });

  useEffect(() => {
    if (!isOpen) return;

    setVisibleItemCount(ITEMS_PAGE_SIZE);

    if (editOtherUnitPrice) {
      reset({
        product_id: String(editOtherUnitPrice.product_id),
        erp_size_option_id: editOtherUnitPrice.erp_size_option_id?.toString() ?? '',
        erp_paper_option_id: editOtherUnitPrice.erp_paper_option_id?.toString() ?? '',
        erp_subject_master_option_id: editOtherUnitPrice.erp_subject_master_option_id?.toString() ?? '',
        items: [getOtherPriceItemFormDefaults()],
      });
    } else {
      reset(getOtherPriceFormDefaults());
    }
  }, [isOpen, editOtherUnitPrice, reset]);

  useEffect(() => {
    if (!itemsData) return;

    const items = [...itemsData.data.items].sort((a, b) => a.quantity_min - b.quantity_min);
    itemsFieldArray.replace(
      items.length
        ? items.map((item) => ({
            id: item.id,
            quantity_min: String(item.quantity_min),
            price_value: String(item.price_value),
            raw_cost: String(item.raw_cost),
          }))
        : [getOtherPriceItemFormDefaults()],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsData]);

  useEffect(() => {
    if (!formState.dirtyFields.product_id) return;
    setValue('erp_size_option_id', '');
    setValue('erp_paper_option_id', '');
    setValue('erp_subject_master_option_id', '');
  }, [productId, formState.dirtyFields.product_id, setValue]);

  // The "pick at least one" issue sits on all three fields, but onChange only revalidates the one that changed —
  // without this the other two keep a stale error. Deps must stay primitive: a watched array and an error object are
  // new references on every render, which turns this into an infinite trigger → re-render loop.
  useEffect(() => {
    if (!formState.isSubmitted) return;
    void trigger([...OTHER_PRICE_OPTION_FIELDS]);
  }, [sizeOptionId, paperOptionId, subjectMasterOptionId, formState.isSubmitted, trigger]);

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
  // "At least one option" lives in the schema so submitting surfaces it as a field error instead of a silently dead button.
  const isSubmitDisabled = isPending || isMissingRequiredOptions;

  const onSubmit = (values: OtherPriceFormValues) => {
    const payload = {
      erp_size_option_id: toOptionId(values.erp_size_option_id),
      erp_paper_option_id: toOptionId(values.erp_paper_option_id),
      erp_subject_master_option_id: toOptionId(values.erp_subject_master_option_id),
      // The product field is disabled while editing, so React Hook Form excludes it from `values`.
      product_id: isEdit ? editOtherUnitPrice.product_id : Number(values.product_id),
      items: values.items.map((item) => ({
        id: item.id,
        quantity_min: Number(item.quantity_min),
        price_value: Number(item.price_value),
        raw_cost: Number(item.raw_cost),
        is_active: true,
      })),
    };

    if (isEdit) {
      updateMutation.mutate({ id: editOtherUnitPrice.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('page.products.unit_price_settings.other_price.dialog.edit_title', 'Edit unit price')
              : t('page.products.unit_price_settings.other_price.dialog.create_title', 'Add unit price')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
          <AppSelectFormField
            name='product_id'
            control={control}
            label={t('page.products.unit_price_settings.other_price.dialog.product', 'Product')}
            placeholder={t('page.products.unit_price_settings.other_price.dialog.product_placeholder', 'Select product')}
            options={productOptions}
            disabled={isEdit}
            searchable={!isEdit}
            onSearchValueChange={isEdit ? undefined : setProductSearchTerm}
            onReachEnd={
              isEdit
                ? undefined
                : () => {
                    if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) void productsQuery.fetchNextPage();
                  }
            }
            isFetchingNextPage={!isEdit && productsQuery.isFetchingNextPage}
            required
          />

          <div className='space-y-4'>
            <AppSelectFormField
              name='erp_size_option_id'
              control={control}
              label={t('page.products.unit_price_settings.other_price.dialog.size_option', 'Size option')}
              placeholder={
                isProductSelected
                  ? t('page.products.unit_price_settings.other_price.dialog.size_option_placeholder', 'Select size option')
                  : t('page.products.unit_price_settings.other_price.dialog.select_product_first', 'Select a product first')
              }
              options={sizeOptionOptions}
              disabled={!isProductSelected || sizeOptionOptions.length === 0}
              searchable
              clearable
              errorClassName='hidden'
              fieldClassName={OPTION_ROW_CLASS}
              className='col-span-3'
            />

            <AppSelectFormField
              name='erp_paper_option_id'
              control={control}
              label={t('page.products.unit_price_settings.other_price.dialog.paper_option', 'Paper option')}
              placeholder={
                isProductSelected
                  ? t('page.products.unit_price_settings.other_price.dialog.paper_option_placeholder', 'Select paper option')
                  : t('page.products.unit_price_settings.other_price.dialog.select_product_first', 'Select a product first')
              }
              options={paperOptionOptions}
              disabled={!isProductSelected || paperOptionOptions.length === 0}
              searchable
              clearable
              errorClassName='hidden'
              fieldClassName={OPTION_ROW_CLASS}
              className='col-span-3'
            />

            <AppSelectFormField
              name='erp_subject_master_option_id'
              control={control}
              label={t('page.products.unit_price_settings.other_price.dialog.subject_master_option', 'Subject master option')}
              placeholder={
                isProductSelected
                  ? t('page.products.unit_price_settings.other_price.dialog.subject_master_option_placeholder', 'Select subject master option')
                  : t('page.products.unit_price_settings.other_price.dialog.select_product_first', 'Select a product first')
              }
              options={subjectMasterOptionOptions}
              disabled={!isProductSelected || subjectMasterOptionOptions.length === 0}
              searchable
              clearable
              errorClassName='hidden'
              fieldClassName={OPTION_ROW_CLASS}
              className='col-span-3'
            />
          </div>

          {optionError ? <p className='text-destructive text-sm'>{optionError.message}</p> : null}

          {isMissingRequiredOptions ? (
            <p className='text-destructive text-sm'>
              {t(
                'page.products.unit_price_settings.other_price.dialog.missing_options',
                'This product has no size/paper options configured, so a unit price cannot be created for it.',
              )}
            </p>
          ) : null}

          <Separator />

          <div className='space-y-3'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>{t('page.products.unit_price_settings.other_price.item_dialog.title', 'Quantity tiers')}</p>
              <p className='text-muted-foreground text-xs'>
                {t(
                  'page.products.unit_price_settings.other_price.item_dialog.description',
                  'Manage the quantity-based pricing tiers for this unit price.',
                )}
              </p>
            </div>

            {isEdit && isItemsLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className='h-24 rounded-lg' />
                ))}
              </div>
            ) : (
              <div ref={itemsScrollRef} className='max-h-64 space-y-3 overflow-y-auto pr-1'>
                {itemsFieldArray.fields.slice(0, visibleItemCount).map((field, index) => (
                  <div key={field.id} className='grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1fr_auto]'>
                    <AppInputFormField
                      name={`items.${index}.quantity_min`}
                      control={control}
                      label={t('page.products.unit_price_settings.other_price.item_dialog.quantity_min', 'Min quantity')}
                      type='number'
                      min={0}
                      onKeyDown={blockInvalidNumberKeys}
                      required
                    />
                    <AppInputFormField
                      name={`items.${index}.price_value`}
                      control={control}
                      label={t('page.products.unit_price_settings.other_price.item_dialog.price_value', 'Price')}
                      type='number'
                      min={0}
                      suffix='원'
                      onKeyDown={blockInvalidNumberKeys}
                      required
                    />
                    <AppInputFormField
                      name={`items.${index}.raw_cost`}
                      control={control}
                      label={t('page.products.unit_price_settings.other_price.item_dialog.raw_cost', 'Raw cost')}
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
                      aria-label={t('page.products.unit_price_settings.other_price.item_dialog.remove_item', 'Remove')}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                ))}

                {visibleItemCount < itemsFieldArray.fields.length ? <div ref={sentinelRef} className='h-1' /> : null}
              </div>
            )}

            <Button
              type='button'
              variant='outline'
              size='sm'
              className='gap-1.5'
              onClick={() => {
                itemsFieldArray.prepend(getOtherPriceItemFormDefaults());
                setVisibleItemCount((count) => count + 1);
              }}
            >
              <Plus className='size-4' />
              {t('page.products.unit_price_settings.other_price.item_dialog.add_item', 'Add tier')}
            </Button>
          </div>

          <div className='flex justify-end gap-2 border-t pt-4'>
            <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
              {t('common.action.cancel')}
            </Button>
            <AppButton type='submit' isLoading={isPending} disabled={isSubmitDisabled}>
              {isEdit ? t('common.action.save') : t('page.products.unit_price_settings.other_price.dialog.submit', 'Create')}
            </AppButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
