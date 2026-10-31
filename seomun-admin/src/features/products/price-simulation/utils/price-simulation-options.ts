import {
  BOOK_OPTION_GROUP_CODES,
  type AdminProductOption,
  type AdminProductOptionGroup,
  type AdminProductRESP,
} from '@/features/products/management';
import { ErpOptionGroupCode } from '@/features/products/options';

import type {
  PriceSimulationBookPageCountsREQ,
  PriceSimulationInputOptionsREQ,
  PriceSimulationSelectedOptionREQ,
} from '../api/price-simulation.request';

export type PriceSimulationOptionSelections = Record<number, number[]>;

const BOOK_CATEGORY_IDS = new Set([1, 2]); // book, hot deal booklet

// Booklets registered outside the book categories: 링책자, 중철책자, 양장책자, 무선책자.
const BOOK_PRODUCT_IDS = new Set([72, 63, 62, 46]);

export const BOOK_PAGE_COUNT_BY_GROUP_CODE: Record<string, keyof PriceSimulationBookPageCountsREQ> = {
  [BOOK_OPTION_GROUP_CODES.COVER_PAPER]: 'cover_page_count',
  [ErpOptionGroupCode.PAPER_COVER]: 'cover_page_count',
  [BOOK_OPTION_GROUP_CODES.INNER_PAPER]: 'inner_page_count',
  [ErpOptionGroupCode.PAPER_INSIDE]: 'inner_page_count',
  [BOOK_OPTION_GROUP_CODES.ADDITIONAL_PAPER]: 'additional_page_count',
  [BOOK_OPTION_GROUP_CODES.COLORED_PAPER_1]: 'colored_page_count_1',
  [BOOK_OPTION_GROUP_CODES.COLORED_PAPER_2]: 'colored_page_count_2',
  [BOOK_OPTION_GROUP_CODES.FLYLEAF_PAPER]: 'flyleaf_count',
};

export const DEFAULT_BOOK_PAGE_COUNTS: PriceSimulationBookPageCountsREQ = {
  cover_page_count: 1,
  inner_page_count: 1,
  additional_page_count: 0,
  colored_page_count_1: 0,
  colored_page_count_2: 0,
  flyleaf_count: 0,
};

export function isBookProduct(product: AdminProductRESP | undefined): boolean {
  if (!product) return false;

  return BOOK_CATEGORY_IDS.has(product.category_id ?? 0) || BOOK_PRODUCT_IDS.has(product.id);
}

export function getOptionGroupId(group: AdminProductOptionGroup): number {
  return group.id ?? group.erp_option_group_id ?? 0;
}

export function getOptionId(option: AdminProductOption): number {
  return option.id ?? option.erp_option_id ?? 0;
}

const POST_PROCESSING_GROUP_CODES: string[] = [
  ErpOptionGroupCode.FOUNDATION,
  ErpOptionGroupCode.COATED,
  ErpOptionGroupCode.PERFORATION,
  ErpOptionGroupCode.ROUNDING,
  ErpOptionGroupCode.OSHI,
  ErpOptionGroupCode.GROUNDING,
  ErpOptionGroupCode.NUMBERING,
  ErpOptionGroupCode.DOMUSONG,
];

const OPTIONAL_BOOK_PAPER_CODES: string[] = [
  BOOK_OPTION_GROUP_CODES.ADDITIONAL_PAPER,
  BOOK_OPTION_GROUP_CODES.COLORED_PAPER_1,
  BOOK_OPTION_GROUP_CODES.COLORED_PAPER_2,
  BOOK_OPTION_GROUP_CODES.FLYLEAF_PAPER,
];

export function isPostProcessingGroup(group: AdminProductOptionGroup): boolean {
  return POST_PROCESSING_GROUP_CODES.includes(group.code);
}

export function isOptionalGroup(group: AdminProductOptionGroup): boolean {
  return isPostProcessingGroup(group) || OPTIONAL_BOOK_PAPER_CODES.includes(group.code);
}

export function getDefaultOptionSelections(optionGroups: AdminProductOptionGroup[]): PriceSimulationOptionSelections {
  const selections: PriceSimulationOptionSelections = {};

  for (const group of optionGroups) {
    if (isOptionalGroup(group)) continue;

    const defaultOption = group.options.find((option) => option.is_active !== false) ?? group.options[0];
    if (defaultOption) {
      selections[getOptionGroupId(group)] = [getOptionId(defaultOption)];
    }
  }

  return selections;
}

export function buildSelectedOptionsPayload(selections: PriceSimulationOptionSelections): PriceSimulationSelectedOptionREQ[] {
  return Object.entries(selections).flatMap(([groupId, optionIds]) =>
    optionIds.map((optionId) => ({ group_id: Number(groupId), option_id: optionId })),
  );
}

const NO_SIZE_INPUT: PriceSimulationInputOptionsREQ = { width: 0, height: 0 };

export function parseSizeDimensions(raw: string): PriceSimulationInputOptionsREQ | undefined {
  const match = /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/i.exec(raw);
  if (!match) return undefined;

  return { width: Number(match[1]), height: Number(match[2]) };
}

export function findSizeInputOptions(
  optionGroups: AdminProductOptionGroup[],
  selections: PriceSimulationOptionSelections,
): PriceSimulationInputOptionsREQ {
  const sizeGroup = optionGroups.find((group) => group.code === ErpOptionGroupCode.SIZE);
  if (!sizeGroup) return NO_SIZE_INPUT;

  const selectedOptionId = selections[getOptionGroupId(sizeGroup)]?.[0];
  const selectedOption = sizeGroup.options.find((option) => getOptionId(option) === selectedOptionId);
  if (!selectedOption) return NO_SIZE_INPUT;

  return parseSizeDimensions(selectedOption.value) ?? parseSizeDimensions(selectedOption.label) ?? NO_SIZE_INPUT;
}
