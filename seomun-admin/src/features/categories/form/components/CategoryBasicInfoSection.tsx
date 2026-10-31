import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { type AppSelectOption } from '@/components/shared/app-select';
import { AppFormField, AppInputFormField, AppSelectFormField, AppSwitchFormField, AppTextareaFormField } from '@/components/shared/form-fields';

import type { Category } from '../../api/category.response';
import type { CATEGORY_LEVEL, CATEGORY_STATUS } from '../../enums';
import type { CategoryFormData } from '../../schemas';
import type { FlatCategoryOption } from '../../utils';
import { CategoryFormSection } from './CategoryFormSection';

type CategoryBasicInfoSectionProps = {
  category?: Category | null;
  control: Control<CategoryFormData>;
  parentOptions: FlatCategoryOption[];
  onParentChange: (parentId: string) => void;
  levelOptions: AppSelectOption<CATEGORY_LEVEL>[];
  statusOptions: AppSelectOption<CATEGORY_STATUS>[];
  selectedLevel: CATEGORY_LEVEL;
  isEdit: boolean;
  isReadOnly: boolean;
  isCategoryListLoading: boolean;
};

export function CategoryBasicInfoSection({
  //category,
  control,
  // parentOptions,
  // onParentChange,
  // levelOptions,
  statusOptions,
  //selectedLevel,
  isEdit,
  isReadOnly,
  //isCategoryListLoading,
}: CategoryBasicInfoSectionProps) {
  const { t } = useTranslation('form');

  return (
    <CategoryFormSection title={t('categories.sections.basic_info')}>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <AppInputFormField
          name='code'
          control={control}
          label={t('categories.fields.code')}
          placeholder={t('categories.placeholders.code')}
          required
          readOnly={isEdit || isReadOnly}
        />

        <AppInputFormField
          name='name'
          control={control}
          label={t('categories.fields.name')}
          placeholder={t('categories.placeholders.name')}
          required
          readOnly={isReadOnly}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <AppInputFormField
          name='name_en'
          control={control}
          label={t('categories.fields.name_en')}
          placeholder={t('categories.placeholders.name_en')}
          readOnly={isReadOnly}
        />

        <AppInputFormField
          name='slug'
          control={control}
          label={t('categories.fields.slug')}
          placeholder={t('categories.placeholders.slug')}
          readOnly={isReadOnly}
        />
      </div>

      <AppTextareaFormField
        name='description'
        control={control}
        label={t('categories.fields.description')}
        placeholder={t('categories.placeholders.description')}
        minRows={3}
        readOnly={isReadOnly}
      />

      {/* <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {isReadOnly ? (
          <AppFormField label={t('categories.fields.parent_category')} disabled>
            {() => (
              <div className='bg-muted/40 border-border/80 flex h-10 items-center rounded-lg border px-3 text-sm'>
                {category?.parent ? `${category.parent.name} (ID: ${category.parent.id})` : t('categories.fields.none_parent')}
              </div>
            )}
          </AppFormField>
        ) : (
          <Controller
            control={control}
            name='parentId'
            render={({ field, fieldState: { error } }) => (
              <AppFormField label={t('categories.fields.parent_category')} error={error?.message} disabled={isCategoryListLoading}>
                {({ id, labelId, describedBy, isInvalid }) => (
                  <AppSelect
                    id={id}
                    value={field.value || '0'}
                    onValueChange={(value) => {
                      const parentId = value === '0' ? '' : (value ?? '');
                      field.onChange(parentId);
                      onParentChange(parentId);
                    }}
                    options={parentOptions}
                    placeholder={isCategoryListLoading ? tCommon('message.loading') : t('categories.placeholders.parent_category')}
                    searchable
                    disabled={isCategoryListLoading}
                    isInvalid={isInvalid}
                    aria-labelledby={labelId}
                    aria-describedby={describedBy}
                    contentClassName='max-h-75'
                  />
                )}
              </AppFormField>
            )}
          />
        )}

        <AppFormField label={t('categories.fields.level')} disabled>
          {() => (
            <div className='bg-muted/40 border-border/80 flex h-10 items-center rounded-lg border px-3 text-sm'>
              {levelOptions.find((option) => option.value === selectedLevel)?.label ?? selectedLevel}
            </div>
          )}
        </AppFormField>
      </div> */}

      <div className='space-y-4'>
        <AppSelectFormField
          name='status'
          control={control}
          label={t('categories.fields.status')}
          options={statusOptions}
          placeholder={t('categories.placeholders.status')}
          required
          disabled={isReadOnly}
          fieldClassName='w-fit'
          className='w-34'
          contentClassName='w-34'
        />

        <AppSwitchFormField name='is_best' control={control} label={t('categories.fields.best_category')} disabled={isReadOnly} />

        <Controller
          control={control}
          name='rank'
          render={({ field, fieldState: { error } }) => (
            <AppFormField label={t('categories.fields.sort_order')} error={error?.message} required disabled={isReadOnly}>
              {({ id, describedBy, isInvalid }) => (
                <AppInput
                  id={id}
                  ref={field.ref}
                  name={field.name}
                  type='number'
                  value={String(field.value ?? 0)}
                  onValueChange={(value) => field.onChange(Number(value) || 0)}
                  onBlur={field.onBlur}
                  placeholder={t('categories.placeholders.sort_order')}
                  disabled={isReadOnly}
                  isInvalid={isInvalid}
                  className='w-25'
                  aria-describedby={describedBy}
                />
              )}
            </AppFormField>
          )}
        />

        {/* <Controller
          control={control}
          name='exposure_order'
          render={({ field, fieldState: { error } }) => (
            <AppFormField label={t('categories.fields.exposure_order')} error={error?.message} disabled={isReadOnly}>
              {({ id, describedBy, isInvalid }) => (
                <AppInput
                  id={id}
                  ref={field.ref}
                  name={field.name}
                  type='number'
                  value={String(field.value ?? '')}
                  onValueChange={(value) => field.onChange(Number(value) || 0)}
                  onBlur={field.onBlur}
                  placeholder={t('categories.placeholders.exposure_order')}
                  disabled={isReadOnly}
                  isInvalid={isInvalid}
                  aria-describedby={describedBy}
                />
              )}
            </AppFormField>
          )}
        /> */}
      </div>
    </CategoryFormSection>
  );
}
