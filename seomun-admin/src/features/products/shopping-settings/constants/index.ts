import { ShoppingSettingType } from '../enums';

export type ShoppingGuideSectionConfig = {
  type: ShoppingSettingType;
  labelKey: string;
};

export const SHOPPING_GUIDE_SECTIONS: ShoppingGuideSectionConfig[] = [
  { type: ShoppingSettingType.GeneralProductionGuide, labelKey: 'page.products.shopping_settings.sections.common_production_guide' },
  { type: ShoppingSettingType.GeneralPrecautions, labelKey: 'page.products.shopping_settings.sections.common_precautions' },
  { type: ShoppingSettingType.ShipmentDeliveryInformation, labelKey: 'page.products.shopping_settings.sections.shipping_delivery' },
  { type: ShoppingSettingType.UserGuide, labelKey: 'page.products.shopping_settings.sections.user_guide' },
];

export const DEFAULT_SHOPPING_GUIDE_SECTION = SHOPPING_GUIDE_SECTIONS[0].type;
