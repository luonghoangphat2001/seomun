import { UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import type { FileType } from '@/enums';
import { uploadFile, type UploadedFile } from '@/lib/api/upload-file';
import { cn } from '@/utils/cn';

import { matchesAccepted, toSelectedFile } from '@/utils/helper/fileLibrary.helper';

import type { SelectedFile } from './type';

type FileUploadTabProps = {
  isActive: boolean;
  fileType: FileType;
  accepted: string;
  acceptedExtensions: string[];
  multiple: boolean;
  maxSize: number;
  onUploaded: (files: SelectedFile[]) => void;
};

export function FileUploadTab({ isActive, fileType, accepted, acceptedExtensions, multiple, maxSize, onUploaded }: FileUploadTabProps) {
  const { t } = useTranslation('page');

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  const isUploading = uploadingCount > 0;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!fileList.length) return;

    const valid = fileList.filter((f) => {
      if (f.size > maxSize) {
        toast.error(t('file_library.size_error'));
        return false;
      }
      if (!matchesAccepted(f.name, acceptedExtensions)) {
        toast.error(t('file_library.invalid_type'));
        return false;
      }
      return true;
    });
    if (!valid.length) return;

    setUploadingCount(valid.length);
    const results = await Promise.allSettled(valid.map((f) => uploadFile({ file: f, type: fileType })));
    setUploadingCount(0);

    const uploaded = results
      .map((r, i) => ({ result: r, source: valid[i] }))
      .filter((x): x is { result: PromiseFulfilledResult<UploadedFile>; source: File } => x.result.status === 'fulfilled')
      .map(({ result, source }) => ({ ...toSelectedFile(result.value), size: result.value.size || source.size }));

    if (results.some((r) => r.status === 'rejected')) {
      toast.error(t('file_library.upload_error'));
    }

    if (uploaded.length > 0) onUploaded(uploaded);
  };

  return (
    <div className={cn('space-y-3', !isActive && 'hidden')}>
      <input ref={inputRef} type='file' accept={accepted} multiple={multiple} className='hidden' onChange={handleUpload} />
      <button
        type='button'
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className='border-input hover:bg-muted/40 flex h-75 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors disabled:cursor-not-allowed disabled:opacity-50'
      >
        <UploadCloud className='text-muted-foreground size-10' />
        <span className='text-sm font-medium'>
          {isUploading ? `${t('file_library.uploading')} (${uploadingCount})` : t('file_library.click_to_upload')}
        </span>
        <span className='text-muted-foreground text-xs'>{accepted}</span>
      </button>
    </div>
  );
}
