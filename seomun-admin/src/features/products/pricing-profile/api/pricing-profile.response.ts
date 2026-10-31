import type { BaseResponse } from '@/types/api';

import type { PricingCalculatorType, PricingStructure } from '../enums';

export type PricingProfileSizeMapping = {
  printing_price_id?: number;
  [key: string]: unknown;
};

export type PricingProfileSectionSettings = {
  printing_price_id?: number;
  page_count_field?: string;
  side_option_group?: string;
  paper_option_group?: string;
  size_mappings?: Record<string, PricingProfileSizeMapping>;
  [key: string]: unknown;
};

export type PricingProfileSettings = {
  sections?: Partial<Record<'single' | 'cover' | 'inner', PricingProfileSectionSettings>>;
  legacy_rule?: Record<string, unknown>;
  migration_state?: string;
  supported_structures?: PricingStructure[];
  required_option_group_codes?: string[];
  [key: string]: unknown;
};

export type PricingProfile = {
  id: number;
  code: string;
  name: string;
  calculator_type: PricingCalculatorType;
  /** Legacy response may omit this; structures live in `settings.supported_structures`. */
  supported_structures?: PricingStructure[];
  /** The migration profile can return an empty array instead of a configuration object. */
  settings: PricingProfileSettings | unknown[];
  is_active: boolean;
  created_at?: string;
  updated_at: string;
};

export type PricingProfileListRESP = BaseResponse<{
  pricing_profiles: PricingProfile[];
}>;

export type PricingProfileToggleStatusRESP = BaseResponse<{
  pricing_profile: PricingProfile;
}>;
