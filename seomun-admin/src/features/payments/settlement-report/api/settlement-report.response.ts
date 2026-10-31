import type { PaginationResponse } from '@/types/api/response';

export interface Report {
  transaction_id: string;
  order_number: string;
  status: string;
  payment_method: string;
  paid_at: string | null;
  failed_at: string | null;
  created_at: string;
  customer_id: string;
  customer_name: string;
  product_id: string;
  product_name: string;
  category_id: string;
  category_name: string;
  payment_amount: number;
  supply_price: number;
  vat: number;
  commission: number;
}

export interface ReportExportExcelRESP {
  id: number;
  status: string;
  file_name: string;
  file_path: string | null;
}

export type ReportRESP = PaginationResponse<{ reports: Report[] }>;
