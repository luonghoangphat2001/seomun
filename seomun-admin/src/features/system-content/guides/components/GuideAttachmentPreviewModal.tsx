import { Eye, X } from 'lucide-react';
import { useState } from 'react';

type Props = {
  urls: string[];
};

const isImageUrl = (url: string) => ['.jpeg', '.jpg', '.png', '.webp'].some((ext) => url.toLowerCase().endsWith(ext));
const isPdfUrl = (url: string) => url.toLowerCase().endsWith('.pdf');

export function GuideAttachmentPreviewModal({ urls }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (urls.length === 0) return null;

  const handleView = (url: string) => {
    if (isImageUrl(url) || isPdfUrl(url)) {
      setPreviewUrl(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {urls.map((url, i) => (
        <button
          key={i}
          type='button'
          onClick={() => handleView(url)}
          className='hover:bg-background rounded-full bg-transparent p-1 transition-colors'
          title='Preview'
        >
          <Eye className='size-4' />
        </button>
      ))}

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
