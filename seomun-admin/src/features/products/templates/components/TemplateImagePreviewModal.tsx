import { Eye, X } from 'lucide-react';

import { useDisclosure } from '@/hooks/use-disclosure';

type TemplateImagePreviewModalProps = {
  imageUrl: string;
  templateName: string;
};

export function TemplateImagePreviewModal({ imageUrl, templateName }: TemplateImagePreviewModalProps) {
  const preview = useDisclosure();

  return (
    <>
      <button
        type='button'
        onClick={preview.onOpen}
        className='bg-background/80 hover:bg-background rounded-full p-1 transition-colors'
        title={`Preview ${templateName}`}
      >
        <Eye className='size-4' />
      </button>

      {preview.open ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4' onClick={preview.onClose}>
          <div className='relative max-h-[90vh] max-w-[90vw]' onClick={(event) => event.stopPropagation()}>
            <button
              type='button'
              onClick={preview.onClose}
              className='absolute top-0 -right-12 rounded bg-white p-2 transition-colors hover:bg-gray-100'
            >
              <X className='size-6' />
              <span className='sr-only'>Close preview</span>
            </button>

            <img src={imageUrl} alt={templateName} className='max-h-[90vh] max-w-[90vw] rounded-2xl bg-white object-contain p-3 shadow-xl' />
          </div>
        </div>
      ) : null}
    </>
  );
}
