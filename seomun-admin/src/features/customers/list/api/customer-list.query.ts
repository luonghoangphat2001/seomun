import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CustomerBasicInfoFormValues, CustomerChangePasswordFormValues, CustomerCompanyInfoSubmitValues, CustomerListSearch } from '../schemas';
import {
  changeCustomerPasswordService,
  exportCustomerListAndGetFileService,
  getCustomerDetailService,
  getCustomerListService,
  getCustomerSearchFiltersService,
  getProxyLoginService,
  mapChangePasswordFormValuesToRequest,
  mapCustomerFullInfoToRequest,
  mapCustomerListSearchToRequest,
  updateCustomerBasicInfoService,
} from './customer-list.service';

export const customerListKeys = {
  all: ['customers', 'list'] as const,
  list: (search: CustomerListSearch) => [...customerListKeys.all, 'collection', search] as const,
  infinite: (search: CustomerListSearch) => [...customerListKeys.all, 'infinite', search] as const,
  filters: () => [...customerListKeys.all, 'filters'] as const,
  detail: (memberId: number) => [...customerListKeys.all, 'detail', memberId] as const,
};

const DEFAULT_INFINITE_PER_PAGE = 20;

export function useCustomerListInfiniteQuery(search: CustomerListSearch) {
  return useInfiniteQuery({
    queryKey: customerListKeys.infinite(search),
    queryFn: ({ pageParam }) =>
      getCustomerListService(mapCustomerListSearchToRequest({ ...search, page: pageParam, per_page: search.per_page ?? DEFAULT_INFINITE_PER_PAGE })),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_page } = lastPage.data.pagination;
      return current_page < total_page ? current_page + 1 : undefined;
    },
    placeholderData: keepPreviousData,
  });
}

export function useCustomerListQuery(search: CustomerListSearch) {
  return useQuery({
    queryKey: customerListKeys.list(search),
    queryFn: () => getCustomerListService(mapCustomerListSearchToRequest(search)),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerSearchFiltersQuery() {
  return useQuery({
    queryKey: customerListKeys.filters(),
    queryFn: getCustomerSearchFiltersService,
  });
}

export function useCustomerDetailQuery(memberId: number) {
  return useQuery({
    queryKey: customerListKeys.detail(memberId),
    queryFn: () => getCustomerDetailService(memberId),
    enabled: Number.isFinite(memberId) && memberId > 0,
  });
}

// The update endpoint replaces the whole record, so every mutate() call must be given the full
function useCustomerFullInfoUpdateMutation(memberId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CustomerBasicInfoFormValues & CustomerCompanyInfoSubmitValues) =>
      updateCustomerBasicInfoService(mapCustomerFullInfoToRequest(memberId, values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerListKeys.all });
    },
  });
}

export function useCustomerBasicInfoUpdateMutation(memberId: number) {
  return useCustomerFullInfoUpdateMutation(memberId);
}

export function useCustomerCompanyInfoUpdateMutation(memberId: number) {
  return useCustomerFullInfoUpdateMutation(memberId);
}

export function useCustomerChangePasswordMutation(memberId: number) {
  return useMutation({
    mutationFn: (values: CustomerChangePasswordFormValues) => changeCustomerPasswordService(mapChangePasswordFormValuesToRequest(memberId, values)),
  });
}

export function useProxyLoginMutation() {
  return useMutation({
    mutationFn: (memberId: number) => getProxyLoginService(memberId),
  });
}

export function useCustomerExportMutation() {
  return useMutation({
    mutationFn: exportCustomerListAndGetFileService,
  });
}
