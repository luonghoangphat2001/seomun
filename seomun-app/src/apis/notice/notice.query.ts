import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { NoticeListREQ } from './notice.request';
import { NoticeApi } from './notice.api';

export const NOTICE_QUERY_KEYS = {
  LIST: 'NOTICE_LIST',
  MOBILE_LIST: 'NOTICE_MOBILE_LIST',
  DETAIL: 'NOTICE_DETAIL',
};

export const useNoticeListQuery = (params?: NoticeListREQ, isMyPage?: boolean) =>
  useQuery({
    queryKey: [NOTICE_QUERY_KEYS.LIST, params, isMyPage],
    queryFn: () => NoticeApi.list(params, isMyPage),
    select: (resp) => ({
      list: resp.data.notices,
      pagination: resp.pagination,
    }),
  });

export const useNoticeMobileListQuery = (params?: NoticeListREQ, enabled?: boolean, isMyPage?: boolean) =>
  useInfiniteQuery({
    queryKey: [NOTICE_QUERY_KEYS.MOBILE_LIST, params, isMyPage],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => NoticeApi.list({ ...params, page: pageParam }, isMyPage),
    getNextPageParam: (resp) => {
      const pagination = resp.pagination;

      const currentPage = pagination.current_page || 1;
      const totalPage = pagination.total_page || 1;

      return currentPage < totalPage ? currentPage + 1 : undefined;
    },
    enabled,
  });

export const useNoticeDetailQuery = (id?: number, isMyPage?: boolean) =>
  useQuery({
    queryKey: [NOTICE_QUERY_KEYS.DETAIL, id, isMyPage],
    queryFn: () => NoticeApi.detail(id as number, isMyPage),
    select: (resp) => resp.data.notice,
    enabled: !!id,
  });
