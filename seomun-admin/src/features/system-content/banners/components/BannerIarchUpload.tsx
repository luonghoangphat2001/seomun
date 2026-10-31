import { UploadCloud, X } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppFieldMessage } from '@/components/shared/form-fields';
import { FileType } from '@/enums';
import { useUploadFileMutation } from '@/features/system-content/images';
import { BannerImagePreviewModal } from './BannerImagePreviewModal';

const ACCEPTED = '.jpeg,.png,.jpg,.webp,.gif';
const MAX_SIZE = 5 * 1024 * 1024;

type Props = {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
};

export function BannerImageUpload({ label, hint, required, error, value, onChange, disabled }: Props) {
  const { t } = useTranslation('page');
  const { t: tMessage } = useTranslation('message');

  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: upload, isPending } = useUploadFileMutation(FileType.BANNERS);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_SIZE) {
      toast.error(tMessage('banners.upload.size_error'));
      return;
    }

    upload(file, {
      onSuccess: (file) => onChange(file.url),
      onError: () => toast.error(tMessage('banners.upload.error')),
    });
  };

  return (
    <div className='flex flex-col gap-1.5'>
      <span className='text-sm font-medium'>
        {label}
        {required && (
          <span className='text-destructive ml-0.5' aria-hidden='true'>
            *
          </span>
        )}
      </span>
      <input ref={inputRef} type='file' accept={ACCEPTED} className='hidden' onChange={handleFileChange} />
      {value ? (
        <div className='relative overflow-hidden rounded-lg border'>
          <img src={value} alt={label} className='h-40 w-full object-cover' />
          <div className='absolute top-2 right-2 flex items-center gap-1'>
            <BannerImagePreviewModal url={value} />
            <button
              type='button'
              onClick={() => onChange(undefined)}
              disabled={disabled}
              className='bg-background/80 hover:bg-background rounded-full p-1 transition-colors'
            >
              <X className='size-4' />
            </button>
          </div>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isPending}
          className='border-input hover:bg-muted/40 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 transition-colors disabled:cursor-not-allowed disabled:opacity-50'
        >
          <span className='text-muted-foreground size-8'>
            <UploadCloud />
          </span>
          <span className='text-sm font-medium'>{isPending ? t('banners.image_upload.uploading') : t('banners.image_upload.click_to_upload')}</span>
          <span className='text-muted-foreground text-xs'>{t('banners.image_upload.file_hint')}</span>
        </button>
      )}
      {hint && <p className='text-muted-foreground text-xs'>{hint}</p>}
      <AppFieldMessage message={error} variant='error' />
    </div>
  );
}
