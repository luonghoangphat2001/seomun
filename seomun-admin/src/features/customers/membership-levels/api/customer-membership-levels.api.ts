import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { MembershipCustomerListREQ, OverrideCustomerMembershipREQ, UpdateMembershipLevelREQ } from './customer-membership-levels.request';
import type {
  CustomerMembershipOverrideRESP,
  MembershipCustomerListRESP,
  MembershipLevelListRawRESP,
  MembershipLevelRawRESP,
} from './customer-membership-levels.response';

export function getMembershipLevelsAPI(): Promise<MembershipLevelListRawRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.MEMBERSHIP_LEVELS);
}

export function getMembershipCustomersAPI(request: MembershipCustomerListREQ): Promise<MembershipCustomerListRESP> {
  return api.get(ENDPOINTS.CUSTOMERS.LIST, { params: request });
}

export function updateMembershipLevelAPI(request: UpdateMembershipLevelREQ): Promise<MembershipLevelRawRESP> {
  const { level_id: levelId, ...body } = request;
  return api.put(ENDPOINTS.CUSTOMERS.MEMBERSHIP_LEVEL(levelId), body);
}

export function overrideCustomerMembershipAPI(request: OverrideCustomerMembershipREQ): Promise<CustomerMembershipOverrideRESP> {
  return api.post(ENDPOINTS.CUSTOMERS.MEMBERSHIP_MEMBER_UPGRADE, request);
}
