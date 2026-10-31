import { Eye, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SizeSettings } from '../api/popup.response';

type Props = {
  url: string;
  name?: string;
  size?: SizeSettings | null;
  className?: string;
};

export function PopupImagePreviewModal({ url, name = '', size, className }: Props) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);

  const previewStyle: React.CSSProperties | undefined = size
    ? {
        width: `min(${size.width}px, 90vw)`,
        height: `min(${size.height}px, 90vh)`,
      }
    : undefined;

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className={className ?? 'bg-background/80 hover:bg-background cursor-pointer rounded-full p-1 transition-colors'}
        title={t('action.preview')}
      >
        <Eye className='size-4' />
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={() => setIsOpen(false)}>
          <div
            className='relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white'
            style={previewStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='absolute top-2 right-2 z-10 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70'
            >
              <X className='size-4' />
            </button>
            <img src={url} alt={name || t('action.preview')} className='h-full w-full object-contain' />
          </div>
        </div>
      )}
    </>
  );
}
