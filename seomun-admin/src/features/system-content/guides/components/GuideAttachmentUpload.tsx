import { FileText, UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppFileLibrarySelect, type SelectedFile } from '@/components/shared/app-file-library-select';
import { FileType } from '@/enums';
import { formatFileSize } from '@/utils/helper/fileLibrary.helper';

import type { GuideAttachmentInput } from '@/features/system-content/guides/schemas';
import { GuideAttachmentPreviewModal } from './GuideAttachmentPreviewModal';

const ACCEPTED = '.jpeg,.png,.jpg,.webp';
const MAX_SIZE = 5 * 1024 * 1024;

const isImageUrl = (url: string): boolean => {
  const imageExts = ['.jpeg', '.png', '.jpg', '.webp'];
  return imageExts.some((ext) => url.toLowerCase().endsWith(ext));
};

type Props = {
  value?: GuideAttachmentInput[];
  onChange: (value: GuideAttachmentInput[] | undefined) => void;
  disabled?: boolean;
};

export function GuideAttachmentUpload({ value, onChange, disabled }: Props) {
  const { t } = useTranslation('page');

  const [pickerOpen, setPickerOpen] = useState(false);

  const attachments = Array.isArray(value) ? value : [];

  const handlePick = (files: SelectedFile[]) => {
    onChange(files.map((f) => ({ url: f.url, name: f.name, size: f.size })));
  };

  const remove = (idx: number) => {
    onChange(attachments.filter((_, i) => i !== idx));
  };

  return (
    <div className='space-y-2'>
      <button
        type='button'
        onClick={() => setPickerOpen(true)}
        disabled={disabled}
        className='border-input hover:bg-muted/40 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 transition-colors disabled:cursor-not-allowed disabled:opacity-50'
      >
        <UploadCloud className='text-muted-foreground size-8' />
        <span className='text-sm font-medium'>{t('guides.attachment.click_to_upload')}</span>
        <span className='text-muted-foreground text-xs'>{t('guides.attachment.file_hint')}</span>
      </button>

      {attachments.length > 0 && (
        <ul className='space-y-2'>
          {attachments.map((att, i) => {
            const isImage = isImageUrl(att.url);
            return (
              <li key={i} className='bg-card hover:bg-muted/40 flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors'>
                <div className='bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border'>
                  {isImage ? (
                    <img src={att.url} alt={t('guides.attachment.preview_image')} className='h-full w-full object-cover' />
                  ) : (
                    <FileText className='text-muted-foreground size-5' />
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-medium' title={att.name}>
                    {att.name}
                  </p>
                  {att.size ? <p className='text-muted-foreground text-xs'>{formatFileSize(att.size)}</p> : null}
                </div>
                <div className='flex shrink-0 items-center gap-1'>
                  <GuideAttachmentPreviewModal urls={[att.url]} />
                  <button
                    type='button'
                    onClick={() => remove(i)}
                    disabled={disabled}
                    className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex size-7 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <X className='size-4' />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AppFileLibrarySelect
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        fileType={FileType.GUIDE_CONTENT_ATTACHMENTS}
        accepted={ACCEPTED}
        maxSize={MAX_SIZE}
        multiple
        selectedUrls={attachments.map((a) => a.url)}
        onSelect={handlePick}
      />
    </div>
  );
}
