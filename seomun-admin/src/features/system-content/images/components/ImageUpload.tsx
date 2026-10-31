import { File, FileText, UploadCloud, X } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { FileType } from '@/enums';

import { useUploadFileMutation } from '../api';
import { FilePreviewModal } from './FilePreviewModal';

const ACCEPTED_IMAGES = '.jpeg,.jpg,.png,.webp';
const ACCEPTED_DOCS = '.pdf,.doc,.docx';
const MAX_SIZE = 10 * 1024 * 1024;

export type ImageUploadValue = {
  url: string;
  path: string;
  name: string;
  mime_type: string;
};

// === File thumbnail ===

function UploadedFileThumbnail({ value, onRemove, canRemove }: { value: ImageUploadValue; onRemove: () => void; canRemove: boolean }) {
  const isImage = value.mime_type.startsWith('image/');
  const isPdf = value.mime_type === 'application/pdf';

  return (
    <div className='space-y-2'>
      <div className='relative overflow-hidden rounded-lg border'>
        {isImage ? (
          <img src={value.url} alt={value.name} className='bg-muted/30 h-48 w-full object-contain' />
        ) : (
          <div className='bg-muted/30 flex h-48 flex-col items-center justify-center gap-3'>
            {isPdf ? <FileText className='size-12 text-red-400' /> : <File className='size-12 text-blue-400' />}
            <span className='text-muted-foreground max-w-xs truncate text-sm'>{value.name}</span>
          </div>
        )}
        <div className='absolute top-2 right-2 flex items-center gap-1'>
          <FilePreviewModal url={value.url} mimeType={value.mime_type} name={value.name} />
          {canRemove && (
            <button type='button' onClick={onRemove} className='bg-background/80 hover:bg-background rounded-full p-1 transition-colors'>
              <X className='size-4' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// === Main component ===

type ImageUploadProps = {
  value?: ImageUploadValue;
  onChange: (value: ImageUploadValue | undefined) => void;
  fileType?: FileType;
  disabled?: boolean;
};

export function ImageUpload({ value, onChange, fileType, disabled }: ImageUploadProps) {
  const { t } = useTranslation('page');
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: upload, isPending } = useUploadFileMutation(fileType as FileType);

  const accepted = fileType === FileType.GUIDE_CONTENT_ATTACHMENTS ? `${ACCEPTED_IMAGES},${ACCEPTED_DOCS}` : ACCEPTED_IMAGES;

  const canUpload = !!fileType && !disabled;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !fileType) return;
    if (file.size > MAX_SIZE) return;

    upload(file, {
      onSuccess: (result) =>
        onChange({
          url: result.url,
          path: result.path,
          name: result.name,
          mime_type: result.mime_type,
        }),
    });
  };

  if (value?.url) {
    return (
      <div className='space-y-2'>
        <UploadedFileThumbnail value={value} onRemove={() => onChange(undefined)} canRemove={canUpload} />
        {canUpload && (
          <>
            <button
              type='button'
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
              className='text-primary text-xs hover:underline disabled:opacity-50'
            >
              {t('images.upload.replace')}
            </button>
            <input ref={inputRef} type='file' accept={accepted} className='hidden' onChange={handleFileChange} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <input ref={inputRef} type='file' accept={accepted} className='hidden' onChange={handleFileChange} />
      <button
        type='button'
        onClick={() => canUpload && inputRef.current?.click()}
        disabled={!canUpload || isPending}
        className='border-input hover:bg-muted/40 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 transition-colors disabled:cursor-not-allowed disabled:opacity-50'
      >
        <UploadCloud className='text-muted-foreground size-9' />
        <span className='text-sm font-medium'>
          {isPending ? t('images.upload.uploading') : !fileType ? t('images.form.field.select_type_first') : t('images.upload.click_to_upload')}
        </span>
        <span className='text-muted-foreground text-xs'>
          {fileType === FileType.GUIDE_CONTENT_ATTACHMENTS ? t('images.upload.file_hint_guide') : t('images.upload.file_hint')}
        </span>
      </button>
    </div>
  );
}
