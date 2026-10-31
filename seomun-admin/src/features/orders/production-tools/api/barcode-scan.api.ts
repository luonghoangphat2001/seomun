import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { BarcodeScanREQ } from './barcode-scan.request';
import type { BarcodeScanRESP } from './barcode-scan.response';

export function scanBarcodeAPI(payload: BarcodeScanREQ): Promise<BarcodeScanRESP> {
  return api.post(ENDPOINTS.ORDERS.BARCODE_SCAN, payload);
}
