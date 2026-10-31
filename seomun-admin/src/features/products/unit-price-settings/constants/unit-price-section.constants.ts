export type UnitPriceSectionKey = 'papers' | 'printing' | 'post_processing' | 'other';

export const UNIT_PRICE_SECTION_OPTIONS: Array<{ label: string; value: UnitPriceSectionKey }> = [
  { label: 'Paper Management', value: 'papers' },
  { label: 'Printing Unit Price', value: 'printing' },
  { label: 'Post-processing Unit Price', value: 'post_processing' },
  { label: 'Other', value: 'other' },
];

export const DEFAULT_UNIT_PRICE_SECTION: UnitPriceSectionKey = 'papers';

export function isUnitPriceSectionKey(value: unknown): value is UnitPriceSectionKey {
  return UNIT_PRICE_SECTION_OPTIONS.some((section) => section.value === value);
}

export function getSectionLabel(section: UnitPriceSectionKey) {
  return UNIT_PRICE_SECTION_OPTIONS.find((option) => option.value === section)?.label ?? 'Unit Price Settings';
}
