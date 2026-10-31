import { CouponStatus, CouponType } from '@/enums/common';

export type Coupon = {
  id: number;
  user_id: number;
  coupon_id: number;
  received_at: string;
  used_at: string | null;
  order_id: string | null;
  status: CouponStatus;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  coupon: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    discount_type: CouponType;
    discount_value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    starts_at: string;
    expires_at: string;
    is_valid: boolean;
  };
};

export type CouponListRESP = {
  coupons: Coupon[];
};

export type OrderCoupon = {
  user_coupon_id: number;
  coupon_id: number;
  code: string;
  name: string;
  description: string | null;
  discount_type: CouponType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  calculated_discount: number;
  expires_at: string | null;
  missing_amount: number | null;
  reason: string;
};

export type OrderCouponListRESP = {
  base_amount: number;
  applicable: OrderCoupon[];
  inapplicable: OrderCoupon[];
};
