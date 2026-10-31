import { PostProcessingCode, ProductCommonOption } from '@/enums/product';
import { SavedOptionRESP } from './saved-options.response';
import { SavedOptionListREQ } from './saved-options.request';
import { PAGINATION } from '@/constants/common';
import { DepositStatusPeriod } from '@/enums/deposit-status';
import { subDays, subMonths, subYears } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  findProductOptionByCode,
  getProductOptionItems,
  getProductOptionLabels,
  ProductOptionGroupNameTranslator,
} from '@/lib/product-option-labels';

export const getSavedOptionInfo = (item?: SavedOptionRESP, translateGroupName?: ProductOptionGroupNameTranslator) => {
  if (!item) return null;

  const options = getProductOptionItems(item.options);
  const postProcessingCodes = Object.values(PostProcessingCode);
  const subjectMatter = findProductOptionByCode(options, ProductCommonOption.SUBJECT_MATTER)?.option?.label;
  const paper = findProductOptionByCode(options, ProductCommonOption.PAPER)?.option?.label;
  const size = item.input_options
    ? `${item.input_options.width || 0} x ${item.input_options.height || 0}`
    : findProductOptionByCode(options, ProductCommonOption.SIZE)?.option?.label;
  const printedSide = findProductOptionByCode(options, ProductCommonOption.PRINTED_SIDE)?.option?.label;
  const printedColorFSide = findProductOptionByCode(options, ProductCommonOption.PRINTED_COLOR_FSIDE)?.option?.label;
  const printedColorBSide = findProductOptionByCode(options, ProductCommonOption.PRINTED_COLOR_BSIDE)?.option?.label;
  const printedSideLabel = [printedSide, printedColorFSide, printedColorBSide].filter(Boolean).join(' - ');
  const postProcessing = options
    .filter((op) => postProcessingCodes.includes(op?.group?.code as PostProcessingCode) && op?.option?.label)
    .map((op) => `${translateGroupName?.(op?.group?.code, op?.group?.name) || op?.group?.name || ''} - ${op?.option?.label}`)
    .join(' / ');
  const optionLabels = getProductOptionLabels(options, size ? `${size}mm` : undefined, translateGroupName);

  return { subjectMatter, paper, size, printedSide: printedSideLabel, postProcessing, optionLabels };
};

export const getInitFilterSavedOption = (searchParams: URLSearchParams): SavedOptionListREQ => {
  return {
    page: Number(searchParams.get('page')) || PAGINATION.DEFAULT_PAGE,
    per_page: Number(searchParams.get('per_page')) || PAGINATION.DEFAULT_PAGE_SIZE,
    search: searchParams.get('search') || undefined,
    start_date: searchParams.get('start_date') || undefined,
    end_date: searchParams.get('end_date') || undefined,
  };
};

export const getDateRangeBySavedOptionPeriod = (period: string): DateRange | undefined => {
  const today = new Date();

  switch (period) {
    case DepositStatusPeriod.ONE_WEEK:
      return { from: subDays(today, 6), to: today };
    case DepositStatusPeriod.ONE_MONTH:
      return { from: subMonths(today, 1), to: today };
    case DepositStatusPeriod.THREE_MONTHS:
      return { from: subMonths(today, 3), to: today };
    case DepositStatusPeriod.SIX_MONTHS:
      return { from: subMonths(today, 6), to: today };
    case DepositStatusPeriod.ONE_YEAR:
      return { from: subYears(today, 1), to: today };
    default:
      return undefined;
  }
};
