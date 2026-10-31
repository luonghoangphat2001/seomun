import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { customerListKeys } from '../../list';
import type { CustomerApprovalDecisionREQ, CustomerApprovalListREQ } from './customer-approvals.request';
import { decideCustomerApprovalsService, getCustomerApprovalHistoryService, getCustomerApprovalRequestsService } from './customer-approvals.service';

export const customerApprovalsKeys = {
  all: ['customers', 'approvals'] as const,
  requests: (request: CustomerApprovalListREQ) => [...customerApprovalsKeys.all, 'requests', request] as const,
  history: (request: CustomerApprovalListREQ) => [...customerApprovalsKeys.all, 'history', request] as const,
};

export function useCustomerApprovalRequestsQuery(request: CustomerApprovalListREQ) {
  return useQuery({
    queryKey: customerApprovalsKeys.requests(request),
    queryFn: () => getCustomerApprovalRequestsService(request),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerApprovalHistoryQuery(request: CustomerApprovalListREQ) {
  return useQuery({
    queryKey: customerApprovalsKeys.history(request),
    queryFn: () => getCustomerApprovalHistoryService(request),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerApprovalDecisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CustomerApprovalDecisionREQ) => decideCustomerApprovalsService(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerApprovalsKeys.all }),
        queryClient.invalidateQueries({ queryKey: customerListKeys.all }),
      ]);
    },
  });
}
