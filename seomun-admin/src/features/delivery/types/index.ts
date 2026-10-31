import type { DeliveryTrackingStage, ShipmentStatus, ShipmentType } from '../enums';

export type Shipment = {
  id: number;
  order_number: string;
  customer_name: string | null;
  type: ShipmentType;
  status: ShipmentStatus;
  tracking_number: string;
  carrier_code: string;
  carrier_name: string;
  shipping_fee: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipped_at: string;
  delivered_at: string | null;
  items: ShipmentItems[];
};

export type ShipmentItems = {
  id: number;
  product_name: string | null;
  quantity: number;
  requires_separate_shipping: boolean;
};

export type DeliveryTracking = {
  id: number;
  order_number: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  invoice_number: string;
  courier_name: string;
  waybill_registered_at: string;
  delivery_status: DeliveryTrackingStage;
};
