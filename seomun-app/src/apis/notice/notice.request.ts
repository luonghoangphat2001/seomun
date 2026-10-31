import { PaginationREQ } from '@/types';

export type NoticeListREQ = PaginationREQ & {
  type?: string;
  search?: string;
  exclude_ids?: number;
};
