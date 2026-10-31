import type { ParseKeys } from 'i18next';

import { DirectShippingName, DirectShippingStatus } from '../enums';

export const USER_OPTIONS_PER_PAGE = 10;

export const DIRECT_SHIPPING_STATUS_TRANSLATION_KEYS = {
  [DirectShippingStatus.PENDING]: 'page.delivery.direct_shipping.status.pending',
  [DirectShippingStatus.CONFIRMED]: 'page.delivery.direct_shipping.status.confirmed',
  [DirectShippingStatus.CANCELLED]: 'page.delivery.direct_shipping.status.cancelled',
} as const satisfies Record<DirectShippingStatus, ParseKeys>;

export const DIRECT_SHIPPING_NAME_TRANSLATION_KEYS = {
  [DirectShippingName.SCHOOL]: 'page.delivery.direct_shipping.shipping_name.school',
  [DirectShippingName.ACADEMY]: 'page.delivery.direct_shipping.shipping_name.academy',
  [DirectShippingName.HOUSE]: 'page.delivery.direct_shipping.shipping_name.house',
} as const satisfies Record<DirectShippingName, ParseKeys>;

export const DIRECT_SHIPPING_STATUS_BADGE_CLASSES: Record<DirectShippingStatus, string> = {
  [DirectShippingStatus.PENDING]: 'border-amber-200 bg-amber-50 text-amber-700',
  [DirectShippingStatus.CONFIRMED]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  [DirectShippingStatus.CANCELLED]: 'border-rose-200 bg-rose-50 text-rose-700',
};
