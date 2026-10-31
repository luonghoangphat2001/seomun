import { BoardType } from '@/enums/board-notice';
import { useQuery } from '@tanstack/react-query';
import { BoardNoticeConfigApi } from './board-notice-config.api';

export const boardNoticeConfigQueryKeys = {
  DETAIL: 'BOARD_NOTICE_CONFIG_DETAIL',
};

export const useBoardNoticeConfigQuery = (boardType?: BoardType) =>
  useQuery({
    queryKey: [boardNoticeConfigQueryKeys.DETAIL, boardType],
    queryFn: () => BoardNoticeConfigApi.detail(boardType as BoardType),
    select: (resp) => resp.data,
    enabled: !!boardType,
  });
