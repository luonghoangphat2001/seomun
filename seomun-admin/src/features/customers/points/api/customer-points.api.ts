import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { PointHistoryREQ, PointManualAdjustmentREQ, PointMembershipOverrideREQ, PointSettingsREQ } from './customer-points.request';
import type {
  PointChangeLogsRESP,
  PointHistoryRawRESP,
  PointManualAdjustmentRESP,
  PointMembershipOverrideRESP,
  PointSettingsRawRESP,
  PointTargetMembersRESP,
} from './customer-points.response';

export function getPointHistoryAPI(request: PointHistoryREQ): Promise<PointHistoryRawRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.POINT_HISTORY, { params: request });
}

export function getPointSettingsAPI(): Promise<PointSettingsRawRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.POINT_SETTINGS);
}

export function updatePointSettingsAPI(request: PointSettingsREQ): Promise<PointSettingsRawRESP> {
  return api.put(ENDPOINTS.CUSTOMERS.POINT_SETTINGS, request);
}

export function getPointChangeLogsAPI(): Promise<PointChangeLogsRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.POINT_CHANGE_LOGS);
}

export function getPointTargetMembersAPI(): Promise<PointTargetMembersRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.POINT_TARGET_MEMBERS);
}

export function applyPointManualAdjustmentAPI(request: PointManualAdjustmentREQ): Promise<PointManualAdjustmentRESP> {
  return api.post(ENDPOINTS.CUSTOMERS.POINT_ADJUSTMENTS, request);
}

export function overridePointMembershipAPI(request: PointMembershipOverrideREQ): Promise<PointMembershipOverrideRESP> {
  return api.patch(ENDPOINTS.CUSTOMERS.MEMBERSHIP_OVERRIDE(request.customer_id), request);
}
