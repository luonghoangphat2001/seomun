import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { DesignsApi } from './designs.api';
import { DesignsListREQ } from './designs.request';
import { PaginationRESP } from '@/types';

export const DESIGNS_QUERY_KEYS = {
  LIST: 'DESIGNS_LIST',
  AVAILABLE_SIZES: 'DESIGNS_AVAILABLE_SIZES',
};

export const useDesignsListQuery = (params?: DesignsListREQ, enabled = true) =>
  useInfiniteQuery({
    queryKey: [DESIGNS_QUERY_KEYS.LIST, params],
    initialPageParam: params?.page ?? 1,
    queryFn: ({ pageParam }) => DesignsApi.list({ ...params, page: pageParam }),
    getNextPageParam: (resp) => {
      const pagination =
        (resp as { pagination?: PaginationRESP }).pagination ??
        (resp.data as { pagination?: PaginationRESP } | undefined)?.pagination;
      if (!pagination) return undefined;

      const currentPage = pagination.current_page || 1;
      const lastPage = pagination.last_page || pagination.total_page || 1;

      return currentPage < lastPage ? currentPage + 1 : undefined;
    },
    enabled,
    refetchOnWindowFocus: true,
  });

export const useDesignAvailableSizesQuery = (enabled = true) =>
  useQuery({
    queryKey: [DESIGNS_QUERY_KEYS.AVAILABLE_SIZES],
    queryFn: DesignsApi.availableSizes,
    select: (resp) => resp.data.sizes,
    enabled,
  });
