import { api } from '@/config';
import { BoardType } from '@/enums/board-notice';
import { BaseResponse } from '@/types';
import { BoardNoticeConfigRESP } from './board-notice-config.response';

export const ENDPOINTS = {
  BOARD_NOTICE_CONFIG_DETAIL: (boardType: BoardType) => `/board-notice-configs/${boardType}`,
};

export const BoardNoticeConfigApi = {
  detail: (boardType: BoardType) => api.get<BaseResponse<BoardNoticeConfigRESP>>(ENDPOINTS.BOARD_NOTICE_CONFIG_DETAIL(boardType)),
};
