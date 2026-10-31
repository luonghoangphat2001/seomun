import { PaginationREQ } from '@/types';

export type FaqListREQ = PaginationREQ & {
  category?: string;
  search?: string;
};

export type FaqCountREQ = {
  search?: string;
};
