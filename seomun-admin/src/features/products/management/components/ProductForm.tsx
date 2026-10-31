import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { AppButton } from '@/components/shared/app-button';
import { AppInput } from '@/components/shared/app-input';
import type { AppSelectOption } from '@/components/shared/app-select';
import { AppFieldLabel, AppInputFormField, AppSelectFormField, AppSwitchFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { FileType } from '@/enums';
import { useCategoryListQuery, type Category } from '@/features/categories';
import { useShoppingSettingsQuery } from '@/features/products/shopping-settings/api';
import { SHOPPING_GUIDE_SECTIONS } from '@/features/products/shopping-settings/constants';
import { usePricingProfilesQuery } from '@/features/products/pricing-profile/api';
import { useUploadFileMutation } from '@/features/system-content/images';
import { useWebEditorsQuery } from '@/features/products/web-editors';

import { useErpOptionGroupsQuery, type ErpOptionGroup, type ProductListLocale } from '../api';
import {
  BOOK_OPTION_GROUP_CODES,
  createProductFormSchema,
  DEFAULT_PRODUCT_FORM_VALUES,
  type BookOptionGroupCode,
  type ProductFormValues,
} from '../schemas';
import { PRODUCT_INFO_ICON_FIELDS } from '../constants';

import { ShoppingSettingItemSelector } from './ShoppingSettingItemSelector';

type ProductFormProps = {
  mode?: 'create' | 'edit';
  defaultValues?: ProductFormValues;
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: (values: ProductFormValues, erpOptionGroups: ErpOptionGroup[], isBookProduct: boolean) => void;
};

const EMPTY_SELECTED_GROUP_IDS: string[] = [];
const EMPTY_SELECTED_OPTION_MAP: Record<string, string[]> = {};
const PRODUCT_IMAGE_MAX_SIZE_MB = 10;
const PRODUCT_IMAGE_MAX_SIZE_BYTES = PRODUCT_IMAGE_MAX_SIZE_MB * 1024 * 1024;
const EXCLUDED_ERP_OPTION_GROUP_CODES = new Set(['paper_color', 'paper_type', 'paper_weight']);
const ERP_OPTION_LABEL_COLLATOR = new Intl.Collator('ko-KR', { numeric: true, sensitivity: 'base' });

type BookOptionSectionTranslationKey = 'cover_paper' | 'inner_paper' | 'additional_paper' | 'colored_paper_1' | 'colored_paper_2' | 'flyleaf_paper';
type BookOptionFieldTranslationKey = 'paper' | 'printed_side' | 'printed_color_front_side' | 'printed_color_back_side';

const BOOK_OPTION_SECTIONS: Array<{
  titleKey: BookOptionSectionTranslationKey;
  required: boolean;
  fields: Array<{
    code: BookOptionGroupCode;
    labelKey: BookOptionFieldTranslationKey;
    sourceGroupCode: 'paper' | 'printed_side' | 'printed_color_fside' | 'printed_color_bside';
  }>;
}> = [
  {
    titleKey: 'cover_paper',
    required: true,
    fields: [
      { code: BOOK_OPTION_GROUP_CODES.COVER_PAPER, labelKey: 'paper', sourceGroupCode: 'paper' },
      { code: BOOK_OPTION_GROUP_CODES.PRINTED_COVER_SIDE, labelKey: 'printed_side', sourceGroupCode: 'printed_side' },
      { code: BOOK_OPTION_GROUP_CODES.PRINTED_COLOR_COVER_FSIDE, labelKey: 'printed_color_front_side', sourceGroupCode: 'printed_color_fside' },
      { code: BOOK_OPTION_GROUP_CODES.PRINTED_COLOR_COVER_BSIDE, labelKey: 'printed_color_back_side', sourceGroupCode: 'printed_color_bside' },
    ],
  },
  {
    titleKey: 'inner_paper',
    required: true,
    fields: [
      { code: BOOK_OPTION_GROUP_CODES.INNER_PAPER, labelKey: 'paper', sourceGroupCode: 'paper' },
      { code: BOOK_OPTION_GROUP_CODES.PRINTED_INNER_SIDE, labelKey: 'printed_side', sourceGroupCode: 'printed_side' },
      { code: BOOK_OPTION_GROUP_CODES.PRINTED_COLOR_INNER_FSIDE, labelKey: 'printed_color_front_side', sourceGroupCode: 'printed_color_fside' },
      { code: BOOK_OPTION_GROUP_CODES.PRINTED_COLOR_INNER_BSIDE, labelKey: 'printed_color_back_side', sourceGroupCode: 'printed_color_bside' },
    ],
  },
  {
    titleKey: 'additional_paper',
    required: false,
    fields: [{ code: BOOK_OPTION_GROUP_CODES.ADDITIONAL_PAPER, labelKey: 'paper', sourceGroupCode: 'paper' }],
  },
  {
    titleKey: 'colored_paper_1',
    required: false,
    fields: [{ code: BOOK_OPTION_GROUP_CODES.COLORED_PAPER_1, labelKey: 'paper', sourceGroupCode: 'paper' }],
  },
  {
    titleKey: 'colored_paper_2',
    required: false,
    fields: [{ code: BOOK_OPTION_GROUP_CODES.COLORED_PAPER_2, labelKey: 'paper', sourceGroupCode: 'paper' }],
  },
  {
    titleKey: 'flyleaf_paper',
    required: false,
    fields: [{ code: BOOK_OPTION_GROUP_CODES.FLYLEAF_PAPER, labelKey: 'paper', sourceGroupCode: 'paper' }],
  },
];

const BOOK_SOURCE_OPTION_GROUP_CODES: Set<string> = new Set(
  BOOK_OPTION_SECTIONS.flatMap((section) => section.fields.map((field) => field.sourceGroupCode)),
);

function ProductFormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='bg-card rounded-xl border'>
      <div className='px-6 py-4'>
        <h2 className='text-sm font-semibold'>{title}</h2>
      </div>
      <Separator />
      <div className='space-y-4 p-6'>{children}</div>
    </section>
  );
}

function normalizeProductFormLocale(locale?: string): ProductListLocale {
  return locale?.startsWith('ko') ? 'ko' : 'en';
}

function buildCategoryOptions(categories: Category[], locale: ProductListLocale, depth = 0): AppSelectOption<string>[] {
  return categories
    .filter((category) => category.parent_id === null)
    .map((category) => ({
      value: String(category.id),
      label: `${'— '.repeat(depth)}${(locale === 'en' ? category.name_en || category.name : category.name || category.name_en) || category.slug}`,
      keywords: [category.slug, category.code ?? '', category.name, category.name_en ?? '', category.name_ja ?? ''].filter(Boolean),
    }));
}

function sortErpOptionGroups(groups: ErpOptionGroup[]) {
  return [...groups].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

function sortErpOptions(options: ErpOptionGroup['erp_options']) {
  return [...options].sort((a, b) => ERP_OPTION_LABEL_COLLATOR.compare(a.label, b.label) || a.sort_order - b.sort_order || a.id - b.id);
}

function isVisibleErpOptionGroup(group: ErpOptionGroup) {
  return !EXCLUDED_ERP_OPTION_GROUP_CODES.has(group.code);
}

function blockSpecialNumericKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
}

export function ProductForm({
  mode = 'create',
  defaultValues = DEFAULT_PRODUCT_FORM_VALUES,
  isPending = false,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const { t, i18n } = useTranslation('page');
  const { t: tValidate } = useTranslation('validation');
  const currentLocale = normalizeProductFormLocale(i18n.resolvedLanguage || i18n.language);
  const schema = useMemo(() => createProductFormSchema(tValidate, t), [tValidate, t]);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = form;

  const imagesFieldArray = useFieldArray({ control, name: 'images' });
  const quantityPricesFieldArray = useFieldArray({ control, name: 'quantity_prices' });

  const categoryQuery = useCategoryListQuery({ page: 1, per_page: 100 });
  const webEditorsQuery = useWebEditorsQuery({ page: 1, per_page: 100, is_active: true });
  const pricingProfilesQuery = usePricingProfilesQuery();
  const erpOptionGroupsQuery = useErpOptionGroupsQuery();
  const shoppingSettingsQuery = useShoppingSettingsQuery({ page: 1, per_page: 100 });
  const uploadProductImageMutation = useUploadFileMutation(FileType.PRODUCT_IMAGES);
  const selectedGroupIds = useWatch({ control, name: 'option_group_ids' }) ?? EMPTY_SELECTED_GROUP_IDS;
  const selectedOptionMap = useWatch({ control, name: 'option_options' }) ?? EMPTY_SELECTED_OPTION_MAP;
  const selectedBookOptionMap = useWatch({ control, name: 'book_option_options' });
  const selectedShoppingSettingItemIds = useWatch({ control, name: 'shopping_setting_item_ids' }) ?? [];
  const isBookProduct = useWatch({ control, name: 'is_book_product' });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorSectionRef = useRef<HTMLDivElement>(null);

  const [optionSearch, setOptionSearch] = useState('');
  const [optionGroupError, setOptionGroupError] = useState<string>();
  const [creationMethodError, setCreationMethodError] = useState<string>();
  const [previewImageUrl, setPreviewImageUrl] = useState<string>();

  const categoryOptions = useMemo(
    () => buildCategoryOptions(categoryQuery.data?.data.categories ?? [], currentLocale),
    [categoryQuery.data?.data.categories, currentLocale],
  );
  const webEditorOptions = useMemo(
    () => (webEditorsQuery.data?.data.web_editors ?? []).map((editor) => ({ value: String(editor.id), label: editor.name })),
    [webEditorsQuery.data?.data.web_editors],
  );
  const pricingProfileOptions = useMemo(
    () =>
      (pricingProfilesQuery.data?.data.pricing_profiles ?? [])
        .filter((profile) => profile.is_active)
        .map((profile) => ({
          value: String(profile.id),
          label: `${profile.code} — ${profile.name}`,
        })),
    [pricingProfilesQuery.data?.data.pricing_profiles],
  );
  const erpOptionGroups = useMemo(
    () => sortErpOptionGroups((erpOptionGroupsQuery.data?.data.erp_option_groups ?? []).filter(isVisibleErpOptionGroup)),
    [erpOptionGroupsQuery.data?.data.erp_option_groups],
  );
  const shoppingSettings = useMemo(() => {
    const settings = shoppingSettingsQuery.data?.data.settings ?? [];
    return SHOPPING_GUIDE_SECTIONS.flatMap((section) => {
      const setting = settings.find((item) => item.type === section.type);
      return setting ? [setting] : [];
    });
  }, [shoppingSettingsQuery.data?.data.settings]);
  const bookSourceGroupByCode = useMemo(() => new Map(erpOptionGroups.map((group) => [group.code, group])), [erpOptionGroups]);
  const availableBookOptionSections = useMemo(
    () =>
      BOOK_OPTION_SECTIONS.map((section) => ({
        ...section,
        fields: section.fields.filter((field) => (bookSourceGroupByCode.get(field.sourceGroupCode)?.erp_options.length ?? 0) > 0),
      })).filter((section) => section.fields.length > 0),
    [bookSourceGroupByCode],
  );
  const normalErpOptionGroups = useMemo(
    () => (isBookProduct ? erpOptionGroups.filter((group) => !BOOK_SOURCE_OPTION_GROUP_CODES.has(group.code)) : erpOptionGroups),
    [erpOptionGroups, isBookProduct],
  );
  const filteredOptionGroups = useMemo(() => {
    const normalizedSearch = optionSearch.trim().toLowerCase();
    if (!normalizedSearch) return normalErpOptionGroups;

    return normalErpOptionGroups.filter((group) => {
      const groupText = `${group.code} ${group.label} ${group.type}`.toLowerCase();
      const optionMatched = group.erp_options.some((option) =>
        `${option.code} ${option.label} ${option.value}`.toLowerCase().includes(normalizedSearch),
      );
      return groupText.includes(normalizedSearch) || optionMatched;
    });
  }, [normalErpOptionGroups, optionSearch]);

  const selectedGroupIdSet = useMemo(() => new Set(selectedGroupIds), [selectedGroupIds]);
  const isLoadingOptions = erpOptionGroupsQuery.isLoading;
  const isSubmitting =
    isPending ||
    categoryQuery.isLoading ||
    webEditorsQuery.isLoading ||
    pricingProfilesQuery.isLoading ||
    erpOptionGroupsQuery.isLoading ||
    uploadProductImageMutation.isPending;
  const requiresSeparateShipping = useWatch({ control, name: 'requires_separate_shipping' });
  const allowWebEditor = useWatch({ control, name: 'allow_web_editor' });
  const isActive = useWatch({ control, name: 'is_active' });

  const handleGroupToggle = (group: ErpOptionGroup, checked: boolean) => {
    // Standard products always require Size. Book products retain their existing API-driven rules.
    const isRequiredGroup = isBookProduct ? group.is_required : group.code === 'size';
    if (isRequiredGroup && !checked) return;

    const groupId = String(group.id);
    const nextGroupIds = checked ? [...selectedGroupIds, groupId] : selectedGroupIds.filter((selectedGroupId) => selectedGroupId !== groupId);
    const nextOptionMap = checked ? selectedOptionMap : { ...selectedOptionMap, [groupId]: [] };

    setOptionGroupError(undefined);
    setValue('option_group_ids', Array.from(new Set(nextGroupIds)), { shouldDirty: true, shouldValidate: true });
    setValue('option_options', nextOptionMap, { shouldDirty: true, shouldValidate: true });
  };

  const handleOptionToggle = (groupId: string, optionId: string, checked: boolean) => {
    const selectedOptions = selectedOptionMap[groupId] ?? [];
    const nextSelectedOptions = checked
      ? [...selectedOptions, optionId]
      : selectedOptions.filter((selectedOptionId) => selectedOptionId !== optionId);

    setOptionGroupError(undefined);
    setValue(
      'option_options',
      {
        ...selectedOptionMap,
        [groupId]: Array.from(new Set(nextSelectedOptions)),
      },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleAllOptionsToggle = (group: ErpOptionGroup, checked: boolean) => {
    const groupId = String(group.id);

    setOptionGroupError(undefined);
    setValue(
      'option_options',
      {
        ...selectedOptionMap,
        [groupId]: checked ? group.erp_options.map((option) => String(option.id)) : [],
      },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleBookOptionToggle = (code: BookOptionGroupCode, optionId: string, checked: boolean) => {
    const selectedOptions = selectedBookOptionMap?.[code] ?? [];
    const nextSelectedOptions = checked
      ? [...selectedOptions, optionId]
      : selectedOptions.filter((selectedOptionId) => selectedOptionId !== optionId);

    setOptionGroupError(undefined);
    setValue(
      'book_option_options',
      {
        ...selectedBookOptionMap,
        [code]: Array.from(new Set(nextSelectedOptions)),
      },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleAllBookOptionsToggle = (code: BookOptionGroupCode, group: ErpOptionGroup, checked: boolean) => {
    setOptionGroupError(undefined);
    setValue(
      'book_option_options',
      {
        ...selectedBookOptionMap,
        [code]: checked ? group.erp_options.map((option) => String(option.id)) : [],
      },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleShoppingSettingItemSelect = (itemId: number | null, settingItemIds: number[]) => {
    const nextSelectedItemIds = selectedShoppingSettingItemIds.filter((selectedItemId) => !settingItemIds.includes(selectedItemId));
    if (itemId !== null) nextSelectedItemIds.push(itemId);

    setValue('shopping_setting_item_ids', Array.from(new Set(nextSelectedItemIds)), { shouldDirty: true });
  };

  const handleAddProductImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (file.size <= PRODUCT_IMAGE_MAX_SIZE_BYTES) return true;

      toast.error(t('products.management.form.messages.image_too_large', { fileName: file.name, maxSize: PRODUCT_IMAGE_MAX_SIZE_MB }));
      return false;
    });

    if (!validFiles.length) return;

    try {
      for (const file of validFiles) {
        const uploadedFile = await uploadProductImageMutation.mutateAsync(file);
        imagesFieldArray.append({ url: uploadedFile.url });
      }
    } catch (error) {
      console.error('Product image upload failed:', error);
      toast.error(t('products.management.form.messages.upload_image_error'));
    }
  };

  const submitForm = (values: ProductFormValues) => {
    if (!values.allow_file_upload && !values.allow_web_editor) {
      setCreationMethodError(t('products.management.form.messages.creation_method_required'));
      editorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setCreationMethodError(undefined);

    const missingBookFields = isBookProduct
      ? availableBookOptionSections
          .filter((section) => section.required)
          .flatMap((section) => section.fields)
          .filter((field) => (values.book_option_options[field.code] ?? []).length === 0)
      : [];
    if (missingBookFields.length > 0) {
      setOptionGroupError(
        t('products.management.form.messages.required_option_group', {
          groups: missingBookFields.map((field) => t(`products.management.form.book_layout.fields.${field.labelKey}`)).join(', '),
        }),
      );
      return;
    }

    const selectedIds = new Set(values.option_group_ids);
    const invalidGroups = normalErpOptionGroups.filter((group) => {
      const isRequiredGroup = isBookProduct ? group.is_required : group.code === 'size';
      if (!isRequiredGroup && !selectedIds.has(String(group.id))) return false;
      return (values.option_options[String(group.id)] ?? []).length === 0;
    });

    if (invalidGroups.length > 0) {
      setOptionGroupError(
        t('products.management.form.messages.required_option_group', { groups: invalidGroups.map((group) => group.label).join(', ') }),
      );
      return;
    }

    setOptionGroupError(undefined);
    onSubmit(values, erpOptionGroups, isBookProduct);
  };

  const renderQueryError = () => {
    if (!categoryQuery.isError && !pricingProfilesQuery.isError && !erpOptionGroupsQuery.isError && !shoppingSettingsQuery.isError) return null;

    return (
      <div className='border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border px-4 py-3 text-sm'>
        <AlertCircle className='mt-0.5 size-4 shrink-0' />
        <span>{t('products.management.form.messages.load_form_data_error')}</span>
      </div>
    );
  };

  useEffect(() => {
    const requiredGroupIds = normalErpOptionGroups
      .filter((group) => (isBookProduct ? group.is_required : group.code === 'size'))
      .map((group) => String(group.id));
    const missingRequiredGroupIds = requiredGroupIds.filter((groupId) => !selectedGroupIds.includes(groupId));

    if (!missingRequiredGroupIds.length) return;

    setValue('option_group_ids', Array.from(new Set([...selectedGroupIds, ...missingRequiredGroupIds])), {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [isBookProduct, normalErpOptionGroups, selectedGroupIds, setValue]);

  return (
    <form onSubmit={(event) => void handleSubmit(submitForm)(event)} className='space-y-6 pb-24' noValidate>
      {renderQueryError()}

      <ProductFormSection title={t('products.management.form.sections.basic')}>
        <div className='grid gap-4 md:grid-cols-2'>
          <AppSelectFormField
            name='category_id'
            control={control}
            label={t('products.management.form.fields.category')}
            placeholder={
              categoryQuery.isLoading
                ? t('products.management.form.placeholders.loading_categories')
                : t('products.management.form.placeholders.select_category')
            }
            options={categoryOptions}
            searchable
            clearable
            required
            disabled={categoryQuery.isLoading}
          />
          <AppSelectFormField
            name='pricing_profile_id'
            control={control}
            label={t('products.management.form.fields.pricing_profile')}
            placeholder={
              pricingProfilesQuery.isLoading
                ? t('products.management.form.placeholders.loading_pricing_profiles')
                : t('products.management.form.placeholders.select_pricing_profile')
            }
            options={pricingProfileOptions}
            searchable
            required
            disabled={pricingProfilesQuery.isLoading}
          />
          <AppInputFormField
            name='name'
            control={control}
            label={t('products.management.form.fields.name')}
            placeholder={t('products.management.form.placeholders.name')}
            required
          />
          <AppInputFormField
            name='name_en'
            control={control}
            label={t('products.management.form.fields.name_en')}
            placeholder={t('products.management.form.placeholders.name_en')}
            required
          />
          <AppInputFormField
            name='slug'
            control={control}
            label={t('products.management.form.fields.slug')}
            placeholder={t('products.management.form.placeholders.slug')}
            required
          />
          <AppInputFormField
            name='sku'
            control={control}
            label={t('products.management.form.fields.sku')}
            placeholder={t('products.management.form.placeholders.sku')}
            required
          />
          <AppInputFormField
            name='price'
            control={control}
            label={t('products.management.form.fields.price')}
            type='number'
            placeholder={t('products.management.form.placeholders.price')}
            required
          />
          <AppTextareaFormField
            name='short_description'
            control={control}
            label={t('products.management.form.fields.short_description')}
            placeholder={t('products.management.form.placeholders.short_description')}
            required
          />
          <div className='md:col-span-2'>
            <AppTextareaFormField
              name='description'
              control={control}
              label={t('products.management.form.fields.description')}
              placeholder={t('products.management.form.placeholders.description')}
              minRows={5}
              required
            />
          </div>
        </div>
      </ProductFormSection>

      <ProductFormSection title={t('products.management.form.sections.status')}>
        <div className='grid gap-4 md:grid-cols-2'>
          <AppSwitchFormField
            name='is_active'
            control={control}
            label={t('products.management.form.fields.is_active')}
            description={isActive ? t('products.management.status.sold') : t('products.management.status.hidden')}
          />
          <AppSwitchFormField name='is_popular' control={control} label={t('products.management.form.fields.is_popular')} />
        </div>
      </ProductFormSection>

      <ProductFormSection title={t('products.management.form.sections.images')}>
        <div className='space-y-3'>
          <input
            ref={imageInputRef}
            type='file'
            accept='image/jpeg,image/png,image/jpg,image/webp,image/svg+xml'
            multiple
            className='hidden'
            onChange={handleAddProductImages}
          />
          <div className='space-y-1.5'>
            <AppFieldLabel label={t('products.management.form.fields.product_images')} required />
            <p className='text-muted-foreground text-xs'>{t('products.management.form.image_help', { maxSize: PRODUCT_IMAGE_MAX_SIZE_MB })}</p>
          </div>

          {imagesFieldArray.fields.length > 0 ? (
            <div className='flex flex-wrap gap-3'>
              {imagesFieldArray.fields.map((field, index) => {
                const fieldError = errors.images?.[index]?.url?.message;

                return (
                  <div
                    key={field.id}
                    className='bg-background flex w-full max-w-72 items-center gap-3 rounded-lg border p-2 shadow-sm sm:w-72'
                    data-invalid={fieldError ? 'true' : undefined}
                  >
                    <button
                      type='button'
                      className='bg-muted h-16 w-16 shrink-0 overflow-hidden rounded-md border'
                      onClick={() => setPreviewImageUrl(field.url)}
                      aria-label={t('products.management.form.aria.preview_product_image', { index: index + 1 })}
                    >
                      <img
                        src={field.url}
                        alt={t('products.management.form.alt.product_image', { index: index + 1 })}
                        className='size-full object-cover'
                      />
                    </button>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>{t('products.management.form.image_label', { index: index + 1 })}</p>
                      <p className='text-muted-foreground truncate text-xs'>{field.url}</p>
                      {fieldError ? <p className='text-destructive mt-1 text-xs'>{fieldError}</p> : null}
                    </div>
                    <div className='flex shrink-0 items-center gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => setPreviewImageUrl(field.url)}
                        aria-label={t('products.management.form.aria.preview_product_image', { index: index + 1 })}
                      >
                        <Eye className='size-4' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => imagesFieldArray.remove(index)}
                        disabled={uploadProductImageMutation.isPending}
                        aria-label={t('products.management.form.aria.remove_product_image', { index: index + 1 })}
                      >
                        <X className='size-4' />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-1.5'
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadProductImageMutation.isPending}
          >
            {uploadProductImageMutation.isPending ? <Loader2 className='size-4 animate-spin' /> : <Plus className='size-4' />}
            {uploadProductImageMutation.isPending
              ? t('products.management.form.actions.uploading_image')
              : t('products.management.form.actions.add_image')}
          </Button>

          {errors.images?.message ? <p className='text-destructive text-sm'>{errors.images.message}</p> : null}
        </div>
      </ProductFormSection>

      <ProductFormSection title={t('products.management.form.sections.editor_settings')}>
        <div ref={editorSectionRef}>
          {creationMethodError ? (
            <div className='border-destructive/30 bg-destructive/5 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm'>
              {creationMethodError}
            </div>
          ) : null}
          <div className='grid gap-4 md:grid-cols-2'>
            <AppSwitchFormField name='allow_file_upload' control={control} label={t('products.management.form.fields.allow_file_upload')} />
            <AppSwitchFormField name='allow_web_editor' control={control} label={t('products.management.form.fields.allow_web_editor')} />
            {allowWebEditor ? (
              <>
                {/* <AppSwitchFormField name='is_blank_canvas' control={control} label={t('products.management.form.fields.is_blank_canvas')} /> */}
                <AppSelectFormField
                  name='web_editor_id'
                  control={control}
                  label={t('products.management.form.fields.web_editor')}
                  placeholder={
                    webEditorsQuery.isLoading
                      ? t('products.management.form.placeholders.loading_web_editors')
                      : t('products.management.form.placeholders.select_web_editor')
                  }
                  options={webEditorOptions}
                  searchable
                  required
                  disabled={webEditorsQuery.isLoading}
                />
              </>
            ) : null}
          </div>
        </div>
      </ProductFormSection>

      <ProductFormSection title={t('products.management.form.sections.shipping')}>
        <div className='grid gap-4 md:grid-cols-2'>
          <AppSwitchFormField
            name='requires_separate_shipping'
            control={control}
            label={t('products.management.form.fields.requires_separate_shipping')}
          />
          {requiresSeparateShipping ? (
            <AppInputFormField
              name='separate_shipshipping'
              control={control}
              label={t('products.management.form.fields.separate_shipshipping')}
              type='number'
              suffix={<span className='text-xs'>원</span>}
              inputClassName='[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
              onKeyDown={blockSpecialNumericKeys}
              required
            />
          ) : null}
        </div>
      </ProductFormSection>

      <ProductFormSection title={t('products.management.form.sections.specification')}>
        <div className='grid gap-4 md:grid-cols-2'>
          <AppInputFormField
            name='specification.production_time_days'
            control={control}
            label={t('products.management.form.fields.production_days')}
            type='number'
            required
          />
          <div className='md:col-span-2'>
            <AppTextareaFormField
              name='specification.notes'
              control={control}
              label={t('products.management.form.fields.important_note')}
              minRows={5}
            />
          </div>
        </div>
      </ProductFormSection>

      <ProductFormSection title={t('products.management.form.sections.option_groups')}>
        <div className='space-y-4'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='w-full max-w-md'>
              <AppInput
                value={optionSearch}
                onValueChange={setOptionSearch}
                placeholder={t('products.management.form.placeholders.search_options')}
                prefix={<Search className='size-4' />}
              />
            </div>

            <AppSwitchFormField name='is_book_product' control={control} label={t('products.management.form.fields.is_book_product')} />
          </div>

          {isLoadingOptions ? (
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <Loader2 className='size-4 animate-spin' />
              {t('products.management.form.messages.loading_option_groups')}
            </div>
          ) : null}

          {optionGroupError ? (
            <div className='border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm'>{optionGroupError}</div>
          ) : null}

          {isBookProduct ? (
            <div className='grid gap-4 lg:grid-cols-2'>
              {availableBookOptionSections.map((section) => (
                <div key={section.titleKey} className='rounded-lg border p-4'>
                  <div className='mb-4 flex items-center gap-2'>
                    <h3 className='text-sm font-semibold'>{t(`products.management.form.book_layout.sections.${section.titleKey}`)}</h3>
                    {section.required ? (
                      <span className='rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800'>{t('products.management.form.required')}</span>
                    ) : null}
                  </div>
                  <div className={section.fields.length === 1 ? 'grid gap-4' : 'grid gap-4 sm:grid-cols-2'}>
                    {section.fields.map((field) => {
                      const sourceGroup = bookSourceGroupByCode.get(field.sourceGroupCode);
                      const fieldLabel = t(`products.management.form.book_layout.fields.${field.labelKey}`);
                      const sortedOptions = sortErpOptions(sourceGroup?.erp_options ?? []);
                      const selectedOptions = new Set(selectedBookOptionMap?.[field.code] ?? []);
                      const areAllOptionsSelected =
                        sourceGroup?.erp_options.length && sourceGroup.erp_options.every((option) => selectedOptions.has(String(option.id)));

                      return (
                        <div key={field.code} className='rounded-md border p-3'>
                          <div className='flex items-start justify-between gap-2'>
                            <div>
                              <p className='text-sm font-semibold'>
                                {fieldLabel} <span className='text-muted-foreground font-normal'>({sourceGroup?.code ?? field.sourceGroupCode})</span>
                              </p>
                              {sourceGroup ? (
                                <p className='text-muted-foreground text-xs'>
                                  {/*
                                  {sourceGroup.type} Â· {sourceGroup.display_type} Â·{' '}
                                  */}
                                  {sourceGroup.type} {'\u00b7'} {sourceGroup.display_type} {'\u00b7'}{' '}
                                  {t('products.management.form.option_count', { count: sourceGroup.erp_options.length })}
                                </p>
                              ) : null}
                            </div>
                            {sourceGroup ? (
                              <label className='flex shrink-0 cursor-pointer items-center gap-1.5 text-xs'>
                                <span>{t('products.management.form.select_all_options')}</span>
                                <input
                                  type='checkbox'
                                  checked={Boolean(areAllOptionsSelected)}
                                  onChange={(event) => handleAllBookOptionsToggle(field.code, sourceGroup, event.target.checked)}
                                  aria-label={t('products.management.form.aria.select_all_group_options', { group: fieldLabel })}
                                />
                              </label>
                            ) : null}
                          </div>
                          <div className='mt-3 max-h-64 space-y-2 overflow-y-auto pr-1'>
                            {sortedOptions.map((option) => {
                              const optionId = String(option.id);
                              return (
                                <label key={option.id} className='hover:bg-muted/60 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5'>
                                  <input
                                    type='checkbox'
                                    checked={selectedOptions.has(optionId)}
                                    onChange={(event) => handleBookOptionToggle(field.code, optionId, event.target.checked)}
                                    className='mt-1'
                                  />
                                  <span className='block min-w-0 flex-1 truncate text-sm'>{option.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className='grid gap-4 lg:grid-cols-2'>
            {filteredOptionGroups.map((group) => {
              const groupId = String(group.id);
              const isRequiredGroup = isBookProduct ? group.is_required : group.code === 'size';
              const isSelected = selectedGroupIdSet.has(groupId);
              const sortedOptions = sortErpOptions(group.erp_options);
              const selectedOptions = new Set(selectedOptionMap[groupId] ?? []);
              const areAllOptionsSelected =
                group.erp_options.length > 0 && group.erp_options.every((option) => selectedOptions.has(String(option.id)));

              return (
                <div key={group.id} className='rounded-lg border p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <label className='flex min-w-0 items-start gap-2'>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        disabled={isRequiredGroup}
                        onChange={(event) => handleGroupToggle(group, event.target.checked)}
                        className='mt-1'
                      />
                      <span className='min-w-0'>
                        <span className='block truncate text-sm font-semibold'>
                          {group.label} <span className='text-muted-foreground font-normal'>({group.code})</span>
                        </span>
                        <span className='text-muted-foreground text-xs'>
                          {group.type} · {group.display_type} · {t('products.management.form.option_count', { count: group.erp_options.length })}
                        </span>
                      </span>
                    </label>
                    <div className='flex shrink-0 items-center gap-2'>
                      {isSelected ? (
                        <label className='flex cursor-pointer items-center gap-1.5 text-xs'>
                          <span>{t('products.management.form.select_all_options')}</span>
                          <input
                            type='checkbox'
                            checked={areAllOptionsSelected}
                            onChange={(event) => handleAllOptionsToggle(group, event.target.checked)}
                            aria-label={t('products.management.form.aria.select_all_group_options', { group: group.label })}
                          />
                        </label>
                      ) : null}
                      {isRequiredGroup ? (
                        <span className='rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800'>{t('products.management.form.required')}</span>
                      ) : null}
                    </div>
                  </div>

                  {isSelected ? (
                    <div className='mt-4 max-h-64 space-y-2 overflow-y-auto pr-1'>
                      {sortedOptions.map((option) => {
                        const optionId = String(option.id);
                        return (
                          <label key={option.id} className='hover:bg-muted/60 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5'>
                            <input
                              type='checkbox'
                              checked={selectedOptions.has(optionId)}
                              onChange={(event) => handleOptionToggle(groupId, optionId, event.target.checked)}
                              className='mt-1'
                            />
                            <span className='min-w-0 flex-1'>
                              <span className='block truncate text-sm'>{option.label}</span>
                              {/* <span className='text-muted-foreground text-xs'>
                                {t('products.management.form.option_value')}: {option.value} · {t('products.management.form.option_additional')}:{' '}
                                {option.additional_price}
                              </span> */}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </ProductFormSection>

      <ProductFormSection title={'수량 옵션'}>
        <div className='space-y-3'>
          {quantityPricesFieldArray.fields.map((field, index) => (
            <div key={field.id} className='p-x-0 flex gap-2 rounded-lg'>
              <AppInputFormField
                name={`quantity_prices.${index}.quantity`}
                control={control}
                // label={t('products.management.form.fields.quantity')}
                type='number'
                required
                className='max-w-32'
                suffix='매 / 부'
              />
              {/* <AppInputFormField
                name={`quantity_prices.${index}.price`}
                control={control}
                label={t('products.management.form.fields.price')}
                type='number'
                required
              /> */}
              <Button
                type='button'
                variant='destructive'
                size='icon'
                // className='mt-6'
                onClick={() => quantityPricesFieldArray.remove(index)}
                disabled={quantityPricesFieldArray.fields.length <= 1}
                aria-label={t('products.management.form.aria.remove_quantity_price')}
              >
                <Trash2 className='size-4' />
              </Button>
            </div>
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-1.5 bg-gray-200'
            onClick={() =>
              quantityPricesFieldArray.append({
                quantity: '100',
                price: '0',
              })
            }
          >
            <Plus className='size-4' />
            {'수량 등록'}
          </Button>
        </div>
      </ProductFormSection>

      {/* <ProductFormSection title={t('products.management.form.sections.product_sets')}>
        <div className='grid gap-4 md:grid-cols-4'>
          <AppInputFormField
            name='product_sets.quantity'
            control={control}
            label={t('products.management.form.fields.quantity')}
            type='number'
            required
          />
          <AppInputFormField
            name='product_sets.min_set'
            control={control}
            label={t('products.management.form.fields.min_set')}
            type='number'
            required
          />
          <AppInputFormField
            name='product_sets.max_set'
            control={control}
            label={t('products.management.form.fields.max_set')}
            type='number'
            required
          />
          <AppInputFormField
            name='product_sets.step_set'
            control={control}
            label={t('products.management.form.fields.step_set')}
            type='number'
            required
          />
        </div>
      </ProductFormSection> */}

      <ProductFormSection title={t('products.management.form.sections.info_icon')}>
        <p className='text-muted-foreground text-xs'>{t('products.management.form.info_icon_help')}</p>
        <div className='grid gap-4 md:grid-cols-2'>
          {PRODUCT_INFO_ICON_FIELDS.map((field) => (
            <AppTextareaFormField
              key={field}
              name={`info_icon.${field}`}
              control={control}
              label={t(`products.management.form.fields.info_icon.${field}`)}
              placeholder={t('products.management.form.placeholders.info_icon')}
              minRows={4}
            />
          ))}
        </div>
      </ProductFormSection>

      {/*Shoppping Setting Section */}
      <ProductFormSection title={t('products.management.form.sections.shopping_settings')}>
        <p className='text-muted-foreground text-xs'>{t('products.management.form.shopping_settings_help')}</p>
        {shoppingSettingsQuery.isLoading ? (
          <div className='flex min-h-20 items-center justify-center'>
            <Loader2 className='text-muted-foreground size-5 animate-spin' />
          </div>
        ) : shoppingSettings.length === 0 ? (
          <p className='text-muted-foreground text-sm'>{t('products.management.form.no_shopping_setting_items')}</p>
        ) : (
          <div className='space-y-4'>
            {shoppingSettings.map((setting) => (
              <div key={setting.id} className='space-y-2 rounded-lg border p-4'>
                <h3 className='text-sm font-medium'>{setting.title || setting.type}</h3>
                <ShoppingSettingItemSelector
                  setting={setting}
                  selectedItemIds={selectedShoppingSettingItemIds}
                  disabled={isSubmitting}
                  onSelect={handleShoppingSettingItemSelect}
                />
              </div>
            ))}
          </div>
        )}
      </ProductFormSection>

      <div className='bg-background/95 fixed right-4 bottom-4 z-40 flex gap-3 rounded-lg border p-3 shadow-lg backdrop-blur sm:right-6 sm:bottom-6'>
        <AppButton type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
          {t('products.management.form.actions.cancel')}
        </AppButton>
        <AppButton
          type='submit'
          isLoading={isSubmitting}
          loadingText={mode === 'edit' ? t('products.management.form.actions.updating') : t('products.management.form.actions.creating')}
        >
          {mode === 'edit' ? t('products.management.form.actions.update_product') : t('products.management.form.actions.create_product')}
        </AppButton>
      </div>

      <Dialog open={Boolean(previewImageUrl)} onOpenChange={(isOpen) => !isOpen && setPreviewImageUrl(undefined)}>
        <DialogContent className='w-fit max-w-[calc(100vw-2rem)] bg-white p-3 sm:max-w-[90vw]' overlayClassName='bg-black/50 backdrop-blur-none'>
          <DialogTitle className='sr-only'>{t('products.management.form.preview_title')}</DialogTitle>
          {previewImageUrl ? (
            <div className='h-[min(calc(90vh-4rem),36rem)] w-[min(calc(100vw-3.5rem),45rem)]'>
              <img src={previewImageUrl} alt={t('products.management.form.alt.product_preview')} className='size-full rounded-lg object-contain' />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </form>
  );
}
