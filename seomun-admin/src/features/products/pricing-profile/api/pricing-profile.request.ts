import type { PricingCalculatorType } from '../enums';

export type PricingProfileStatusUpdateREQ = {
  code: string;
  name: string;
  calculator_type: PricingCalculatorType;
  is_active: boolean;
};
