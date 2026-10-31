import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { customerListKeys } from '../../list';
import { customerMembershipLevelKeys } from '../../membership-levels';
import {
  applyPointManualAdjustmentService,
  getPointChangeLogsService,
  getPointHistoryService,
  getPointSettingsService,
  getPointTargetMembersService,
  mapPointFilterFormToRequest,
  mapPointManualAdjustmentFormToRequest,
  mapPointMembershipOverrideFormToRequest,
  mapPointSettingsFormToRequest,
  overridePointMembershipService,
  updatePointSettingsService,
} from './customer-points.service';
import type {
  PointManagementFilterFormValues,
  PointManualAdjustmentFormValues,
  PointMembershipOverrideFormValues,
  PointSettingsFormValues,
} from '../schemas';

export const customerPointsKeys = {
  all: ['customers', 'points'] as const,
  history: (filters: PointManagementFilterFormValues) => [...customerPointsKeys.all, 'history', filters] as const,
  settings: () => [...customerPointsKeys.all, 'settings'] as const,
  changeLogs: () => [...customerPointsKeys.all, 'change-logs'] as const,
  targets: () => [...customerPointsKeys.all, 'targets'] as const,
};

export function usePointHistoryQuery(filters: PointManagementFilterFormValues) {
  return useQuery({
    queryKey: customerPointsKeys.history(filters),
    queryFn: () => getPointHistoryService(mapPointFilterFormToRequest(filters)),
    placeholderData: keepPreviousData,
  });
}

export function usePointSettingsQuery() {
  return useQuery({
    queryKey: customerPointsKeys.settings(),
    queryFn: getPointSettingsService,
  });
}

export function usePointChangeLogsQuery() {
  return useQuery({
    queryKey: customerPointsKeys.changeLogs(),
    queryFn: getPointChangeLogsService,
  });
}

export function usePointTargetMembersQuery() {
  return useQuery({
    queryKey: customerPointsKeys.targets(),
    queryFn: getPointTargetMembersService,
  });
}

export function usePointSettingsUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PointSettingsFormValues) => updatePointSettingsService(mapPointSettingsFormToRequest(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerPointsKeys.all });
    },
  });
}

export function usePointManualAdjustmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PointManualAdjustmentFormValues) => applyPointManualAdjustmentService(mapPointManualAdjustmentFormToRequest(values)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerPointsKeys.all }),
        queryClient.invalidateQueries({ queryKey: customerListKeys.all }),
        queryClient.invalidateQueries({ queryKey: customerMembershipLevelKeys.all }),
      ]);
    },
  });
}

export function usePointMembershipOverrideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PointMembershipOverrideFormValues) => overridePointMembershipService(mapPointMembershipOverrideFormToRequest(values)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerPointsKeys.all }),
        queryClient.invalidateQueries({ queryKey: customerListKeys.all }),
      ]);
    },
  });
}
