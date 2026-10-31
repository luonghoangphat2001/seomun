import { Eye, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/utils/helper/fileLibrary.helper';

// === Variables ===
const isImageUrl = (url: string): boolean => ['.jpeg', '.png', '.jpg', '.webp'].some((ext) => url.toLowerCase().endsWith(ext));
const isPdfUrl = (url: string): boolean => url.toLowerCase().endsWith('.pdf');

type AttachmentBadge = { url: string; name: string; size?: number };

type ReplyAttachmentBadgesProps = {
  attachments: AttachmentBadge[];
  onRemove?: (index: number) => void;
  disabled?: boolean;
};

export function ReplyAttachmentBadges({ attachments, onRemove, disabled }: ReplyAttachmentBadgesProps) {
  const { t } = useTranslation('page');

  // === State ===
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // === Functions ===
  const handlePreview = (url: string) => {
    if (isImageUrl(url) || isPdfUrl(url)) {
      setPreviewUrl(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // === JSX ===
  if (attachments.length === 0) return null;

  return (
    <>
      <div className='flex flex-wrap gap-2'>
        {attachments.map((att, i) => (
          <Badge key={`${att.url}-${i}`} variant='secondary' className='max-w-full gap-1.5 py-1 pr-1 pl-2.5 font-normal'>
            <span className='max-w-48 truncate'>{att.name}</span>
            {att.size ? <span className='text-muted-foreground'>({formatFileSize(att.size)})</span> : null}
            <button
              type='button'
              onClick={() => handlePreview(att.url)}
              title={t('inquiries.attachment.preview_image')}
              className='hover:bg-background/60 rounded-full p-0.5 transition-colors'
            >
              <Eye className='size-3.5' />
            </button>
            {onRemove ? (
              <button
                type='button'
                onClick={() => onRemove(i)}
                disabled={disabled}
                className='hover:bg-background/60 rounded-full p-0.5 transition-colors'
              >
                <X className='size-3.5' />
              </button>
            ) : null}
          </Badge>
        ))}
      </div>

      {previewUrl && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl'>
            <button
              type='button'
              onClick={() => setPreviewUrl(null)}
              className='absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70'
            >
              <X className='size-4' />
            </button>
            {isPdfUrl(previewUrl) ? (
              <iframe src={previewUrl} className='h-[90vh] w-[90vw]' title='PDF Preview' />
            ) : (
              <img src={previewUrl} alt='Preview' className='max-h-[90vh] max-w-[90vw] object-contain' />
            )}
          </div>
        </div>
      )}
    </>
  );
}
