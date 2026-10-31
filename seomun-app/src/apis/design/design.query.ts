import { BaseResponse, ErrorRESP } from '@/types';
import { useInfiniteQuery, useMutation, UseMutationOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { DesignCreateRESP } from './design.response';
import { AxiosError } from 'axios';
import { DesignCreateREQ, DesignUpdateREQ } from './design.request';
import { DesignApi } from './design.api';
import { DesignSourceType } from '@/enums/common';

export const designQueryKeys = {
  DETAIL: 'DESIGN_DETAIL',
  HISTORY: 'DESIGN_HISTORY',
};

export const useDesignDetailQuery = (designId?: number) =>
  useQuery({
    queryKey: [designQueryKeys.DETAIL, designId],
    queryFn: () => DesignApi.detail(designId as number),
    select: (resp) => resp.data,
    enabled: !!designId,
  });

export const useCreateDesignEditorMutation = (
  options?: UseMutationOptions<BaseResponse<DesignCreateRESP>, AxiosError<ErrorRESP>, DesignCreateREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: DesignApi.create,
  });

export const useUpdateDesignEditorMutation = (
  options?: UseMutationOptions<BaseResponse<DesignCreateRESP>, AxiosError<ErrorRESP>, DesignUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DesignApi.update,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: [designQueryKeys.DETAIL] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDesignHistoryListQuery = (productId?: number) =>
  useInfiniteQuery({
    queryKey: [designQueryKeys.HISTORY, productId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      DesignApi.history({
        page: pageParam,
        productId,
        source_type: DesignSourceType.WEB_EDITOR,
        per_page: 16,
        sort_by: 'created_at',
        sort_order: 'desc',
      }),
    getNextPageParam: (resp) => {
      const currentPage = resp.pagination.current_page ?? 1;
      const lastPage = resp.pagination.last_page ?? resp.pagination.total_page ?? 1;

      return currentPage < lastPage ? currentPage + 1 : undefined;
    },
    enabled: !!productId,
  });
