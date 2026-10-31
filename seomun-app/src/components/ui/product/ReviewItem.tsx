import { ImagePreviewModal, ImagePreviewModalHandle, SafeImage } from '@/components/common';
import { Star, User } from '@/icons';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface ReviewItemProps {
  name: string;
  date: string;
  rating: number;
  content: string;
  images?: string[];
  tags?: string[];
  showName?: boolean;
}

export const ReviewItem = ({ name, date, rating, content, images, tags, showName = true }: ReviewItemProps) => {
  const modalRef = useRef<ImagePreviewModalHandle>(null);

  return (
    <div className='flex gap-4'>
      <ImagePreviewModal images={images || []} ref={modalRef} />
      <div className='border-border-soft bg-border-light flex size-9 shrink-0 items-center justify-center rounded-[8px] border'>
        <User className='text-text-secondary size-6' />
      </div>

      <div className='flex flex-col gap-2'>
        <div className='flex flex-col gap-1'>
          <div className='flex gap-1'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn('size-4 transition-all', i < rating ? 'text-[#FFC107]' : 'text-gray-200')} />
            ))}
          </div>
          <p className='caption-12 space-x-1'>
            {showName && <span className='font-semibold'>{name}</span>} • {date}
          </p>
        </div>

        <p className='body-14 whitespace-pre-wrap'>{content}</p>

        {images && images.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {images.map((src, index) => (
              <div
                key={index}
                onClick={() => modalRef.current?.open(index)}
                className='border-border-soft transitions-all relative size-20 cursor-pointer overflow-hidden rounded-[8px] border duration-300 hover:scale-105'>
                <SafeImage src={src} alt={`Review image ${index}`} fill className='object-cover' />
              </div>
            ))}
          </div>
        )}

        {/* {tags && tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {tags.map((tag, index) => (
              <span key={index} className='body-14'>
                #{tag}
              </span>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
};
