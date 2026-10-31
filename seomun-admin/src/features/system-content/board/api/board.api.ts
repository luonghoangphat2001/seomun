import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { BoardConfigREQ } from './board.request';
import type { BoardItem, BoardListRESP } from './board.response';

export const getBoardConfigsAPI = async (): Promise<BoardItem[]> => {
  const response = await api.get<BoardListRESP>(ENDPOINTS.BOARD.LIST);
  return response.data.configs;
};

export const updateBoardConfigAPI = async ({ boardType, ...payload }: BoardConfigREQ): Promise<void> => {
  await api.put(ENDPOINTS.BOARD.UPDATE(boardType), payload);
};
