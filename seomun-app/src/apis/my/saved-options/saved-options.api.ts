import { api } from '@/config';
import { SavedOptionCreateREQ, SavedOptionListREQ } from './saved-options.request';
import { PaginationResponse } from '@/types';
import { SavedOptionListRESP } from './saved-options.response';

const ENDPOINT = {
  ROOT: '/mypage/saved-options',
};

export const SavedOptionApi = {
  list: (params?: SavedOptionListREQ) => api.get<PaginationResponse<SavedOptionListRESP>>(ENDPOINT.ROOT, { params }),
  create: (body: SavedOptionCreateREQ) => api.post(ENDPOINT.ROOT, body),
  delete: (id: number) => api.delete(`${ENDPOINT.ROOT}/${id}`),
};
