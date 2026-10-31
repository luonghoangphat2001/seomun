import { CustomerApprovalStatus } from '../../enums';
import { getExposureCustomersAPI, getPromotionalProductsAPI, updatePromotionalProductsAPI } from './customer-exposure.api';
import type { ExposureCustomerListREQ, PromotionalProductListREQ, UpdatePromotionalProductsREQ } from './customer-exposure.request';
import type {
  ExposureCustomerListRawRESP,
  ExposureCustomerListRESP,
  PromotionalProductListRawRESP,
  PromotionalProductListRESP,
  PromotionalProductRawItem,
  UpdatePromotionalProductsRESP,
} from './customer-exposure.response';

function mapWireApprovalStatus(value: string): CustomerApprovalStatus {
  const normalized = value.toLowerCase();
  if (normalized === 'accepted' || normalized === 'approved') return CustomerApprovalStatus.APPROVED;
  if (normalized === 'rejected') return CustomerApprovalStatus.REJECTED;
  return CustomerApprovalStatus.PENDING;
}

function mapExposureCustomersResponse(response: ExposureCustomerListRawRESP): ExposureCustomerListRESP {
  const pagination = response.data.pagination ??
    response.pagination ?? {
      current_page: 1,
      per_page: response.data.members.length,
      total_page: 1,
      total_item: response.data.members.length,
    };

  return {
    success: response.success,
    message: response.message,
    data: {
      members: response.data.members.map((item) => ({
        id: item.id,
        name: item.name,
        username: item.username,
        email: item.email,
        phone: item.phone,
        mobile: item.mobile,
        status: item.status,
        approvalStatus: {
          value: mapWireApprovalStatus(item.approval_status.value),
          label: item.approval_status.label,
        },
        authority: item.authority,
        isMasterAccount: item.authority.value?.toLowerCase() === 'master',
        dateOfJoining: item.date_of_joining,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })),
      pagination,
    },
  };
}

function mapRawPromotionalProduct(item: PromotionalProductRawItem) {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category ?? null,
    price: Number(item.price) || 0,
    isPromoted: item.is_promoted,
    sortOrder: item.sort_order ?? undefined,
  };
}

function mapPromotionalProductsResponse(response: PromotionalProductListRawRESP): PromotionalProductListRESP {
  const products = response.data.products.map(mapRawPromotionalProduct);
  const pagination = response.data.pagination ??
    response.pagination ?? {
      current_page: 1,
      per_page: products.length,
      total_page: 1,
      total_item: products.length,
    };

  return {
    success: response.success,
    message: response.message,
    data: {
      products,
      promotional_product_ids: response.data.promotional_product_ids ?? products.filter((product) => product.isPromoted).map((product) => product.id),
      pagination,
    },
  };
}

export async function getExposureCustomersService(request: ExposureCustomerListREQ): Promise<ExposureCustomerListRESP> {
  const response = await getExposureCustomersAPI(request);
  return mapExposureCustomersResponse(response);
}

export async function getPromotionalProductsService(request: PromotionalProductListREQ): Promise<PromotionalProductListRESP> {
  const response = await getPromotionalProductsAPI(request);
  return mapPromotionalProductsResponse(response);
}

export async function updatePromotionalProductsService(request: UpdatePromotionalProductsREQ): Promise<UpdatePromotionalProductsRESP> {
  return updatePromotionalProductsAPI(request);
}
