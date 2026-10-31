import { Eye, X } from 'lucide-react';
import { useState } from 'react';

type Props = {
  url: string;
};

export function BannerImagePreviewModal({ url }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='bg-background/80 hover:bg-background rounded-full p-1 transition-colors'
        title='Preview image'
      >
        <Eye className='size-4' />
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='relative max-h-[90vh] max-w-[90vw]'>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='absolute top-0 -right-12 rounded bg-white p-2 transition-colors hover:bg-gray-100'
            >
              <X className='size-6' />
            </button>
            <img src={url} alt='Preview' className='max-h-[90vh] max-w-[90vw] object-contain' style={{ borderRadius: 20 }} />
          </div>
        </div>
      )}
    </>
  );
}
