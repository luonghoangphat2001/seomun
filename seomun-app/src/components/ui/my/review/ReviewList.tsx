'use client';

import { MyPagination } from '@/components/common';
import { ReviewItem } from '../../product/ReviewItem';

export type MyReviewListItem = {
  id: number;
  name: string;
  date: string;
  rating: number;
  content: string;
  images?: string[];
  tags?: string[];
};

type ReviewListProps = {
  data: MyReviewListItem[];
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
};

const ReviewList = ({ data, currentPage, totalPage, onPageChange }: ReviewListProps) => {
  return (
    <section className='flex flex-col gap-4'>
      {data.map((review) => (
        <ReviewItem key={review.id} {...review} showName={false} />
      ))}

      <MyPagination
        currentPage={currentPage}
        totalPage={totalPage}
        onPageChange={onPageChange}
        className='mt-3 hidden px-6 md:flex'
      />
    </section>
  );
};

export default ReviewList;
