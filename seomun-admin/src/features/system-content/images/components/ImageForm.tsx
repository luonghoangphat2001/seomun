import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { File, FileText } from 'lucide-react';

import { AppLabel } from '@/components/shared/app-label';
import { AppSelectFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { FileType } from '@/enums';
import { FormMode } from '@/enums/form.enum';

import type { ImageRESP } from '../api';
import { toImageFormValues } from '../api/image.service';
import { formatFileSize, getImageFileTypeOptions, IMAGE_CATEGORY_LABELS } from '../constants';
import { createImageFormSchema, type ImageFormValues } from '../schemas';
import { FilePreviewModal } from './FilePreviewModal';
import type { ImageUploadValue } from './ImageUpload';
import { ImageUpload } from './ImageUpload';

// === Types ===

type ImageFormProps = {
  mode: FormMode;
  image?: ImageRESP;
  isPending: boolean;
  onCancel: () => void;
  onSubmit?: (values: ImageFormValues) => void;
};

// === Component ===

export function ImageForm({ mode, image, isPending, onCancel, onSubmit }: ImageFormProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidate } = useTranslation('validation');

  const isEditMode = mode === FormMode.EDIT;
  const isDetailMode = mode === FormMode.DETAIL;

  const { control, handleSubmit, reset, setValue, watch } = useForm<ImageFormValues>({
    resolver: zodResolver(createImageFormSchema(tValidate)),
    defaultValues: toImageFormValues(image),
  });

  useEffect(() => {
    reset(toImageFormValues(image));
  }, [image, reset]);

  const watchedUrl = watch('url');
  const watchedPath = watch('path');
  const watchedMimeType = watch('mime_type');
  const watchedType = watch('type');

  const typeOptions = getImageFileTypeOptions(t);

  const uploadValue: ImageUploadValue | undefined = watchedUrl
    ? { url: watchedUrl, path: watchedPath, name: '', mime_type: watchedMimeType }
    : undefined;

  const handleImageChange = (val: ImageUploadValue | undefined) => {
    setValue('url', val?.url ?? '', { shouldValidate: true });
    setValue('path', val?.path ?? '');
    setValue('mime_type', val?.mime_type ?? '');
  };

  // === Detail mode: read-only display ===

  if (isDetailMode && image) {
    const categoryLabel = IMAGE_CATEGORY_LABELS[image.type as keyof typeof IMAGE_CATEGORY_LABELS]?.(t) ?? image.type;
    return (
      <div className='space-y-4'>
        <section className='bg-card rounded-xl border'>
          <div className='px-6 py-4'>
            <h2 className='text-sm font-semibold'>{t('images.form.section.image')}</h2>
          </div>
          <Separator />
          <div className='p-6'>
            {image.url ? (
              <div className='relative overflow-hidden rounded-lg border'>
                {image.mime_type?.startsWith('image/') ? (
                  <img src={image.url} alt={image.name} className='bg-muted/30 h-48 w-full object-contain' />
                ) : (
                  <div className='bg-muted/30 flex h-48 flex-col items-center justify-center gap-3'>
                    {image.mime_type === 'application/pdf' ? (
                      <FileText className='size-12 text-red-400' />
                    ) : (
                      <File className='size-12 text-blue-400' />
                    )}
                    <span className='text-muted-foreground max-w-xs truncate text-sm'>{image.name}</span>
                  </div>
                )}
                <div className='absolute top-2 right-2'>
                  <FilePreviewModal url={image.url} mimeType={image.mime_type ?? ''} name={image.name} />
                </div>
              </div>
            ) : (
              <div className='bg-muted/30 flex h-48 items-center justify-center rounded-lg border'>
                <span className='text-muted-foreground text-sm'>{t('images.form.field.image')}</span>
              </div>
            )}
          </div>
        </section>

        <section className='bg-card rounded-xl border'>
          <div className='px-6 py-4'>
            <h2 className='text-sm font-semibold'>{t('images.form.section.detail')}</h2>
          </div>
          <Separator />
          <dl className='grid grid-cols-2 gap-x-8 gap-y-4 p-6'>
            <div>
              <dt className='text-muted-foreground text-xs'>{t('images.form.field.name')}</dt>
              <dd className='mt-1 truncate text-sm font-medium'>{image.name}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-xs'>{t('images.form.field.type')}</dt>
              <dd className='mt-1'>
                <span className='bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium'>{categoryLabel}</span>
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-xs'>{t('images.form.field.mime_type')}</dt>
              <dd className='mt-1 text-sm'>{image.mime_type}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-xs'>{t('images.form.field.size')}</dt>
              <dd className='mt-1 text-sm'>{formatFileSize(image.size)}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-xs'>{t('images.form.field.uploaded_by')}</dt>
              <dd className='mt-1 text-sm'>{image.created_by?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-xs'>{t('images.form.field.upload_date')}</dt>
              <dd className='mt-1 text-sm'>{image.created_at.slice(0, 10)}</dd>
            </div>
          </dl>
        </section>

        <div className='flex items-center justify-end'>
          <Button type='button' variant='outline' onClick={onCancel}>
            {tCommon('action.back', 'Back')}
          </Button>
        </div>
      </div>
    );
  }

  // === Create / Edit mode ===

  return (
    <form noValidate onSubmit={onSubmit ? handleSubmit(onSubmit) : (e) => e.preventDefault()} className='space-y-4'>
      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('images.form.section.metadata')}</h2>
        </div>
        <Separator />
        <div className='grid grid-cols-2 gap-x-4 gap-y-4 p-6'>
          <AppSelectFormField
            name='type'
            control={control}
            label={t('images.form.field.type')}
            placeholder={t('images.form.field.type_placeholder')}
            options={typeOptions}
            clearable={false}
            required
            disabled={isEditMode || isPending}
          />
        </div>
      </section>

      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('images.form.section.image')}</h2>
        </div>
        <Separator />
        <div className='p-6'>
          <Controller
            control={control}
            name='url'
            render={({ fieldState }) => (
              <div className='flex flex-col gap-1.5'>
                <AppLabel label={t('images.form.field.image')} htmlFor='image-upload' required />
                <ImageUpload value={uploadValue} onChange={handleImageChange} fileType={watchedType as FileType | undefined} disabled={isPending} />
                {fieldState.error && <p className='text-destructive text-xs'>{fieldState.error.message}</p>}
              </div>
            )}
          />
        </div>
      </section>

      <div className='flex items-center justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
          {tCommon('action.cancel', 'Cancel')}
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending
            ? tCommon('message.saving', 'Saving...')
            : isEditMode
              ? tCommon('action.save', 'Save')
              : tCommon('action.create', { module: '' })}
        </Button>
      </div>
    </form>
  );
}
