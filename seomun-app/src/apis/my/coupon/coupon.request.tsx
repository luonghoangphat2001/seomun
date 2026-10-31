import { CouponStatus } from '@/enums/common';
import { PaginationREQ } from '@/types';

export type CouponListREQ = PaginationREQ & {
  status?: CouponStatus;
};

export type OrderCouponListREQ = {
  amount: number;
};
