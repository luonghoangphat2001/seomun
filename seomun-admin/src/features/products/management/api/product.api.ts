import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type { ExportProductListREQ, ProductCreateREQ, ProductListREQ, ProductUpdateREQ } from './product.request';
import type {
  ErpOptionGroupsRESP,
  ProductCreateRESP,
  ProductDetailRESP,
  ProductExportRESP,
  ProductUpdateRESP,
  RawProductListRESP,
} from './product.response';

export function getProductsAPI(params: ProductListREQ): Promise<RawProductListRESP> {
  return api.get(ENDPOINTS.PRODUCTS.LIST, { params });
}

export function createProductAPI(payload: ProductCreateREQ): Promise<ProductCreateRESP> {
  return api.post(ENDPOINTS.PRODUCTS.CREATE, payload);
}

export function getProductDetailAPI(productId: string): Promise<ProductDetailRESP> {
  return api.get(ENDPOINTS.PRODUCTS.DETAIL(productId));
}

export function updateProductAPI(productId: string, payload: ProductUpdateREQ): Promise<ProductUpdateRESP> {
  return api.patch(ENDPOINTS.PRODUCTS.UPDATE(productId), payload);
}

export function deleteProductAPI(productId: string): Promise<ProductUpdateRESP> {
  return api.delete(ENDPOINTS.PRODUCTS.DELETE(productId));
}

export function getErpOptionGroupsAPI(): Promise<ErpOptionGroupsRESP> {
  return api.get(ENDPOINTS.PRODUCTS.MANAGEMENT_ERP_OPTION_GROUPS);
}

export function exportProductsExcelAPI(payload: ExportProductListREQ): Promise<ProductExportRESP> {
  return api.post(ENDPOINTS.PRODUCTS.EXPORT_EXCEL, payload);
}

export function checkProductExportStatusAPI(historyId: string | number): Promise<ProductExportRESP> {
  return api.get(ENDPOINTS.PRODUCTS.CHECK_EXPORT_STATUS(historyId));
}
