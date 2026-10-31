'use client';

import { Description, SafeImage } from '@/components/common';
import type { OrderQuoteRESP, Product } from '@/apis/product/product.response';
import type { ProductSelectedOptions } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { PostProcessingCode, ProductCommonOption } from '@/enums/product';
import type { CartItemRESP, CartQuoteRESP } from '@/apis/cart/cart.response';
import { getCartItemOptionInfo } from '@/apis/cart/cart.service';
import { isBookProduct } from '@/apis/product/product.service';
import { useDesignDetailQuery } from '@/apis/design/design.query';
import { createProductOptionGroupNameTranslator } from '@/lib/product-option-labels';
import { DesignSide } from '@/enums/design';
import { useSearchParams } from 'next/navigation';

type ProductSectionProps = {
  productDetail?: Product;
  selectedOptions?: ProductSelectedOptions | null;
  dataOrderQuotation?: OrderQuoteRESP;
  dataCartQuote?: CartQuoteRESP;
  cartItems?: CartItemRESP[];
};

const BOOK_PAPER_SECTIONS = [
  { code: ProductCommonOption.COVER_PAPER, countField: 'cover_page_count' },
  { code: ProductCommonOption.INNER_PAPER, countField: 'inner_page_count' },
  { code: ProductCommonOption.ADDITIONAL_PAPER, countField: 'additional_page_count' },
  { code: ProductCommonOption.COLORED_PAPER_1, countField: 'colored_page_count_1' },
  { code: ProductCommonOption.COLORED_PAPER_2, countField: 'colored_page_count_2' },
  { code: ProductCommonOption.FLYLEAF_PAPER, countField: 'flyleaf_count' },
] as const;

const ProductSection = ({
  productDetail,
  selectedOptions,
  dataOrderQuotation,
  dataCartQuote,
  cartItems = [],
}: ProductSectionProps) => {
  const t = useTranslations('');
  const translateGroupName = createProductOptionGroupNameTranslator(t);
  const searchParams = useSearchParams();
  const designGroupId = Number(searchParams.get('design_group_id'));
  const shouldLoadDesign = Boolean(productDetail) && Number.isInteger(designGroupId) && designGroupId > 0;
  const { data: designDetail } = useDesignDetailQuery(shouldLoadDesign ? designGroupId : undefined);
  const itemCount = productDetail ? 1 : cartItems.length;
  const productName = productDetail?.name?.ko || productDetail?.name?.en || '-';
  const productImage =
    designDetail?.artworks.find((artwork) => artwork.side === DesignSide.FRONT)?.preview_image_path ||
    productDetail?.first_image ||
    productDetail?.images?.[0] ||
    '/images/product-sample.png';
  const orderQuote = dataOrderQuotation?.quote;
  const orderQuoteItem = orderQuote?.items[0];
  const quantity = orderQuoteItem?.quantity || 0;
  const count = orderQuoteItem?.multiplier || 0;
  const totalPrice = orderQuote?.summary.subtotal || 0;
  const selectedQuoteOptions = Array.isArray(selectedOptions?.quoteRequest.selected_options)
    ? selectedOptions.quoteRequest.selected_options
    : [];
  const optionGroups = Array.isArray(productDetail?.option_groups) ? productDetail.option_groups : [];
  const isBookLayoutProduct = Boolean(productDetail && isBookProduct(productDetail));

  const getSelectedOptionInfo = (groupCode: string) => {
    const optionGroup = optionGroups.find((group) => group.code === groupCode);
    const selectedOption = selectedQuoteOptions.find((option) => option.group_id === optionGroup?.id);

    return Array.isArray(optionGroup?.options)
      ? optionGroup.options.find((option) => option.id === selectedOption?.option_id)
      : undefined;
  };

  //size
  const size = `${selectedOptions?.quoteRequest.input_options.width || 0}mm x ${selectedOptions?.quoteRequest.input_options.height || 0}mm`;
  const subjectMatter = getSelectedOptionInfo(ProductCommonOption.SUBJECT_MATTER);
  const subjectMatterLabel = subjectMatter
    ? `${translateGroupName(ProductCommonOption.SUBJECT_MATTER, '소재')} - ${subjectMatter.label}`
    : '';

  const printedSideInfo = getSelectedOptionInfo(ProductCommonOption.PRINTED_SIDE);
  const printedColorFsideInfo = getSelectedOptionInfo(ProductCommonOption.PRINTED_COLOR_FSIDE);
  const printedColorBsideInfo = getSelectedOptionInfo(ProductCommonOption.PRINTED_COLOR_BSIDE);

  const printedOptionLabel = [printedSideInfo?.label, printedColorFsideInfo?.label, printedColorBsideInfo?.label]
    .filter(Boolean)
    .join(' - ');

  const getPrintedOptionLabel = (sideCode: ProductCommonOption, frontCode: ProductCommonOption, backCode: ProductCommonOption) =>
    [getSelectedOptionInfo(sideCode)?.label, getSelectedOptionInfo(frontCode)?.label, getSelectedOptionInfo(backCode)?.label]
      .filter(Boolean)
      .join(' - ');

  const bookPaperOptionLabels = BOOK_PAPER_SECTIONS.flatMap(({ code, countField }) => {
    const paper = getSelectedOptionInfo(code);
    if (!paper) return [];

    const pageCount = selectedOptions?.quoteRequest.input_options[countField];
    const sectionLabel = t(`product.${code}`);
    const countLabel = pageCount ? ` (${pageCount}p)` : '';

    return [`${sectionLabel} - ${paper.label}${countLabel}`];
  });

  const coverPrintedOptionLabel = getPrintedOptionLabel(
    ProductCommonOption.PRINTED_COVER_SIDE,
    ProductCommonOption.PRINTED_COLOR_COVER_FSIDE,
    ProductCommonOption.PRINTED_COLOR_COVER_BSIDE,
  );
  const innerPrintedOptionLabel = getPrintedOptionLabel(
    ProductCommonOption.PRINTED_INNER_SIDE,
    ProductCommonOption.PRINTED_COLOR_INNER_FSIDE,
    ProductCommonOption.PRINTED_COLOR_INNER_BSIDE,
  );

  //post processing
  const postProcessingCodes = Object.values(PostProcessingCode);
  const postProcessingOptionInfos = optionGroups.flatMap((optionGroup) => {
    if (!postProcessingCodes.includes(optionGroup.code as PostProcessingCode)) return [];

    const selectedOption = selectedQuoteOptions.find((option) => option.group_id === optionGroup.id);
    const optionInfo = Array.isArray(optionGroup.options)
      ? optionGroup.options.find((option) => option.id === selectedOption?.option_id)
      : undefined;

    return optionInfo ? [{ group: optionGroup, option: optionInfo }] : [];
  });

  const optionLabels = isBookLayoutProduct
    ? [
        size,
        subjectMatterLabel,
        ...bookPaperOptionLabels,
        coverPrintedOptionLabel && `${t('product.cover')} ${t('product.printed_color')} - ${coverPrintedOptionLabel}`,
        innerPrintedOptionLabel && `${t('product.inner_paper')} ${t('product.printed_color')} - ${innerPrintedOptionLabel}`,
        ...postProcessingOptionInfos.map(
          ({ group, option }) => `${translateGroupName(group.code, group.name)} - ${option.label}`,
        ),
      ].filter(Boolean)
    : [
        size,
        subjectMatterLabel,
        getSelectedOptionInfo(ProductCommonOption.PAPER)?.label,
        printedOptionLabel,
        ...postProcessingOptionInfos.map(
          ({ group, option }) => `${translateGroupName(group.code, group.name)} - ${option.label}`,
        ),
      ].filter(Boolean);

  return (
    <div>
      <Description
        mode='form'
        isCollapse={false}
        title={
          <p>
            {t('order.order_product_info')}
            <span className='title-16 ml-3 text-[#B0580D]'>({itemCount}건)</span>
          </p>
        }>
        <div className='mt-4 space-y-4'>
          {productDetail && (
            <div className='flex gap-2'>
              <a
                href={productImage}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-fill-soft relative block size-10 shrink-0 overflow-hidden'>
                <SafeImage src={productImage} alt={productName} fill className='object-contain' />
              </a>
              <div className='flex-1 space-y-1'>
                <p className='body-16 line-clamp-1 w-full'>{productName}</p>
                <p className='caption-12'>{optionLabels.join(' / ')}</p>
                <p className='body-14'>
                  {quantity}매 <span className='mx-3'>x</span>
                  {count}건
                </p>
              </div>
              <p className='title-18 ml-1'>
                {formatCurrency(totalPrice, false)}
                <span className='caption-12'>원</span>
              </p>
            </div>
          )}
          {!productDetail &&
            cartItems.map((item) => {
              const cartQuoteItem = dataCartQuote?.items.find((quoteItem) => quoteItem.cart_item_id === item.id);
              const optionInfo = getCartItemOptionInfo(item, translateGroupName);
              const cartOptionLabels = optionInfo?.optionLabels || [];
              const thumbnailUrl =
                item.design.front?.preview_image_path || item.product.first_image || '/images/product-sample.png';

              return (
                <div key={item.id} className='flex gap-2'>
                  <a
                    href={thumbnailUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-fill-soft relative block size-10 shrink-0 overflow-hidden'>
                    <SafeImage
                      src={thumbnailUrl}
                      alt={cartQuoteItem?.product_name || item.product.name}
                      fill
                      className='object-contain'
                    />
                  </a>
                  <div className='flex-1 space-y-1'>
                    <p className='body-16 line-clamp-1 w-full'>{cartQuoteItem?.product_name || item.product.name}</p>
                    <p className='caption-12'>{cartOptionLabels.join(' / ')}</p>
                    <p className='body-14'>
                      {cartQuoteItem?.quantity || item.quantity}매 <span className='mx-3'>x</span>
                      {cartQuoteItem?.number_of_cases || item.number_of_cases}건
                    </p>
                  </div>
                  <p className='title-18 ml-1'>
                    {formatCurrency(cartQuoteItem?.subtotal || item.subtotal, false)}
                    <span className='caption-12'>원</span>
                  </p>
                </div>
              );
            })}
        </div>
      </Description>
    </div>
  );
};

export default ProductSection;
