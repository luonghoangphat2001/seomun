import { useQuery } from '@tanstack/react-query';
import { GuideApi } from './guide.api';
import { GuideListREQ } from './guide.request';

export const GUIDE_QUERY_KEYS = {
  LIST: 'GUIDE_LIST',
};

export const useGuideListQuery = (params?: GuideListREQ) =>
  useQuery({
    queryKey: [GUIDE_QUERY_KEYS.LIST, params],
    queryFn: () => GuideApi.getList(params),
    select: (resp) => ({
      list: resp.data.guide_contents,
      pagination: resp.pagination,
    }),
  });
