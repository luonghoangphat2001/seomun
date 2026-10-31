import { PaginationREQ } from '@/types';

export type NotificationListREQ = PaginationREQ & {
  read?: boolean;
};
