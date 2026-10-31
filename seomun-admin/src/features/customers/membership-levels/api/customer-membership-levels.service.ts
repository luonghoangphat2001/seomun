import { MembershipLevelCode } from '../../enums';
import { getCustomerListService } from '../../list/api/customer-list.service';
import type { MembershipLevel } from '../../types/customer.type';
import { getMembershipLevelsAPI, overrideCustomerMembershipAPI, updateMembershipLevelAPI } from './customer-membership-levels.api';
import type { MembershipCustomerListREQ, OverrideCustomerMembershipREQ, UpdateMembershipLevelREQ } from './customer-membership-levels.request';
import type {
  CustomerMembershipOverrideRESP,
  MembershipCustomerListRESP,
  MembershipLevelListRESP,
  MembershipLevelListRawRESP,
  MembershipLevelRawRESP,
  MembershipLevelUpdateRESP,
  MembershipTierRaw,
} from './customer-membership-levels.response';

export async function getMembershipLevelsService(): Promise<MembershipLevelListRESP> {
  return mapMembershipLevelListResponse(await getMembershipLevelsAPI());
}

export async function getMembershipCustomersService(request: MembershipCustomerListREQ): Promise<MembershipCustomerListRESP> {
  return getCustomerListService(request);
}

export async function updateMembershipLevelService(request: UpdateMembershipLevelREQ): Promise<MembershipLevelUpdateRESP> {
  return mapMembershipLevelUpdateResponse(await updateMembershipLevelAPI(request));
}

export async function overrideCustomerMembershipService(request: OverrideCustomerMembershipREQ): Promise<CustomerMembershipOverrideRESP> {
  return overrideCustomerMembershipAPI(request);
}

function mapMembershipLevelListResponse(response: MembershipLevelListRawRESP): MembershipLevelListRESP {
  return {
    success: response.success,
    message: response.message,
    data: {
      levels: response.data.tiers.map(mapMembershipTier),
    },
  };
}

function mapMembershipLevelUpdateResponse(response: MembershipLevelRawRESP): MembershipLevelUpdateRESP {
  return {
    success: response.success,
    message: response.message,
    data: {
      level: mapMembershipTier(response.data),
    },
  };
}

function mapMembershipTier(tier: MembershipTierRaw): MembershipLevel {
  return {
    id: tier.id,
    code: mapMembershipLevelCode(tier.name),
    name: tier.name,
    conditionAmount: tier.condition_amount,
    promotionThreshold: tier.condition_amount,
    averageAmount: tier.average_quarterly_spend,
    accrualRate: tier.accrual_rate,
    freeShipping: tier.free_shipping,
    isActive: tier.is_active,
    displayOrder: tier.sort_order,
    memberCount: tier.members_count,
  };
}

function mapMembershipLevelCode(name: string): MembershipLevelCode {
  const normalizedName = name.trim().toUpperCase();
  if (normalizedName in MembershipLevelCode) return MembershipLevelCode[normalizedName as keyof typeof MembershipLevelCode];
  return MembershipLevelCode.FAMILY;
}
