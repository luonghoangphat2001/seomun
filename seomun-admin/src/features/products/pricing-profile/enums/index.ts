export enum PricingCalculatorType {
  PAPER_PRINT = 'paper_print',
  UNIT_TIER = 'unit_tier',
  AREA_UNIT = 'area_unit',
  MATRIX = 'matrix',
}

export enum PricingStructure {
  SINGLE = 'single',
  COVER_INNER = 'cover_inner',
}

export type PricingProfileSectionKey = 'single' | 'cover' | 'inner';
