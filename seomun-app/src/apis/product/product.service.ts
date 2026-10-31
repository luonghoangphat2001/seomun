import { PaperSelection, ProductOrderConfig } from '@/types';
import { ProductQuoteREQ, ProductUploadFileREQ } from './product.request';
import { Paper, PaperOption, PaperType, Product, ProductSize } from './product.response';
import { FileUploadFormValues } from '@/components/ui/product/schema';
import { FileRESP } from '../file/file.response';
import { PrintOption, ProductCommonOption } from '@/enums/product';

const BOOK_CATEGORY_CODES = new Set(['book', 'hot-deal-booklet']);
const DESIGN_BOOK_PRODUCT_NAMES = new Set(['링책자', '중철책자', '양장책자', '무선책자']);

export const isBookProduct = (product: Pick<Product, 'category' | 'name'>) =>
  BOOK_CATEGORY_CODES.has(product.category.code) ||
  (product.category.code === 'design' && DESIGN_BOOK_PRODUCT_NAMES.has(product.name.ko));

const BOOK_PAPER_CODES = [
  ProductCommonOption.INNER_PAPER,
  ProductCommonOption.ADDITIONAL_PAPER,
  ProductCommonOption.COLORED_PAPER_1,
  ProductCommonOption.COLORED_PAPER_2,
  ProductCommonOption.FLYLEAF_PAPER,
];

const OPTIONAL_BOOK_PAPER_CODES = new Set([
  ProductCommonOption.ADDITIONAL_PAPER,
  ProductCommonOption.COLORED_PAPER_1,
  ProductCommonOption.COLORED_PAPER_2,
  ProductCommonOption.FLYLEAF_PAPER,
]);

const BOOK_PAGE_COUNT_FIELDS: Record<string, keyof ProductQuoteREQ['input_options']> = {
  [ProductCommonOption.COVER_PAPER]: 'cover_page_count',
  [ProductCommonOption.INNER_PAPER]: 'inner_page_count',
  [ProductCommonOption.ADDITIONAL_PAPER]: 'additional_page_count',
  [ProductCommonOption.COLORED_PAPER_1]: 'colored_page_count_1',
  [ProductCommonOption.COLORED_PAPER_2]: 'colored_page_count_2',
  [ProductCommonOption.FLYLEAF_PAPER]: 'flyleaf_count',
};

const getBookPageCount = (formValues: ProductOrderConfig, code: string, required = false) => {
  const count = Number(formValues.bookPaperCounts?.[code]);

  if (!Number.isFinite(count)) return required ? 1 : 0;

  return required ? Math.max(1, count) : Math.max(0, count);
};

const getPaperOptionForGroup = (paper: Paper, groupId?: number): PaperOption | undefined => {
  if (!groupId) return { group_id: paper.group_id, option_id: paper.option_id };

  return (
    paper.options?.find((option) => option.group_id === groupId) ??
    (paper.group_id === groupId ? { group_id: paper.group_id, option_id: paper.option_id } : undefined)
  );
};

const getPaperWeight = (papers: PaperType[], selection?: PaperSelection, groupId?: number) => {
  if (!selection) return undefined;

  return papers
    .find((type) => String(type.id) === selection.type)
    ?.paper_colors.find((color) => String(color.id) === selection.color)
    ?.paper_weights.find(
      (weight) => String(weight.id) === selection.weight && Boolean(getPaperOptionForGroup(weight.paper, groupId)),
    );
};

export const transformFormValuesToQuotationREQ = (
  formValues: ProductOrderConfig,
  productDetail?: Product,
  productSizes?: ProductSize[],
  papers?: PaperType[],
): ProductQuoteREQ | undefined => {
  if (!productDetail || !productSizes || !papers) return undefined;

  const isBookLayoutProduct = isBookProduct(productDetail);
  const optionGroups = Array.isArray(productDetail.option_groups) ? productDetail.option_groups : [];

  //get size
  const sizeOption = productSizes.find((size) => size.option_id?.toString() === formValues.size);
  const subjectMatterGroup = optionGroups.find((group) => group.code === ProductCommonOption.SUBJECT_MATTER);
  const subjectMatterSelectedOption =
    subjectMatterGroup && formValues.subjectMatter
      ? { group_id: subjectMatterGroup.id, option_id: Number(formValues.subjectMatter) }
      : null;

  //get paper
  const coverPaperGroup = optionGroups.find(
    (group) => group.code === (isBookLayoutProduct ? ProductCommonOption.COVER_PAPER : ProductCommonOption.PAPER),
  );
  const paperWeight = getPaperWeight(
    papers,
    { type: formValues.paperType, color: formValues.paperColor, weight: formValues.paperWeight },
    coverPaperGroup?.id,
  );
  const coverPaperOption = paperWeight && getPaperOptionForGroup(paperWeight.paper, coverPaperGroup?.id);

  //color printed side
  const printedSideOptionGroup = optionGroups.find(
    (group) => group.code === (isBookLayoutProduct ? ProductCommonOption.PRINTED_COVER_SIDE : ProductCommonOption.PRINTED_SIDE),
  );
  const colorFrontOptionGroup = optionGroups.find(
    (group) =>
      group.code ===
      (isBookLayoutProduct ? ProductCommonOption.PRINTED_COLOR_COVER_FSIDE : ProductCommonOption.PRINTED_COLOR_FSIDE),
  );
  const colorBackOptionGroup = optionGroups.find(
    (group) =>
      group.code ===
      (isBookLayoutProduct ? ProductCommonOption.PRINTED_COLOR_COVER_BSIDE : ProductCommonOption.PRINTED_COLOR_BSIDE),
  );

  const bookPaperSelectedOptions = isBookLayoutProduct
    ? BOOK_PAPER_CODES.filter(
        (code) => !OPTIONAL_BOOK_PAPER_CODES.has(code) || formValues.bookOptionalPaperGroups?.includes(code),
      )
        .map((code) => {
          const group = optionGroups.find((optionGroup) => optionGroup.code === code);
          const paperWeight = getPaperWeight(papers, formValues.bookPaperSelections?.[code], group?.id);
          const paperOption = paperWeight && getPaperOptionForGroup(paperWeight.paper, group?.id);

          if (!group || !paperOption) return null;

          return paperOption;
        })
        .filter((option): option is { group_id: number; option_id: number } => Boolean(option))
    : [];

  const bookPrintSelectedOptions = isBookLayoutProduct
    ? [
        [ProductCommonOption.PRINTED_INNER_SIDE, 'side'],
        [ProductCommonOption.PRINTED_COLOR_INNER_FSIDE, 'front'],
        [ProductCommonOption.PRINTED_COLOR_INNER_BSIDE, 'back'],
      ]
        .map(([code, field]) => {
          const group = optionGroups.find((optionGroup) => optionGroup.code === code);
          const optionId = formValues.bookPrintSelections?.inner?.[field as 'side' | 'front' | 'back'];

          if (!group || !optionId) return null;

          return { group_id: group.id, option_id: Number(optionId) };
        })
        .filter((option): option is { group_id: number; option_id: number } => Boolean(option))
    : [];

  const bookPageCounts = isBookLayoutProduct
    ? Object.entries(BOOK_PAGE_COUNT_FIELDS).reduce<Partial<ProductQuoteREQ['input_options']>>((counts, [code, field]) => {
        const isRequired = code === ProductCommonOption.COVER_PAPER || code === ProductCommonOption.INNER_PAPER;
        const isSelected =
          !OPTIONAL_BOOK_PAPER_CODES.has(code as ProductCommonOption) || formValues.bookOptionalPaperGroups?.includes(code);

        counts[field] = isSelected ? getBookPageCount(formValues, code, isRequired) : 0;
        return counts;
      }, {})
    : {};

  //post processing
  const postProcessingSelectedOptions = formValues.postProcessing
    .map((postProcessingCode) => {
      const optionGroup = optionGroups.find((group) => group.code === postProcessingCode);
      const optionId =
        formValues.postProcessingConfigs?.[postProcessingCode] ||
        (Array.isArray(optionGroup?.options) ? optionGroup.options[0]?.id.toString() : undefined);

      if (!optionGroup || !optionId) return null;

      return {
        group_id: optionGroup.id,
        option_id: Number(optionId),
      };
    })
    .filter((option): option is { group_id: number; option_id: number } => Boolean(option));

  const result: ProductQuoteREQ = {
    product_id: productDetail.id,
    quantity_sets: {
      quantity: formValues.quantity,
      multiplier: formValues.count,
    },
    selected_options: [
      {
        group_id: sizeOption?.group_id || Number(formValues.size),
        option_id: sizeOption?.option_id || Number(formValues.size),
      },
      ...(subjectMatterSelectedOption ? [subjectMatterSelectedOption] : []),
      {
        group_id: coverPaperOption?.group_id || coverPaperGroup?.id || Number(formValues.paperType),
        option_id: coverPaperOption?.option_id || Number(formValues.paperType),
      },
      {
        group_id: printedSideOptionGroup?.id || Number(formValues.printColorTotal),
        option_id: Number(formValues.printColorTotal),
      },
      {
        group_id: colorFrontOptionGroup?.id || Number(formValues.printColorFront),
        option_id: Number(formValues.printColorFront),
      },
      {
        group_id: colorBackOptionGroup?.id || Number(formValues.printColorRear),
        option_id: Number(formValues.printColorRear),
      },
      ...bookPaperSelectedOptions,
      ...bookPrintSelectedOptions,
      ...postProcessingSelectedOptions,
    ],
    input_options: {
      width: formValues.cuttingSize.width || sizeOption?.cutting_width || 0,
      height: formValues.cuttingSize.height || sizeOption?.cutting_height || 0,
      ...bookPageCounts,
    },
  };

  result.selected_options = result.selected_options.filter((item) => Boolean(item.group_id) && Boolean(item.option_id));

  return result;
};

export const transformUploadFileInputToREQ = (
  userId: number,
  productId: number,
  input: FileUploadFormValues,
  file: FileRESP,
  canSelectPrintOption = true,
): ProductUploadFileREQ => {
  const printAsIs = canSelectPrintOption && input.printOption === PrintOption.AS_IS;
  const printWithoutProof = canSelectPrintOption && input.printOption === PrintOption.SKIP_PROOFREADING;

  return {
    user_id: userId,
    product_id: productId,
    title: input.title,
    artwork: [
      {
        url: file.url,
        name: file.name,
        size: file.size,
        mime: file.mime_type,
        print_as_is: printAsIs,
        print_without_proof: printWithoutProof,
      },
    ],
  };
};
