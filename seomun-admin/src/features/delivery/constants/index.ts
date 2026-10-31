import type { ParseKeys } from 'i18next';

import { DeliveryTrackingStage, ShipmentStatus, ShipmentType } from '../enums';

export const SHIPMENT_STATUS_TRANSLATION_KEYS = {
  [ShipmentStatus.PENDING]: 'page.delivery.shipments.status.pending',
  [ShipmentStatus.SHIPPED]: 'page.delivery.shipments.status.shipped',
  [ShipmentStatus.DELIVERED]: 'page.delivery.shipments.status.delivered',
} as const satisfies Record<ShipmentStatus, ParseKeys>;

export const SHIPMENT_STATUS_BADGE_CLASSES: Record<ShipmentStatus, string> = {
  [ShipmentStatus.PENDING]: 'border-amber-200 bg-amber-50 text-amber-700',
  [ShipmentStatus.SHIPPED]: 'border-blue-200 bg-blue-50 text-blue-700',
  [ShipmentStatus.DELIVERED]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export const SHIPMENT_TYPE_TRANSLATION_KEYS = {
  [ShipmentType.COMBINED]: 'page.delivery.shipments.type.combined',
  [ShipmentType.SEPARATE]: 'page.delivery.shipments.type.separate',
} as const satisfies Record<ShipmentType, ParseKeys>;

export const DELIVERY_STAGE_TRANSLATION_KEYS = {
  [DeliveryTrackingStage.PICKUP]: 'page.delivery.tracking.stage.pickup',
  [DeliveryTrackingStage.IN_TRANSIT]: 'page.delivery.tracking.stage.in_transit',
  [DeliveryTrackingStage.DELIVERED]: 'page.delivery.tracking.stage.delivered',
} as const satisfies Record<DeliveryTrackingStage, ParseKeys>;

export const DELIVERY_STAGE_BADGE_CLASSES: Record<DeliveryTrackingStage, string> = {
  [DeliveryTrackingStage.PICKUP]: 'border-sky-200 bg-sky-50 text-sky-700',
  [DeliveryTrackingStage.IN_TRANSIT]: 'border-amber-200 bg-amber-50 text-amber-700',
  [DeliveryTrackingStage.DELIVERED]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export const DELIVERY_TRACKING_STAGES = [DeliveryTrackingStage.PICKUP, DeliveryTrackingStage.IN_TRANSIT, DeliveryTrackingStage.DELIVERED] as const;
