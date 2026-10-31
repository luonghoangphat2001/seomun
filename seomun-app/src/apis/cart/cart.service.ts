import { PostProcessingCode, ProductCommonOption } from '@/enums/product';
import { CartItemRESP } from './cart.response';
import { OrderCheckOutFormValues } from '@/components/ui/order/schema';
import { CartOrderREQ } from './cart.request';
import { OrderPaymentMethod, OrderShippingMethod } from '@/enums/order';
import { DELIVERY_MESSAGE_MANUAL } from '@/constants/common';
import {
  findProductOptionByCode,
  getProductOptionItems,
  getProductOptionLabels,
  ProductOptionGroupNameTranslator,
} from '@/lib/product-option-labels';

export const getCartItemOptionInfo = (cartItem?: CartItemRESP, translateGroupName?: ProductOptionGroupNameTranslator) => {
  if (!cartItem) return null;

  const options = getProductOptionItems(cartItem.options);
  const postProcessingCodes = Object.values(PostProcessingCode);
  const subjectMatter = findProductOptionByCode(options, ProductCommonOption.SUBJECT_MATTER)?.option?.label;
  const paper = findProductOptionByCode(options, ProductCommonOption.PAPER)?.option?.label;
  const size = cartItem.input_options
    ? `${cartItem.input_options.width || 0} x ${cartItem.input_options.height || 0}`
    : findProductOptionByCode(options, ProductCommonOption.SIZE)?.option?.label;
  const printedSide = findProductOptionByCode(options, ProductCommonOption.PRINTED_SIDE)?.option?.label;
  const printedColorFSide = findProductOptionByCode(options, ProductCommonOption.PRINTED_COLOR_FSIDE)?.option?.label;
  const printedColorBSide = findProductOptionByCode(options, ProductCommonOption.PRINTED_COLOR_BSIDE)?.option?.label;
  const printedSideLabel = [printedSide, printedColorFSide, printedColorBSide].filter(Boolean).join(' - ');
  const postProcessing = options
    .filter((op) => postProcessingCodes.includes(op?.group?.code as PostProcessingCode) && op?.option?.label)
    .map((op) => `${translateGroupName?.(op?.group?.code, op?.group?.name) || op?.group?.name || ''} - ${op?.option?.label}`)
    .join(' / ');
  const optionLabels = getProductOptionLabels(options, size ? `${size}mm` : undefined, translateGroupName);

  return { subjectMatter, paper, size, printedSide: printedSideLabel, postProcessing, optionLabels };
};

export const transformFormValuesToCartOrderREQ = (
  input: OrderCheckOutFormValues,
  itemIds: number[],
  userCouponId?: number,
): CartOrderREQ => ({
  item_ids: itemIds,
  payment_method: input.isBankTransfer
    ? OrderPaymentMethod.BANK_TRANSFER
    : input.isVirtualAccount
      ? OrderPaymentMethod.VIRTUAL_ACCOUNT
      : OrderPaymentMethod.CARD,
  shipping_method: input.shippingInfo.shippingMethod,
  shipping_fee_type: '3',
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
  point_used: Math.max(0, Math.floor(Number(input.point) || 0)),
  ...(userCouponId ? { user_coupon_id: userCouponId } : {}),
});
