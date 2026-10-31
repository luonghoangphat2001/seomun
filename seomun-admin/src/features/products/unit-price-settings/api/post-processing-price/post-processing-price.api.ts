import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { PostProcessingPriceCreateREQ, PostProcessingPriceListREQ, PostProcessingPriceUpdateREQ } from './post-processing-price.request';
import type { PostProcessingPriceActionRESP, PostProcessingPriceDetailRESP, PostProcessingPriceListRESP } from './post-processing-price.response';

export const getPostProcessingPricesAPI = (params: PostProcessingPriceListREQ): Promise<PostProcessingPriceListRESP> =>
  api.get(ENDPOINTS.POST_PROCESSING_PRICES.LIST, { params });

export const getPostProcessingPriceDetailAPI = (id: number): Promise<PostProcessingPriceDetailRESP> =>
  api.get(ENDPOINTS.POST_PROCESSING_PRICES.DETAIL(id));

export const createPostProcessingPriceAPI = (payload: PostProcessingPriceCreateREQ): Promise<PostProcessingPriceActionRESP> =>
  api.post(ENDPOINTS.POST_PROCESSING_PRICES.CREATE, payload);

export const updatePostProcessingPriceAPI = (id: number, payload: PostProcessingPriceUpdateREQ): Promise<PostProcessingPriceActionRESP> =>
  api.put(ENDPOINTS.POST_PROCESSING_PRICES.UPDATE(id), payload);

export const deletePostProcessingPriceAPI = (id: number): Promise<void> => api.delete(ENDPOINTS.POST_PROCESSING_PRICES.DELETE(id));
