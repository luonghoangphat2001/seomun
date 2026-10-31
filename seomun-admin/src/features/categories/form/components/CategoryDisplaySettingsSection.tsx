import { Controller, useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppSingleImageUpload } from '@/components/shared/app-single-image-upload';
import { AppDatePickerFormField, AppFormField } from '@/components/shared/form-fields';

import type { CategoryFormData } from '../../schemas';
import { CategoryFormSection } from './CategoryFormSection';

type CategoryDisplaySettingsSectionProps = {
  control: Control<CategoryFormData>;
  isReadOnly: boolean;
  isBannerUploading: boolean;
  isIconUploading: boolean;
  onUploadBanner: (file: File) => Promise<string>;
  onUploadIcon: (file: File) => Promise<string>;
};

// Banner is not listed in the current category FSD; retain it pending PM confirmation.
const SHOW_UNCONFIRMED_DISPLAY_FIELDS = false;

export function CategoryDisplaySettingsSection({
  control,
  isReadOnly,
  isBannerUploading,
  isIconUploading,
  onUploadBanner,
  onUploadIcon,
}: CategoryDisplaySettingsSectionProps) {
  const { t } = useTranslation('form');
  const today = new Date();
  const displayStartDate = useWatch({ control, name: 'display_start_date' });
  const displayEndDate = useWatch({ control, name: 'display_end_date' });

  return (
    <CategoryFormSection title={t('categories.sections.display_settings')}>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {SHOW_UNCONFIRMED_DISPLAY_FIELDS ? (
          <Controller
            control={control}
            name='banner_image'
            render={({ field, fieldState: { error } }) => (
              <AppFormField label={t('categories.fields.banner_image')} error={error?.message} disabled={isReadOnly}>
                {() => (
                  <AppSingleImageUpload
                    label={t('categories.fields.banner_image')}
                    value={field.value}
                    onChange={(value) => field.onChange(typeof value === 'string' ? value : '')}
                    onUpload={onUploadBanner}
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    previewClassName='h-32'
                    imageClassName='max-h-32'
                    isUploading={isBannerUploading}
                  />
                )}
              </AppFormField>
            )}
          />
        ) : null}

        <Controller
          control={control}
          name='icon_image'
          render={({ field, fieldState: { error } }) => (
            <AppFormField label={t('categories.fields.icon_image')} error={error?.message} disabled={isReadOnly}>
              {() => (
                <AppSingleImageUpload
                  label={t('categories.fields.icon_image')}
                  value={field.value}
                  onChange={(value) => field.onChange(typeof value === 'string' ? value : '')}
                  onUpload={onUploadIcon}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  previewClassName='h-32'
                  imageClassName='max-h-32'
                  isUploading={isIconUploading}
                />
              )}
            </AppFormField>
          )}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <AppDatePickerFormField
          name='display_start_date'
          control={control}
          label={t('categories.fields.display_start_date')}
          placeholder={t('categories.placeholders.display_start_date')}
          minDate={today}
          maxDate={displayEndDate ?? undefined}
          className='h-10'
          disabled={isReadOnly}
          clearable
        />

        <AppDatePickerFormField
          name='display_end_date'
          control={control}
          label={t('categories.fields.display_end_date')}
          placeholder={t('categories.placeholders.display_end_date')}
          minDate={displayStartDate ?? today}
          className='h-10'
          disabled={isReadOnly}
          clearable
        />
      </div>
    </CategoryFormSection>
  );
}
