import { OrderCheckOutFormValues } from '@/components/ui/order/schema';
import { DELIVERY_MESSAGE_MANUAL } from '@/constants/common';
import { OrderPaymentMethod, OrderShippingMethod } from '@/enums/order';
import { ProductSelectedOptions } from '@/types';
import { OrderCreateREQ } from './order.request';

export const transformOrderCheckoutFormValuesToCreateOrderREQ = (
  input: OrderCheckOutFormValues,
  selectedOptions: ProductSelectedOptions,
  userCouponId?: number,
): OrderCreateREQ => ({
  payment_method: input.isBankTransfer
    ? OrderPaymentMethod.BANK_TRANSFER
    : input.isVirtualAccount
      ? OrderPaymentMethod.VIRTUAL_ACCOUNT
      : OrderPaymentMethod.CARD,
  shipping_method: input.shippingInfo.shippingMethod,
  shipping_fee_type: '3',
  design_group_id: selectedOptions.designGroupId,
  contact: {
    name: input.ordererInfo.ordererName,
    phone: input.ordererInfo.phoneHead + input.ordererInfo.phoneBody + input.ordererInfo.phoneTail,
    save_for_worker: input.saveForWorker || undefined,
  },
  shipping: {
    name: input.shippingInfo.ordererName,
    phone: input.shippingInfo.phoneHead + input.shippingInfo.phoneBody + input.shippingInfo.phoneTail,
    save_for_shipping_address: input.shippingInfo.saveForShippingAddress || undefined,
    ...(input.shippingInfo.shippingMethod !== OrderShippingMethod.PICKUP
      ? {
          postcode: input.shippingInfo.postCode || undefined,
          address: input.shippingInfo.address || undefined,
          address_detail: input.shippingInfo.addressDetail || undefined,
        }
      : {}),
    message_preset: (input.shippingInfo.message !== DELIVERY_MESSAGE_MANUAL && input.shippingInfo.message) || undefined,
    message_custom: input.shippingInfo.detailNote || undefined,
  },
  ...(input.isChangeSenderInfo
    ? {
        sender: {
          name: input.senderInfo.businessName || '',
          phone: (input.senderInfo.phoneHead || '') + (input.senderInfo.phoneBody || '') + (input.senderInfo.phoneTail || ''),
          zipcode: input.senderInfo.postCode || '',
          address: input.senderInfo.address || '',
          address2: input.senderInfo.addressDetail || '',
        },
      }
    : {}),
  ...selectedOptions.quoteRequest,
  point_used: Math.max(0, Math.floor(Number(input.point) || 0)),
  ...(userCouponId ? { user_coupon_id: userCouponId } : {}),
});
