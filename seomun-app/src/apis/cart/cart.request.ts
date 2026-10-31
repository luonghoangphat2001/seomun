import { OrderPaymentMethod, OrderShippingMethod } from '@/enums/order';
import { ContactInfo, SenderInfo, ShippingInfo } from '../order/order.request';

export type CartAddItemREQ = {
  product_id: number;
  design_group_id: number;
  quantity: number;
  number_of_cases: number;
  selected_options: {
    group_id: number;
    option_id: number;
  }[];
  input_options: {
    width: number;
    height: number;
  };
};

export type CartListREQ = {
  search?: string;
};

export type CartDeleteBatchREQ = {
  item_ids: number[];
};

export type CartQuoteREQ = {
  item_ids: number[];
  point_use?: number;
  shipping_method?: OrderShippingMethod;
  user_coupon_id?: number;
};

export type CartOrderREQ = {
  item_ids: number[];
  payment_method: OrderPaymentMethod;
  company_name?: string;
  shipping_method: OrderShippingMethod;
  shipping_fee_type: string;
  contact: ContactInfo;
  shipping: ShippingInfo;
  sender?: SenderInfo;
  point_used?: number;
  user_coupon_id?: number;
};
