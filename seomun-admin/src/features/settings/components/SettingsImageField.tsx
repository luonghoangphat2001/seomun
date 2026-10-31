import { ImageOff, Loader2, Trash2, Upload, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import { SETTINGS_FIELD_CLASS, SETTINGS_IMAGE_ACCEPT, SETTINGS_IMAGE_MAX_SIZE_MB } from '../constants';

// Created in an effect (not useMemo) so StrictMode's mount → unmount → mount doesn't leave a revoked URL behind.
export function useObjectUrl(blob: Blob | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}

type SettingsImageFieldProps = {
  label: string;
  description: string;
  emptyText: string;
  uploadText: string;
  placeholderIcon: LucideIcon;
  isConfigured: boolean;
  previewUrl: string | null;
  fileName?: string | null;
  file?: File | null;
  isLoadingPreview?: boolean;
  isPreviewError?: boolean;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onDelete?: () => void;
};

export function SettingsImageField({
  label,
  description,
  emptyText,
  uploadText,
  placeholderIcon: PlaceholderIcon,
  isConfigured,
  previewUrl,
  fileName,
  file = null,
  isLoadingPreview = false,
  isPreviewError = false,
  disabled = false,
  onSelect,
  onDelete,
}: SettingsImageFieldProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileUrl = useObjectUrl(file);
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);

  const hasImage = Boolean(file) || isConfigured;
  const imageUrl = file ? fileUrl : previewUrl;
  const showError = !file && isConfigured && (isPreviewError || (previewUrl !== null && previewUrl === brokenUrl));

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) return;

    if (!SETTINGS_IMAGE_ACCEPT.split(',').includes(selectedFile.type)) {
      toast.error(t('settings.image.invalid_type'));
      return;
    }

    if (selectedFile.size > SETTINGS_IMAGE_MAX_SIZE_MB * 1024 * 1024) {
      toast.error(t('settings.image.too_large', { size: `${SETTINGS_IMAGE_MAX_SIZE_MB}MB` }));
      return;
    }

    onSelect(selectedFile);
  };

  return (
    <AppFormField label={label} description={description} className={SETTINGS_FIELD_CLASS}>
      {({ id }) => (
        <div className='flex items-center gap-4'>
          <div className='bg-muted/40 text-muted-foreground flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border'>
            {!file && isConfigured && isLoadingPreview && !previewUrl ? (
              <Loader2 className='size-5 animate-spin' aria-hidden='true' />
            ) : showError ? (
              <ImageOff className='size-6' aria-hidden='true' />
            ) : hasImage && imageUrl ? (
              <img src={imageUrl} alt={label} className='size-full object-contain p-1.5' onError={() => setBrokenUrl(imageUrl)} />
            ) : (
              <PlaceholderIcon className='size-6 opacity-50' aria-hidden='true' />
            )}
          </div>

          <div className='min-w-0 space-y-2'>
            <p className='truncate text-sm'>{file ? file.name : isConfigured ? (fileName ?? label) : emptyText}</p>
            {showError ? <p className='text-destructive text-xs'>{t('settings.image.load_error')}</p> : null}

            <div className='flex flex-wrap gap-2'>
              <input
                id={id}
                ref={fileInputRef}
                type='file'
                accept={SETTINGS_IMAGE_ACCEPT}
                className='hidden'
                onChange={handleFileChange}
                disabled={disabled}
              />
              <Button type='button' variant='outline' size='sm' onClick={() => fileInputRef.current?.click()} disabled={disabled}>
                <Upload aria-hidden='true' />
                {hasImage ? tCommon('action.change') : uploadText}
              </Button>
              {/* A picked file is discarded with Reset; Delete only removes the saved image. */}
              {!file && isConfigured && onDelete ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='text-destructive hover:text-destructive'
                  onClick={onDelete}
                  disabled={disabled}
                >
                  <Trash2 aria-hidden='true' />
                  {tCommon('action.delete')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </AppFormField>
  );
}
