import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppSingleImageUpload } from '@/components/shared/app-single-image-upload';
import { AppFormField, AppInputFormField } from '@/components/shared/form-fields';

import type { CategoryFormData } from '../../schemas';
import { CategoryFormSection } from './CategoryFormSection';

type CategoryImageSettingsSectionProps = {
  control: Control<CategoryFormData>;
  isReadOnly: boolean;
  isImageUploading?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
};

export function CategoryImageSettingsSection({ control, isReadOnly, isImageUploading = false, onUploadImage }: CategoryImageSettingsSectionProps) {
  const { t } = useTranslation('form');

  return (
    <CategoryFormSection title={t('categories.sections.image_settings')}>
      {onUploadImage ? (
        <Controller
          control={control}
          name='image'
          render={({ field, fieldState: { error } }) => (
            <AppFormField label={t('categories.fields.main_image')} error={error?.message} disabled={isReadOnly}>
              {() => (
                <AppSingleImageUpload
                  label={t('categories.fields.main_image')}
                  value={field.value}
                  onChange={(value) => field.onChange(typeof value === 'string' ? value : '')}
                  onUpload={onUploadImage}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  previewClassName='h-48'
                  imageClassName='max-h-48'
                  isUploading={isImageUploading}
                />
              )}
            </AppFormField>
          )}
        />
      ) : (
        <AppInputFormField
          name='image'
          control={control}
          label={t('categories.fields.main_image')}
          placeholder={t('categories.placeholders.main_image')}
          readOnly={isReadOnly}
        />
      )}
    </CategoryFormSection>
  );
}
