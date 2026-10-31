import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import { getBoardConfigsAPI, updateBoardConfigAPI } from './board.api';
import type { BoardConfigREQ } from './board.request';
import type { BoardItem } from './board.response';

export const boardKeys = {
  all: ['board-configs'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
};

export const useBoardConfigsQuery = (options?: Omit<UseQueryOptions<BoardItem[], AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<BoardItem[], AxiosError<IBaseError>>({
    ...options,
    queryKey: boardKeys.lists(),
    queryFn: getBoardConfigsAPI,
    staleTime: 30_000,
  });
};

export const useUpdateBoardConfigMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<IBaseError>, BoardConfigREQ>({
    mutationFn: updateBoardConfigAPI,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<BoardItem[]>(boardKeys.lists(), (prev) =>
        prev?.map((item) =>
          item.board_type === variables.boardType
            ? { ...item, notice_enabled: variables.notice_enabled, notice_message: variables.notice_message }
            : item,
        ),
      );
    },
  });
};
