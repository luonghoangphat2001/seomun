import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { Eye } from 'lucide-react';
import { useState } from 'react';

type AppSingleImagePreviewModalProps = {
  url: string;
  alt: string;
  previewLabel: string;
};

export function AppSingleImagePreviewModal({ url, alt, previewLabel }: AppSingleImagePreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='bg-background/80 hover:bg-background rounded-full p-1 transition-colors'
        title={previewLabel}
        aria-label={previewLabel}
      >
        <Eye className='size-4' />
      </button>
      <AppDialogModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={previewLabel}
        footer={null}
        contentClassName='w-fit max-w-[calc(100vw-2rem)] gap-3 bg-white p-3 sm:max-w-[90vw]'
        overlayClassName='bg-black/50 backdrop-blur-none'
      >
        <div className='h-[min(calc(90vh-4rem),36rem)] w-[min(calc(100vw-3.5rem),45rem)]'>
          <img src={url} alt={alt} className='size-full rounded-lg object-contain' />
        </div>
      </AppDialogModal>
    </>
  );
}
