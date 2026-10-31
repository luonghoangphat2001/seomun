import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { OutsourcingCreateREQ, OutsourcingListREQ, OutsourcingUpdateREQ } from './outsourcing.request';
import type {
  CreateOutsourcingRESP,
  DeleteOutsourcingRESP,
  OutsourcingDetailRESP,
  OutsourcingListRESP,
  UpdateOutsourcingRESP,
} from './outsourcing.response';

export const getOutsourcingAPI = (params: OutsourcingListREQ): Promise<OutsourcingListRESP> => {
  return api.get(ENDPOINTS.OUTSOURCING.LIST, { params });
};

export const getOutsourcingDetailAPI = (outsourcingId: number): Promise<OutsourcingDetailRESP> => {
  return api.get(ENDPOINTS.OUTSOURCING.DETAIL(outsourcingId));
};

export const createOutsourcingAPI = (data: OutsourcingCreateREQ): Promise<CreateOutsourcingRESP> => {
  return api.post(ENDPOINTS.OUTSOURCING.CREATE, data);
};

export const updateOutsourcingAPI = (outsourcingId: number, data: OutsourcingUpdateREQ): Promise<UpdateOutsourcingRESP> => {
  return api.patch(ENDPOINTS.OUTSOURCING.UPDATE(outsourcingId), data);
};

export const deleteOutsourcingAPI = (outsourcingId: number): Promise<DeleteOutsourcingRESP> => {
  return api.delete(ENDPOINTS.OUTSOURCING.DELETE(outsourcingId));
};
