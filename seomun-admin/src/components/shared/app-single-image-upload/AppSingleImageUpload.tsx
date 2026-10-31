import { Loader2, UploadCloud, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppMessage } from '@/components/shared/app-message';
import { cn } from '@/utils/cn';

import { AppSingleImagePreviewModal } from './components/AppSingleImagePreviewModal';
import { buildAcceptDescription, resolveImageUrl } from './helpers';
import type { AppSingleImageUploadProps } from './types';

function AppSingleImageUploadBase({
  value,
  onChange,
  onUpload,
  accept = 'image/jpeg,image/png,image/jpg,image/webp,image/svg+xml',
  maxSizeMB = 5,
  isUploading = false,
  disabled = false,
  readOnly = false,
  error,
  label,
  uploadText,
  uploadingText,
  previewLabel,
  removeLabel,
  fileTooLargeMessage,
  uploadErrorMessage,
  description,
  className,
  previewClassName,
  imageClassName,
  emptyText,
}: AppSingleImageUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInteractive = !disabled && !readOnly && !isUploading;

  const resolvedLabel = label ?? t('common.upload_image', 'Upload image');
  const resolvedUploadText = uploadText ?? resolvedLabel;
  const resolvedUploadingText = uploadingText ?? t('common.uploading', 'Uploading...');
  const resolvedDescription = description ?? buildAcceptDescription(accept, maxSizeMB);
  const resolvedEmptyText = emptyText ?? t('common.no_image', 'No image');
  const resolvedPreviewLabel = previewLabel ?? t('common.action.preview', 'Preview');
  const resolvedRemoveLabel = removeLabel ?? t('common.remove', 'Remove');

  const blobUrl = useMemo(() => {
    if (value instanceof File) return URL.createObjectURL(value);
    return null;
  }, [value]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const previewUrl = resolveImageUrl(value, blobUrl);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!isInteractive) return;

      const file = event.target.files?.[0];
      if (!file) return;

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        toast.error(fileTooLargeMessage ?? t('common.file_too_large', 'File is too large. Max size is {{max}}MB.', { max: maxSizeMB }));
        event.target.value = '';
        return;
      }

      try {
        if (onUpload) {
          const uploadedValue = await onUpload(file);
          onChange?.(uploadedValue);
        } else {
          onChange?.(file);
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        toast.error(uploadErrorMessage ?? t('common.upload_failed', 'Upload failed.'));
      } finally {
        event.target.value = '';
      }
    },
    [fileTooLargeMessage, isInteractive, maxSizeMB, onChange, onUpload, t, uploadErrorMessage],
  );

  const triggerUpload = useCallback(() => {
    if (isInteractive) fileInputRef.current?.click();
  }, [isInteractive]);

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type='file'
        className='hidden'
        accept={accept}
        onChange={handleFileChange}
        disabled={!isInteractive}
        aria-label={resolvedLabel}
      />

      {previewUrl ? (
        <div
          className={cn(
            'relative flex min-h-32 items-center justify-center overflow-hidden rounded-lg border',
            error && 'border-destructive',
            previewClassName,
          )}
        >
          <img
            src={previewUrl}
            alt={resolvedLabel}
            loading='lazy'
            decoding='async'
            className={cn('max-h-80 max-w-full object-contain', imageClassName)}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <div className='absolute top-2 right-2 flex items-center gap-1'>
            <AppSingleImagePreviewModal url={previewUrl} alt={resolvedLabel} previewLabel={resolvedPreviewLabel} />
            {isInteractive ? (
              <button
                type='button'
                onClick={() => onChange?.('')}
                className='bg-background/80 hover:bg-background cursor-pointer rounded-full p-1 transition-colors'
                aria-label={resolvedRemoveLabel}
              >
                <X className='size-4' />
              </button>
            ) : null}
          </div>
          {value instanceof File ? (
            <div className='absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white'>{value.name}</div>
          ) : null}
        </div>
      ) : (
        <button
          type='button'
          onClick={triggerUpload}
          disabled={!isInteractive}
          className={cn(
            'border-input hover:bg-muted/40 flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive bg-destructive/5',
            previewClassName,
          )}
        >
          <span className='text-muted-foreground size-8 shrink-0'>
            {isUploading ? <Loader2 className='text-primary size-full animate-spin' /> : <UploadCloud className='text-muted-foreground size-full' />}
          </span>
          <span className='text-sm font-medium'>
            {isUploading ? resolvedUploadingText : readOnly || disabled ? resolvedEmptyText : resolvedUploadText}
          </span>
          {!readOnly && !disabled && !isUploading ? <span className='text-muted-foreground text-xs'>{resolvedDescription}</span> : null}
        </button>
      )}

      <AppMessage message={error} />
    </div>
  );
}

export const AppSingleImageUpload = memo(AppSingleImageUploadBase);
