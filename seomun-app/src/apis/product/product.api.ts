import { api, fetcher } from '@/config';
import { BaseResponse, PaginationResponse } from '@/types';
import {
  ProductDetailReviewREQ,
  ProductQuoteREQ,
  ProductSearchREQ,
  ProductSpineREQ,
  ProductTemplateREQ,
  ProductUploadFileREQ,
} from './product.request';
import {
  OrderQuoteRESP,
  PaperResponse,
  PaperTypeRESP,
  PopularProductRESP,
  ProductDetailRESP,
  ProductQuoteRESP,
  ProductReviewListRESP,
  ProductsByCategoryRESP,
  ProductSearchRESP,
  ProductSizeRESP,
  ProductSpineResponse,
  ProductUnitPriceSettingRESP,
  ProductUploadFileResponse,
  TemplateRESP,
} from './product.response';

export const ENDPOINTS = {
  GET_POPULAR_PRODUCTS: '/products/popular',
  GET_PRODUCTS: '/products',
  GET_PRODUCT_BY_CATEGORY: (slug: string) => `/categories/${slug}/products`,
  GET_PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  GET_PRODUCT_SEARCH: `/products/search`,
  GET_PAPER: (productId?: number) => `/products/${productId}/papers`,
  GET_ALL_PAPER: `/papers`,
  GET_SIZE_OPTIONS: (productId?: number) => `/products/${productId}/size-options`,
  GET_PRODUCT_TEMPLATES: (productSlug?: string) => `/products/${productSlug}/templates`,
  GET_PRODUCT_QUOTATION: (productId?: number) => `/products/${productId}/quote`,
  GET_ORDER_QUOTATION: '/orders/quote',
  PRODUCT_UPLOAD_FILE: '/designs/store-upload-file',
  GET_SPINE_CALCULATOR: '/products/spine-calculator',
  PRODUCT_DETAIL_REVIEW: (productSlug: string) => `/products/${productSlug}/reviews`,
  UNIT_PRICE_SETTING: (productSlug: string) => `/products/${productSlug}/unit-prices`,
};

export const ProductApi = {
  getPopularProducts: async (params: { limit: number }, requestOption?: RequestInit) =>
    fetcher.get<BaseResponse<PopularProductRESP>>(ENDPOINTS.GET_POPULAR_PRODUCTS, {
      params: { ...(params ?? {}) },
      ...requestOption,
    }),

  getProductByCategory: (params: { slug: string }, requestOption?: RequestInit) =>
    fetcher.get<BaseResponse<ProductsByCategoryRESP>>(ENDPOINTS.GET_PRODUCT_BY_CATEGORY(params.slug), {
      params: { ...(params ?? {}) },
      ...requestOption,
    }),

  getProductDetail: (slug: string, requestOption?: RequestInit) => {
    return fetcher.get<BaseResponse<ProductDetailRESP>>(ENDPOINTS.GET_PRODUCT_DETAIL(slug), {
      ...requestOption,
    });
  },

  getProductDetailBySlug: (slug: string) => api.get<BaseResponse<ProductDetailRESP>>(ENDPOINTS.GET_PRODUCT_DETAIL(slug)),

  getProductBySearch: (params?: ProductSearchREQ) =>
    api.get<PaginationResponse<ProductSearchRESP>>(ENDPOINTS.GET_PRODUCT_SEARCH, { params }),

  getPaperTypeByProduct: (productId: number) => api.get<BaseResponse<PaperTypeRESP>>(ENDPOINTS.GET_PAPER(productId)),
  getAllPaper: () => api.get<BaseResponse<PaperResponse>>(ENDPOINTS.GET_ALL_PAPER),
  getSizeOptionsByProduct: (productId: number) => api.get<BaseResponse<ProductSizeRESP>>(ENDPOINTS.GET_SIZE_OPTIONS(productId)),

  getTemplatesByProduct: (params: ProductTemplateREQ) =>
    api.get<BaseResponse<TemplateRESP>>(ENDPOINTS.GET_PRODUCT_TEMPLATES(params.slug), { params }),

  //get quote - price calculation
  getOrderQuotation: (body: ProductQuoteREQ) => api.post<BaseResponse<OrderQuoteRESP>>(ENDPOINTS.GET_ORDER_QUOTATION, body),
  getProductQuotation: (body: ProductQuoteREQ) =>
    api.post<BaseResponse<ProductQuoteRESP>>(ENDPOINTS.GET_PRODUCT_QUOTATION(body.product_id), body),

  //upload file
  uploadProductFile: (body: ProductUploadFileREQ) =>
    api.post<BaseResponse<ProductUploadFileResponse>>(ENDPOINTS.PRODUCT_UPLOAD_FILE, body),

  calculateProductSpine: (body: ProductSpineREQ) =>
    api.post<BaseResponse<ProductSpineResponse>>(ENDPOINTS.GET_SPINE_CALCULATOR, body),

  getReviewList: ({ slug, ...params }: ProductDetailReviewREQ) =>
    api.get<BaseResponse<ProductReviewListRESP>>(ENDPOINTS.PRODUCT_DETAIL_REVIEW(slug), { params }),

  getProductUnitPriceSetting: (productSlug: string) =>
    api.get<BaseResponse<ProductUnitPriceSettingRESP[]>>(ENDPOINTS.UNIT_PRICE_SETTING(productSlug)),
};
