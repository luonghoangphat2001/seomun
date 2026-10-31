export enum ShipmentStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  // DELAYED = 'delayed',
}

export enum ShipmentFilterStatus {
  PRODUCTION_DONE = 'production_done',
  PENDING = 'pending',
  COURIER_SHIPPING = 'courier_shipping',
  QUICK_SHIPPING = 'quick_shipping',
  PICKUP = 'pickup',
  DIRECT_SHIPPING = 'direct_shipping',
  DELIVERED = 'delivered',
}

export enum ShipmentType {
  COMBINED = 'combined',
  SEPARATE = 'separate',
}

export enum DeliveryTrackingStage {
  PICKUP = 'pickup',
  IN_TRANSIT = 'in_transit',
  // OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
}

export enum ShipmentSortField {
  SHIPMENT_DATE = 'shipment_date',
  ORDER_NUMBER = 'order_number',
}

export enum ShipmentExportExcelType {
  ALL = 'ALL',
  CURRENT_PAGE = 'CURRENT_PAGE',
  SELECTED = 'SELECTED',
}

export enum DeliveryTrackingSortField {
  // ORDER_NUMBER = 'ORDER_NUMBER',
  // CUSTOMER_NAME = 'CUSTOMER_NAME',
  INVOICE_NUMBER = 'invoice_number',
  WAYBILL_REGISTERED_AT = 'waybill_registered_at',
  DELIVERY_STATUS = 'delivery_status',
}

export enum DeliveryTrackingExportExcelType {
  ALL = 'ALL',
  SELECTED = 'SELECTED',
  CURRENT_PAGE = 'CURRENT_PAGE',
}
