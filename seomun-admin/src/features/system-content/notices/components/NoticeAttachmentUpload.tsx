import { UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppFileLibrarySelect, type SelectedFile } from '@/components/shared/app-file-library-select';
import { FileType } from '@/enums';
import { formatFileSize } from '@/utils/helper/fileLibrary.helper';

import type { NoticeAttachmentInput } from '@/features/system-content/notices/schemas';
import { NoticeAttachmentPreviewModal } from './NoticeAttachmentPreviewModal';

const ACCEPTED = '.pdf,.jpeg,.png,.jpg,.webp,.svg';
const MAX_SIZE = 5 * 1024 * 1024;

const isImageUrl = (url: string): boolean => {
  const imageExts = ['.jpeg', '.png', '.jpg', '.webp', '.svg'];
  return imageExts.some((ext) => url.toLowerCase().endsWith(ext));
};

type Props = {
  value?: NoticeAttachmentInput[];
  onChange: (value: NoticeAttachmentInput[] | undefined) => void;
  disabled?: boolean;
};

export function NoticeAttachmentUpload({ value, onChange, disabled }: Props) {
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
        <span className='text-sm font-medium'>{t('notices.attachment.click_to_upload')}</span>
        <span className='text-muted-foreground text-xs'>{t('notices.attachment.file_hint')}</span>
      </button>

      {attachments.length > 0 && (
        <ul className='space-y-1'>
          {attachments.map((att, i) => {
            const isImage = isImageUrl(att.url);
            return (
              <li key={i} className='bg-muted flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm'>
                <div className='flex min-w-0 flex-1 items-center gap-2'>
                  {isImage && (
                    <div className='h-8 w-12 shrink-0 overflow-hidden rounded border'>
                      <img src={att.url} alt={t('notices.attachment.preview_image')} className='h-full w-full object-cover' />
                    </div>
                  )}
                  <span className='flex-1 truncate'>
                    {att.name}
                    {att.size ? <span className='text-muted-foreground ml-1'>({formatFileSize(att.size)})</span> : null}
                  </span>
                </div>
                <div className='flex shrink-0 items-center gap-1'>
                  <NoticeAttachmentPreviewModal urls={[att.url]} />
                  <button
                    type='button'
                    onClick={() => remove(i)}
                    disabled={disabled}
                    className='text-muted-foreground hover:text-foreground transition-colors'
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
        fileType={FileType.NOTICE_ATTACHMENTS}
        accepted={ACCEPTED}
        maxSize={MAX_SIZE}
        multiple
        selectedUrls={attachments.map((a) => a.url)}
        onSelect={handlePick}
      />
    </div>
  );
}
