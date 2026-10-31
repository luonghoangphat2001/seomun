import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import type { AppSelectOption } from '@/components/shared/app-select';

import { useCategoryDetailQuery, useCategoryListQuery, useUploadExposureImageMutation } from '../api/category.query';
import { toFormValues } from '../api/category.service';
import { CATEGORY_LEVEL, CATEGORY_STATUS } from '../enums';
import { categoryFormSchema, type CategoryFormData } from '../schemas';
import { flattenCategories, translateFormErrors, type CategoryFormApiErrors, type FlatCategoryOption } from '../utils';
import { CategoryBasicInfoSection } from './components/CategoryBasicInfoSection';
import { CategoryChildrenSection } from './components/CategoryChildrenSection';
import { CategoryDisplaySettingsSection } from './components/CategoryDisplaySettingsSection';
import { CategoryImageSettingsSection } from './components/CategoryImageSettingsSection';
import { CategoryRegistrationInfoSection } from './components/CategoryRegistrationInfoSection';

type CategoryFormProps = {
  categoryId?: number;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isImageUploading?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
  submissionErrors?: CategoryFormApiErrors;
  mode: 'create' | 'edit' | 'view';
};

// Keep the implementation available while PM confirms whether this non-FSD field belongs in the form.
const SHOW_UNCONFIRMED_IMAGE_SETTINGS = false;

export function CategoryForm({
  categoryId,
  onSubmit,
  onCancel,
  isLoading = false,
  isImageUploading = false,
  onUploadImage,
  submissionErrors,
  mode,
}: CategoryFormProps) {
  const { t: tPage } = useTranslation();
  const { t } = useTranslation('form');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');

  const isReadOnly = mode === 'view';
  const isEdit = mode === 'edit';
  const shouldFetchDetail = (isEdit || isReadOnly) && Boolean(categoryId);

  const detailQuery = useCategoryDetailQuery(categoryId ?? 0, {
    enabled: shouldFetchDetail,
  });

  const categoriesQuery = useCategoryListQuery(
    {
      page: 1,
      per_page: 99,
    },
    {
      enabled: !isReadOnly,
    },
  );

  const uploadMutation = useUploadExposureImageMutation();

  const category = detailQuery.data;
  const fieldLabels = useMemo(
    () => ({
      code: t('categories.fields.code'),
      name: t('categories.fields.name'),
      rank: t('categories.fields.sort_order'),
      status: t('categories.fields.status'),
      display_start_date: t('categories.fields.display_start_date'),
      exposure_order: t('categories.fields.exposure_order'),
    }),
    [t],
  );

  const resolver = useMemo<Resolver<CategoryFormData>>(
    () => async (values, context, options) => {
      const result = await zodResolver(categoryFormSchema)(values, context, options);
      translateFormErrors(result.errors as Record<string, { message?: string } | undefined>, fieldLabels, tValidation);
      return result;
    },
    [fieldLabels, tValidation],
  );

  const form = useForm<CategoryFormData>({
    resolver,
    defaultValues: toFormValues(category),
  });

  const { control, handleSubmit, reset, setError, setValue } = form;

  useEffect(() => {
    if (category || mode === 'create') {
      reset(toFormValues(category));
    }
  }, [category, mode, reset]);

  useEffect(() => {
    if (!submissionErrors) return;

    Object.entries(submissionErrors).forEach(([field, message]) => {
      if (message) {
        setError(field as keyof CategoryFormData, { type: 'server', message });
      }
    });
  }, [setError, submissionErrors]);

  const parentOptions = useMemo<FlatCategoryOption[]>(() => {
    const categories = categoriesQuery.data?.data.categories ?? [];

    return [
      {
        value: '0',
        label: t('categories.fields.none_parent'),
        level: 0,
      },
      ...flattenCategories(categories, categoryId),
    ];
  }, [categoriesQuery.data?.data.categories, categoryId, t]);

  const levelOptions = useMemo<AppSelectOption<CATEGORY_LEVEL>[]>(
    () => [
      { value: CATEGORY_LEVEL.LARGE, label: t('categories.fields.level_large') },
      { value: CATEGORY_LEVEL.MEDIUM, label: t('categories.fields.level_medium') },
      { value: CATEGORY_LEVEL.SMALL, label: t('categories.fields.level_small') },
    ],
    [t],
  );

  const statusOptions = useMemo<AppSelectOption<CATEGORY_STATUS>[]>(
    () => [
      { value: CATEGORY_STATUS.ACTIVE, label: t('categories.fields.status_active') },
      { value: CATEGORY_STATUS.HIDDEN, label: t('categories.fields.status_hidden') },
    ],
    [t],
  );
  const statusLabelByValue = useMemo(() => new Map(statusOptions.map((option) => [option.value, option.label])), [statusOptions]);

  const handleParentChange = useCallback(
    (parentId: string) => {
      const parentLevel = parentOptions.find((option) => option.value === parentId)?.categoryLevel;
      const nextLevel =
        parentLevel === undefined ? CATEGORY_LEVEL.LARGE : parentLevel === CATEGORY_LEVEL.LARGE ? CATEGORY_LEVEL.MEDIUM : CATEGORY_LEVEL.SMALL;

      setValue('level', nextLevel, { shouldDirty: true, shouldValidate: true });
    },
    [parentOptions, setValue],
  );

  const selectedLevel = useWatch({ control, name: 'level' });
  const isDetailLoading = shouldFetchDetail && detailQuery.isLoading;
  const isPending = isLoading || uploadMutation.isPending;
  const uploadBannerImage = useCallback(
    async (file: File) => {
      const response = await uploadMutation.mutateAsync({ file, type: 'banner' });
      return response.data.url;
    },
    [uploadMutation],
  );
  const uploadIconImage = useCallback(
    async (file: File) => {
      const response = await uploadMutation.mutateAsync({ file, type: 'icon' });
      return response.data.url;
    },
    [uploadMutation],
  );

  if (isDetailLoading) {
    return (
      <div className='bg-white'>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600' />
            <p className='mt-4 text-sm text-gray-600'>{tCommon('message.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (shouldFetchDetail && detailQuery.isError) {
    return (
      <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
        <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
          <AlertCircle className='size-6' />
        </div>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>{tPage('page.category.list.error.load_title')}</h2>
          <p className='text-muted-foreground text-sm'>{tPage('page.category.list.error.load_description')}</p>
        </div>
        <AppButton type='button' variant='outline' onClick={() => void detailQuery.refetch()} disabled={detailQuery.isFetching}>
          {detailQuery.isFetching ? <Loader2 className='mr-2 size-4 animate-spin' /> : null}
          {tPage('page.category.list.retry')}
        </AppButton>
      </div>
    );
  }

  return (
    <div className='bg-white'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
        <CategoryBasicInfoSection
          category={category}
          control={control}
          parentOptions={parentOptions}
          onParentChange={handleParentChange}
          levelOptions={levelOptions}
          statusOptions={statusOptions}
          selectedLevel={selectedLevel}
          isEdit={isEdit}
          isReadOnly={isReadOnly}
          isCategoryListLoading={categoriesQuery.isLoading}
        />

        {SHOW_UNCONFIRMED_IMAGE_SETTINGS ? (
          <CategoryImageSettingsSection control={control} isReadOnly={isReadOnly} isImageUploading={isImageUploading} onUploadImage={onUploadImage} />
        ) : null}

        <CategoryDisplaySettingsSection
          control={control}
          isReadOnly={isReadOnly}
          isBannerUploading={uploadMutation.isPending && uploadMutation.variables?.type === 'banner'}
          isIconUploading={uploadMutation.isPending && uploadMutation.variables?.type === 'icon'}
          onUploadBanner={uploadBannerImage}
          onUploadIcon={uploadIconImage}
        />

        <CategoryChildrenSection childrenCategories={category?.children ?? []} statusLabelByValue={statusLabelByValue} />

        {(isEdit || isReadOnly) && category ? <CategoryRegistrationInfoSection category={category} /> : null}

        {!isReadOnly ? (
          <div className='flex justify-end gap-3 border-t pt-6'>
            <AppButton type='button' variant='outline' onClick={onCancel} disabled={isPending}>
              {tCommon('action.cancel')}
            </AppButton>
            <AppButton type='submit' isLoading={isPending} loadingText={tCommon('message.saving')}>
              {mode === 'create' ? tCommon('action.create', { module: t('categories.module') }) : tCommon('action.save')}
            </AppButton>
          </div>
        ) : null}
      </form>
    </div>
  );
}
