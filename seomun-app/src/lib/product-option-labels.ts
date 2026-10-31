import { PostProcessingCode, ProductCommonOption } from '@/enums/product';

export type ProductOptionLabelItem = {
  group?: { code?: string; name?: string } | null;
  option?: { label?: string } | null;
} | null;

export type ProductOptionGroupNameTranslator = (code?: string, defaultName?: string) => string;

export const getProductOptionItems = (options: unknown): ProductOptionLabelItem[] =>
  Array.isArray(options) ? (options as ProductOptionLabelItem[]) : [];

export const findProductOptionByCode = (options: unknown, code: string) =>
  getProductOptionItems(options).find((item) => item?.group?.code === code);

export const PRODUCT_OPTION_GROUP_TRANSLATION_KEYS: Record<string, string> = {
  [ProductCommonOption.SIZE]: 'product.size',
  [ProductCommonOption.SUBJECT_MATTER]: 'product.subject_matter',
  [ProductCommonOption.PAPER]: 'product.paper',
  [ProductCommonOption.COVER_PAPER]: 'product.cover_paper',
  [ProductCommonOption.INNER_PAPER]: 'product.inner_paper',
  [ProductCommonOption.ADDITIONAL_PAPER]: 'product.additional_paper',
  [ProductCommonOption.COLORED_PAPER_1]: 'product.colored_paper_1',
  [ProductCommonOption.COLORED_PAPER_2]: 'product.colored_paper_2',
  [ProductCommonOption.FLYLEAF_PAPER]: 'product.flyleaf_paper',
  [ProductCommonOption.PRINTED_SIDE]: 'product.printed_side',
  [ProductCommonOption.PRINTED_COLOR_FSIDE]: 'product.printed_color_fside',
  [ProductCommonOption.PRINTED_COLOR_BSIDE]: 'product.printed_color_bside',
  [ProductCommonOption.PRINTED_COVER_SIDE]: 'product.printed_cover_side',
  [ProductCommonOption.PRINTED_COLOR_COVER_FSIDE]: 'product.printed_color_cover_fside',
  [ProductCommonOption.PRINTED_COLOR_COVER_BSIDE]: 'product.printed_color_cover_bside',
  [ProductCommonOption.PRINTED_INNER_SIDE]: 'product.printed_inner_side',
  [ProductCommonOption.PRINTED_COLOR_INNER_FSIDE]: 'product.printed_color_inner_fside',
  [ProductCommonOption.PRINTED_COLOR_INNER_BSIDE]: 'product.printed_color_inner_bside',
  [PostProcessingCode.Coated]: 'product.coating',
  [PostProcessingCode.Oshi]: 'product.oshi',
  [PostProcessingCode.Rounding]: 'product.rounding',
  [PostProcessingCode.Foundation]: 'product.box',
  [PostProcessingCode.Grounding]: 'product.embossing',
  [PostProcessingCode.Perforation]: 'product.epoxy',
  [PostProcessingCode.Numbering]: 'product.transparent_embossing',
  [PostProcessingCode.Domusong]: 'product.embossing_box',
};

export const getProductOptionGroupName = (
  group: { code?: string; name?: string } | null | undefined,
  translateGroupName?: ProductOptionGroupNameTranslator,
) => translateGroupName?.(group?.code, group?.name) || group?.name;

export const createProductOptionGroupNameTranslator =
  (translate: (key: string) => string): ProductOptionGroupNameTranslator =>
  (code, defaultName) => {
    const translationKey = code ? PRODUCT_OPTION_GROUP_TRANSLATION_KEYS[code] : undefined;

    return translationKey ? translate(translationKey) : defaultName || '';
  };

const BOOK_PAPER_CODES = [
  ProductCommonOption.COVER_PAPER,
  ProductCommonOption.INNER_PAPER,
  ProductCommonOption.ADDITIONAL_PAPER,
  ProductCommonOption.COLORED_PAPER_1,
  ProductCommonOption.COLORED_PAPER_2,
  ProductCommonOption.FLYLEAF_PAPER,
];

const BOOK_DISPLAY_OPTION_CODES = new Set([
  ProductCommonOption.SUBJECT_MATTER,
  ...BOOK_PAPER_CODES,
  ProductCommonOption.PRINTED_COVER_SIDE,
  ProductCommonOption.PRINTED_COLOR_COVER_FSIDE,
  ProductCommonOption.PRINTED_COLOR_COVER_BSIDE,
  ProductCommonOption.PRINTED_INNER_SIDE,
  ProductCommonOption.PRINTED_COLOR_INNER_FSIDE,
  ProductCommonOption.PRINTED_COLOR_INNER_BSIDE,
]);

export const isBookOptionConfiguration = (options: unknown) =>
  getProductOptionItems(options).some((item) => item?.group?.code === ProductCommonOption.COVER_PAPER);

export const getBookOptionDisplayItems = (options: unknown) =>
  isBookOptionConfiguration(options)
    ? getProductOptionItems(options).filter((item) => BOOK_DISPLAY_OPTION_CODES.has(item?.group?.code as ProductCommonOption))
    : [];

const getPrintedLabel = (
  options: unknown,
  sideCode: ProductCommonOption,
  frontCode: ProductCommonOption,
  backCode: ProductCommonOption,
  translateGroupName?: ProductOptionGroupNameTranslator,
) => {
  const sideOption = findProductOptionByCode(options, sideCode);
  const labels = [
    sideOption?.option?.label,
    findProductOptionByCode(options, frontCode)?.option?.label,
    findProductOptionByCode(options, backCode)?.option?.label,
  ].filter(Boolean);

  return labels.length
    ? `${getProductOptionGroupName(sideOption?.group, translateGroupName) || ''} - ${labels.join(' - ')}`.trim()
    : undefined;
};

export const getProductOptionLabels = (
  options: unknown,
  size?: string,
  translateGroupName?: ProductOptionGroupNameTranslator,
) => {
  const safeOptions = getProductOptionItems(options);
  const postProcessing = safeOptions
    .filter((item) => Object.values(PostProcessingCode).includes(item?.group?.code as PostProcessingCode) && item?.option?.label)
    .map((item) => `${getProductOptionGroupName(item?.group, translateGroupName)} - ${item?.option?.label}`);

  if (!isBookOptionConfiguration(safeOptions)) {
    const subjectMatter = findProductOptionByCode(safeOptions, ProductCommonOption.SUBJECT_MATTER);
    const paper = findProductOptionByCode(safeOptions, ProductCommonOption.PAPER)?.option?.label;
    const printed = getPrintedLabel(
      options,
      ProductCommonOption.PRINTED_SIDE,
      ProductCommonOption.PRINTED_COLOR_FSIDE,
      ProductCommonOption.PRINTED_COLOR_BSIDE,
      translateGroupName,
    );

    return [
      subjectMatter?.option?.label &&
        `${getProductOptionGroupName(subjectMatter.group, translateGroupName)} - ${subjectMatter.option.label}`,
      paper,
      size,
      printed,
      ...postProcessing,
    ].filter(Boolean);
  }

  const papers = BOOK_PAPER_CODES.flatMap((code) => {
    const item = findProductOptionByCode(safeOptions, code);
    return item?.option?.label ? [`${getProductOptionGroupName(item.group, translateGroupName)} - ${item.option.label}`] : [];
  });
  const subjectMatter = findProductOptionByCode(safeOptions, ProductCommonOption.SUBJECT_MATTER);
  const coverPrinted = getPrintedLabel(
    options,
    ProductCommonOption.PRINTED_COVER_SIDE,
    ProductCommonOption.PRINTED_COLOR_COVER_FSIDE,
    ProductCommonOption.PRINTED_COLOR_COVER_BSIDE,
    translateGroupName,
  );
  const innerPrinted = getPrintedLabel(
    options,
    ProductCommonOption.PRINTED_INNER_SIDE,
    ProductCommonOption.PRINTED_COLOR_INNER_FSIDE,
    ProductCommonOption.PRINTED_COLOR_INNER_BSIDE,
    translateGroupName,
  );

  return [
    size,
    subjectMatter?.option?.label &&
      `${getProductOptionGroupName(subjectMatter.group, translateGroupName)} - ${subjectMatter.option.label}`,
    ...papers,
    coverPrinted,
    innerPrinted,
    ...postProcessing,
  ].filter(Boolean);
};
