'use client';

import { SafeImage } from '@/components/common';
import { useWebEditorStore } from '@/hooks';
import { cn } from '@/lib/utils';

export const PageGridView = () => {
  const { activeSide, datas, thumbnails, selectSide, setIsGridView } = useWebEditorStore();

  const handleSelect = (index: number) => {
    selectSide(index);
    setIsGridView(false);
  };

  return (
    <div className='scrollbar-hide absolute inset-0 overflow-y-auto bg-gray-50 px-4 py-6 md:hidden'>
      <div className='grid min-h-full grid-cols-2 content-start gap-6'>
        {datas.map((_, index) => (
          <div key={index} onClick={() => handleSelect(index)} className='group relative flex flex-col gap-1.5'>
            <div
              className={cn(
                'relative flex aspect-[142/80] w-full overflow-hidden border bg-white transition-all',
                activeSide === index ? 'border-text-brand ring-text-brand ring-1' : 'border-border-soft',
              )}>
              <SafeImage
                src={thumbnails[index]}
                className='h-full w-full object-contain'
                alt={`Page ${index + 1}`}
                width={200}
                height={112}
                unoptimized
              />
            </div>
            <p className='body-14 px-1'>{index + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
