import { DesignStatus, OrderHistoryStatus } from '@/enums/order';
import {
  CheckboxSquare2,
  DoubleCheck,
  File2,
  HandUpload,
  HourGlass,
  HourGlass2,
  Layer,
  MagicPen,
  PieChart,
  Printer,
  Redo,
  ShippingBox,
  Spinner,
  Truck,
  User,
  Wallet2,
  Warning,
} from '@/icons';
import { OrderStatusConfig } from '@/types';

export const EDITABLE_ORDER_HISTORY_STATUSES: OrderHistoryStatus[] = [
  OrderHistoryStatus.DRAFT,
  OrderHistoryStatus.PENDING,
  OrderHistoryStatus.AWAITING_PAYMENT,
  OrderHistoryStatus.CONFIRMED,
  OrderHistoryStatus.PURCHASE_CONFIRMED,
  OrderHistoryStatus.PENDING_RECEPTION,
  OrderHistoryStatus.FILE_ERROR,
  OrderHistoryStatus.PENDING_CORRECTION,
];

export const ORDER_STATUS_CONFIG: Partial<Record<OrderHistoryStatus, OrderStatusConfig>> = {
  [OrderHistoryStatus.AWAITING_PAYMENT]: {
    label: 'order_status.AWAITING_PAYMENT',
    className: 'bg-[#2176EF] text-white',
    icon: Wallet2,
    helperMessage: 'payment_pending_note',
  },
  [OrderHistoryStatus.PENDING_RECEPTION]: {
    label: 'order_status.PENDING_RECEPTION',
    className: 'bg-primary text-gray-50',
    icon: Spinner,
    helperMessage: 'receipt_pending_note',
  },
  [OrderHistoryStatus.FILE_ERROR]: {
    label: 'order_status.FILE_ERROR',
    className: 'bg-primary text-gray-50',
    icon: Warning,
  },
  [OrderHistoryStatus.PENDING_CORRECTION]: {
    label: 'order_status.PENDING_CORRECTION',
    className: 'bg-error text-gray-50',
    icon: Redo,
  },
  [OrderHistoryStatus.TYPESETTING]: { label: 'order_status.TYPESETTING', className: 'bg-gray-100 text-text-main', icon: Layer },
  [OrderHistoryStatus.OUTPUT_OF_POWER]: {
    label: 'order_status.OUTPUT_OF_POWER',
    className: 'bg-gray-200 text-text-main',
    icon: File2,
  },
  [OrderHistoryStatus.PRINT]: { label: 'order_status.PRINT', className: 'bg-gray-400 text-white', icon: Printer },
  [OrderHistoryStatus.POST_PROCESSING]: {
    label: 'order_status.POST_PROCESSING',
    className: 'bg-text-secondary text-gray-50',
    icon: PieChart,
  },
  [OrderHistoryStatus.PRODUCTION_DONE]: {
    label: 'order_status.PRODUCTION_DONE',
    className: 'bg-[#6BB77A] text-gray-50',
    icon: DoubleCheck,
  },
};

export const DESIGN_STATUS_CONFIG: Record<DesignStatus, OrderStatusConfig> = {
  [DesignStatus.PAYMENT_PENDING]: {
    label: '',
    className: '',
    icon: Wallet2,
  },
  [DesignStatus.RECEIPT_PENDING]: {
    label: '',
    className: '',
    icon: HourGlass,
  },
  [DesignStatus.IN_DESIGN]: {
    label: '',
    className: '',
    icon: HourGlass2,
  },
  [DesignStatus.DRAFT_DELIVERY]: {
    label: '',
    className: '',
    icon: MagicPen,
  },
  [DesignStatus.DESIGN_COMPLETE]: {
    label: '',
    className: '',
    icon: DoubleCheck,
  },
};

export const SHIPPING_ORDER_HISTORY_STATUSES = [
  OrderHistoryStatus.READY_TO_SHIP,
  OrderHistoryStatus.SHIPPING,
  OrderHistoryStatus.SHIPPED,
  OrderHistoryStatus.DELIVERY_COMPLETED,
  OrderHistoryStatus.COMPLETED,
] as const;

type ShippingOrderHistoryStatus = (typeof SHIPPING_ORDER_HISTORY_STATUSES)[number];

export const SHIPPING_STATUS_CONFIG: Record<ShippingOrderHistoryStatus, OrderStatusConfig> = {
  [OrderHistoryStatus.READY_TO_SHIP]: {
    label: '',
    className: '',
    icon: User,
  },
  [OrderHistoryStatus.SHIPPING]: {
    label: '',
    className: '',
    icon: ShippingBox,
  },
  [OrderHistoryStatus.SHIPPED]: {
    label: '',
    className: '',
    icon: Truck,
  },
  [OrderHistoryStatus.DELIVERY_COMPLETED]: {
    label: '',
    className: '',
    icon: HandUpload,
  },
  [OrderHistoryStatus.COMPLETED]: {
    label: '',
    className: '',
    icon: CheckboxSquare2,
  },
};

export const isShippingOrderHistoryStatus = (status?: OrderHistoryStatus): status is ShippingOrderHistoryStatus =>
  !!status && status in SHIPPING_STATUS_CONFIG;
