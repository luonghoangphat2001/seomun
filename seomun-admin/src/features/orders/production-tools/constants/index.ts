import { type ScanResultState } from '../types/production-tools.type';
import { ProductionStatus } from '../enums';
import { OrderStatus } from '@/features/orders/enums';

export const NEXT_STATUS_MAP: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.PURCHASE_CONFIRMED]: OrderStatus.PENDING_RECEPTION,
  [OrderStatus.PENDING_RECEPTION]: OrderStatus.TYPESETTING,
  [OrderStatus.FILE_ERROR]: OrderStatus.PENDING_CORRECTION,
  [OrderStatus.PENDING_CORRECTION]: OrderStatus.TYPESETTING,
  [OrderStatus.TYPESETTING]: OrderStatus.OUTPUT_OF_POWER,
  [OrderStatus.OUTPUT_OF_POWER]: OrderStatus.PRINT,
  [OrderStatus.PRINT]: OrderStatus.POST_PROCESSING,
  [OrderStatus.POST_PROCESSING]: OrderStatus.PRODUCTION_DONE,
};

export const PRODUCTION_STATUS_ORDER: ProductionStatus[] = [
  ProductionStatus.CONFIRMED,
  ProductionStatus.IN_PRODUCTION,
  ProductionStatus.POST_PROCESSING,
  ProductionStatus.READY_FOR_DELIVERY,
];

export const PRODUCTION_STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  payment_completed: 'Payment Completed',
  design_confirmed: 'Design Confirmed',
  printing: 'Printing',
  in_production: 'In Production',
  post_processing: 'Post-processing',
  ready_for_delivery: 'Ready for Delivery',
  production_completed: 'Production Completed',
  shipping: 'Shipping',
};

export const PRODUCTION_STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  payment_completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  design_confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  printing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  in_production: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  post_processing: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  ready_for_delivery: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  production_completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  shipping: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
};

export const DEFAULT_RESULT: ScanResultState = {
  kind: 'idle',
  title: 'Ready to scan',
  description: 'Scan a physical order barcode to automatically transition its production status.',
};

export const SCAN_OPERATOR_NAME = 'Production Scanner';
