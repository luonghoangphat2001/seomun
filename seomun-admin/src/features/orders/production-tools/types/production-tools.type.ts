import type { OrderListItemRESP } from '@/features/orders/api/order.response';

export type ProductionOrder = OrderListItemRESP & {
  production_status: string;
  production_status_label: string;
  last_scanned_at?: string;
  last_operator?: string;
};

export type ScanHistoryItem = {
  id: string;
  order_number: string;
  status_before: string;
  status_after: string;
  status_after_label?: string | null;
  scanned_at: string;
  scanned_by: string;
  message: string;
  order_details?: {
    orderer_name: string;
    product_summary: string;
    payment_amount: number;
    id: string;
  };
};

export type ScanResultState =
  | {
      kind: 'idle';
      title: string;
      description: string;
    }
  | {
      kind: 'success';
      title: string;
      description: string;
      order_number: string;
      status_before: string;
      status_after: string;
      status_after_label?: string | null;
    }
  | {
      kind: 'error';
      title: string;
      description: string;
      order_number?: string;
    };
