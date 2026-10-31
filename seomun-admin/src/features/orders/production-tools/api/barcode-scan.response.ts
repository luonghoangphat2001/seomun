import type { BaseResponse } from '@/types/api';

export type BarcodeScanData = {
  order_number: string;
  status_before: string;
  status_after: string;
  status_after_label_ko?: string | null;
};

export type BarcodeScanRESP = BaseResponse<BarcodeScanData>;
