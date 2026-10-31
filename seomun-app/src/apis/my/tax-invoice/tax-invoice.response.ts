import { ExportExcelHistoryRESP } from '../export-excel/export-excel.response';

export type TaxInvoiceItemRESP = {
  document_number: string;
  issued_at: string;
  order_amount: string;
  shipping_fee: string;
  total_amount: string;
  supply_amount: string;
  tax_amount: string;
};

export type TaxInvoiceListRESP = {
  items: TaxInvoiceItemRESP[];
};

export type TaxInvoiceExportExcelRESP = {
  history: ExportExcelHistoryRESP;
};
