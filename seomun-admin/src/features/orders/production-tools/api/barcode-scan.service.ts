import type { BarcodeScanREQ } from './barcode-scan.request';
import type { BarcodeScanRESP } from './barcode-scan.response';
import { scanBarcodeAPI } from './barcode-scan.api';

export async function scanBarcode(payload: BarcodeScanREQ): Promise<BarcodeScanRESP> {
  return scanBarcodeAPI(payload);
}
