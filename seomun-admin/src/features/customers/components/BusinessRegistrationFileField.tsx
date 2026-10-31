import { FileText, ImageIcon, RotateCcw, UploadCloud, X } from 'lucide-react';
import type { ChangeEvent, DragEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppFormField } from '@/components/shared/form-fields';
import { CertificateThumbnail } from '@/features/outsourcing';
import { FilePreviewModal } from '@/features/system-content/images';
import { cn } from '@/utils/cn';

export const BUSINESS_REGISTRATION_FILE_MAX_SIZE = 10 * 1024 * 1024;
export const BUSINESS_REGISTRATION_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const BUSINESS_REGISTRATION_FILE_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

function describeFile(url: string) {
  const fileName = url.split('?')[0].split('#')[0].split('/').pop() ?? url;
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  const mimeType =
    extension === 'pdf' ? 'application/pdf' : extension === 'png' ? 'image/png' : extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : '';

  try {
    return { name: decodeURIComponent(fileName), mimeType };
  } catch {
    return { name: fileName, mimeType };
  }
}

type WithBusinessRegistrationFile = { business_registration_file: File | string | null };

type BusinessRegistrationFileFieldProps<TFieldValues extends FieldValues & WithBusinessRegistrationFile> = {
  control: Control<TFieldValues>;
  disabled?: boolean;
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
};

export function BusinessRegistrationFileField<TFieldValues extends FieldValues & WithBusinessRegistrationFile>({
  control,
  disabled,
  label,
  description,
  required,
  className,
}: BusinessRegistrationFileFieldProps<TFieldValues>) {
  const { t } = useTranslation();
  const { t: tValidation } = useTranslation('validation');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController({
    control,
    name: 'business_registration_file' as FieldPath<TFieldValues>,
    disabled,
  });

  const [isDragging, setIsDragging] = useState(false);

  const isInteractive = !disabled;
  const fileValue = value as File | string | null;
  // Local blob preview only — the file is uploaded on submit
  const blobUrl = useMemo(() => (fileValue instanceof File ? URL.createObjectURL(fileValue) : null), [fileValue]);
  const current =
    fileValue instanceof File
      ? { name: fileValue.name, mimeType: fileValue.type, url: blobUrl ?? '' }
      : typeof fileValue === 'string' && fileValue
        ? { ...describeFile(fileValue), url: fileValue }
        : null;
  const isPdf = current?.mimeType === 'application/pdf';

  const selectFile = (file: File) => {
    if (!BUSINESS_REGISTRATION_FILE_TYPES.includes(file.type)) {
      toast.error(tValidation('file_type'));
      return;
    }

    if (file.size > BUSINESS_REGISTRATION_FILE_MAX_SIZE) {
      toast.error(tValidation('file_size', { size: '10MB' }));
      return;
    }

    onChange(file);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) selectFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!isInteractive) return;

    const file = event.dataTransfer.files?.[0];
    if (file) selectFile(file);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (isInteractive) setIsDragging(true);
  };

  const handleRemove = () => onChange(null);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  return (
    <AppFormField label={label} description={description} error={error?.message} required={required} disabled={disabled} className={className}>
      {({ id, describedBy, isInvalid }) => (
        <div>
          <input
            ref={(node) => {
              ref(node);
              fileInputRef.current = node;
            }}
            type='file'
            className='hidden'
            accept={BUSINESS_REGISTRATION_FILE_ACCEPT}
            onChange={handleInputChange}
            disabled={!isInteractive}
            aria-label={label}
          />

          {current ? (
            <div className={cn('bg-card flex items-center gap-4 rounded-lg border p-3', error && 'border-destructive')}>
              <CertificateThumbnail url={current.url} mimeType={current.mimeType} name={current.name} />

              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className='truncate text-sm font-medium'>{current.name}</span>
                <span className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                  {isPdf ? <FileText className='size-3.5' /> : <ImageIcon className='size-3.5' />}
                  {isPdf ? 'PDF' : current.mimeType.replace('image/', '').toUpperCase()}
                </span>
              </div>

              <div className='flex shrink-0 items-center gap-1'>
                <FilePreviewModal url={current.url} mimeType={current.mimeType} name={current.name} />
                {isInteractive ? (
                  <>
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='hover:bg-muted rounded-full p-1.5 transition-colors'
                      title={t('common.action.change', 'Change')}
                      aria-label={t('common.action.change', 'Change')}
                    >
                      <RotateCcw className='size-4' />
                    </button>
                    <button
                      type='button'
                      onClick={handleRemove}
                      className='hover:bg-destructive/10 hover:text-destructive rounded-full p-1.5 transition-colors'
                      title={t('common.remove', 'Remove')}
                      aria-label={t('common.remove', 'Remove')}
                    >
                      <X className='size-4' />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <button
              id={id}
              type='button'
              onClick={() => isInteractive && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragging(false)}
              disabled={!isInteractive}
              aria-invalid={isInvalid || undefined}
              aria-describedby={describedBy}
              className={cn(
                'border-input hover:border-primary/50 hover:bg-muted/30 flex w-full items-center gap-4 rounded-lg border-2 border-dashed p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                isDragging && 'border-primary bg-primary/5',
                error && 'border-destructive bg-destructive/5',
              )}
            >
              <span className='bg-muted text-muted-foreground grid size-16 shrink-0 place-items-center rounded-md'>
                <UploadCloud className='size-6' />
              </span>

              <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className='text-sm font-medium'>{t('common.drop_file_here', 'Drag and drop a file, or click to browse')}</span>
                {description ? <span className='text-muted-foreground text-xs'>{description}</span> : null}
              </span>

              <span className='border-input bg-background shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium'>
                {t('common.upload_file', 'Choose file')}
              </span>
            </button>
          )}
        </div>
      )}
    </AppFormField>
  );
}
