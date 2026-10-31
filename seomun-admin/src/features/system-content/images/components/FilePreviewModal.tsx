import { Eye, X } from 'lucide-react';
import { useState } from 'react';

type Props = {
  url: string;
  mimeType: string;
  name?: string;
};

export function FilePreviewModal({ url, mimeType, name = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isPdf = mimeType === 'application/pdf';
  const isImage = mimeType.startsWith('image/');
  const canPreview = isImage || isPdf;

  if (!canPreview) return null;

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='bg-background/80 hover:bg-background cursor-pointer rounded-full p-1 transition-colors'
        title='Preview'
      >
        <Eye className='size-4' />
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={() => setIsOpen(false)}>
          <div className='relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl' onClick={(e) => e.stopPropagation()}>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='absolute top-2 right-2 z-10 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70'
            >
              <X className='size-4' />
            </button>
            {isPdf ? (
              <iframe src={url} className='h-[90vh] w-[90vw]' title={name} />
            ) : (
              <img src={url} alt={name} className='max-h-[90vh] max-w-[90vw] object-contain' />
            )}
          </div>
        </div>
      )}
    </>
  );
}
