import { OrderPaymentMethod, OrderShippingMethod } from '@/enums/order';
import { ProductQuoteREQ } from '../product/product.request';
import { DesignReviewReplyStatus } from '@/enums/common';

export type ContactInfo = {
  name: string;
  phone: string;
  save_for_worker?: boolean;
};

export type ShippingInfo = {
  name: string;
  phone: string;
  postcode?: string;
  address?: string;
  address_detail?: string;
  message_preset?: string;
  message_custom?: string;
  save_for_shipping_address?: boolean;
};

export type SenderInfo = {
  name: string;
  phone: string;
  zipcode: string;
  address: string;
  address2: string;
};

export type OrderCreateREQ = ProductQuoteREQ & {
  product_id: number;
  payment_method: OrderPaymentMethod;
  company_name?: string;
  shipping_method: OrderShippingMethod;
  shipping_fee_type: string;
  design_group_id: number;
  contact: ContactInfo;
  shipping: ShippingInfo;
  sender?: SenderInfo;
  point_used?: number;
  user_coupon_id?: number;
};

export type OrderDesignReviewReplyItemREQ = {
  order_item_id: number;
  version_id: number;
  response: DesignReviewReplyStatus;
  note?: string;
};

export type OrderDesignReviewReplyREQ = {
  token: string;
  responses: OrderDesignReviewReplyItemREQ[];
};
