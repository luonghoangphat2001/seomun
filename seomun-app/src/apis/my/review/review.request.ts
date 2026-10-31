import { PaginationREQ } from '@/types';

export type ReviewListREQ = PaginationREQ & {
  rating?: 1 | 2 | 3 | 4 | 5;
  product_id?: number;
  published_only?: boolean;
};

export type ReviewCreateREQ = {
  product_id: number;
  order_id: number;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  content: string;
  images?: string[];
  hashtags?: string[];
};

export type ReviewUnreviewedListREQ = PaginationREQ;
