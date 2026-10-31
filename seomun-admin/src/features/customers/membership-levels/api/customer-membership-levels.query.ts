import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { customerListKeys } from '../../list';
import {
  getMembershipCustomersService,
  getMembershipLevelsService,
  overrideCustomerMembershipService,
  updateMembershipLevelService,
} from './customer-membership-levels.service';
import type { MembershipCustomerListREQ, OverrideCustomerMembershipREQ, UpdateMembershipLevelREQ } from './customer-membership-levels.request';

export const customerMembershipLevelKeys = {
  all: ['customers', 'membership-levels'] as const,
  levels: () => [...customerMembershipLevelKeys.all, 'levels'] as const,
  customers: (request: MembershipCustomerListREQ) => [...customerMembershipLevelKeys.all, 'customers', request] as const,
};

export function useMembershipLevelsQuery() {
  return useQuery({
    queryKey: customerMembershipLevelKeys.levels(),
    queryFn: getMembershipLevelsService,
  });
}

export function useMembershipCustomersQuery(request: MembershipCustomerListREQ) {
  return useQuery({
    queryKey: customerMembershipLevelKeys.customers(request),
    queryFn: () => getMembershipCustomersService(request),
  });
}

export function useMembershipLevelUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateMembershipLevelREQ) => updateMembershipLevelService(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerMembershipLevelKeys.all });
    },
  });
}

export function useCustomerMembershipOverrideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: OverrideCustomerMembershipREQ) => overrideCustomerMembershipService(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerMembershipLevelKeys.all }),
        queryClient.invalidateQueries({ queryKey: customerListKeys.all }),
      ]);
    },
  });
}
