'use client';

import { Button } from '@/components/common';
import { useProductReviewListQuery } from '@/apis/product/product.query';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ReviewItem } from './ReviewItem';

const REVIEWS_PER_LOAD = 5;

interface ReviewListProps {
  productSlug: string;
}

export const ReviewList = ({ productSlug }: ReviewListProps) => {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const [perPage, setPerPage] = useState(REVIEWS_PER_LOAD);
  const { data: reviews = [], isFetching, isLoading } = useProductReviewListQuery({ slug: productSlug, per_page: perPage });

  const hasMoreReviews = reviews.length === perPage;

  return (
    <div className='flex flex-col gap-4 py-4 md:gap-8 md:p-6'>
      {/* <Select
        options={filterOptions}
        value={filter}
        onChange={(val) => setFilter(val as string)}
        className='w-22 md:w-30'
        selectClassname='h-9 md:h-12'
      /> */}

      <div className='flex flex-col gap-4 md:gap-8'>
        {!isLoading && reviews.length === 0 && (
          <p className='body-14 text-text-secondary py-10 text-center'>{tCommon('no_data')}</p>
        )}
        {reviews.map((review) => (
          <ReviewItem
            key={review.id}
            name={review.user.name}
            date={formatDate(review.created_at, 'yyyy.MM.dd')}
            rating={review.rating}
            content={review.content}
            images={review.images}
          />
        ))}
      </div>

      {hasMoreReviews && (
        <div className='flex justify-center'>
          <Button
            variant='outline-primary'
            size='lg'
            className='h-9 w-full md:h-auto md:w-60'
            loading={isFetching}
            onClick={() => setPerPage((current) => current + REVIEWS_PER_LOAD)}>
            {t('view_all_reviews')}
          </Button>
        </div>
      )}
    </div>
  );
};
