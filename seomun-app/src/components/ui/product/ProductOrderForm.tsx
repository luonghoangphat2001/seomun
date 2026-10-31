'use client';

import { MessageModal, ModalHandle, PaymentSummary } from '@/components/common';
import { PaperType, Product, ProductOption, ProductOptionGroup } from '@/apis/product/product.response';
import { SavedOptionRESP } from '@/apis/my/saved-options/saved-options.response';
import { POST_PROCESSING_OPTIONS } from '@/constants/product';
import { usePathname, useRouter } from '@/i18n/navigation';
import { ChevronRight, Star } from '@/icons';
import { ROUTES } from '@/routes';
import { ProductOrderConfig, ProductSelectedOptions } from '@/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { CalculateSpineModal } from './CalculateSpineModal';
import { FileUploadModal, FileUploadModalHandle, FileUploadMode } from './FileUploadModal';
import { ProductCalculationModal } from './ProductCalculationModal';
import { ViewPaper } from './ViewPaper';
import { useAuthStore, useDebounce, useMediaQuery } from '@/hooks';
import {
  useGetPaperByProductQuery,
  useGetSizeOptionsByProductQuery,
  useGetProductUnitPriceSettingQuery,
  useProductQuotationQuery,
} from '@/apis/product/product.query';
import { PostProcessingCode, ProductCommonOption } from '@/enums/product';
import { isBookProduct, transformFormValuesToQuotationREQ } from '@/apis/product/product.service';
import { useProductStore } from './store/useProductStore';
import { useSearchParams } from 'next/navigation';
import { ProductCalculation } from './ProductCalculation';
import ProductSelectionInput, { BookPaperSection } from './ProductSelectionInput';
import { useAddToCartMutation } from '@/apis/cart/cart.query';
import { LOCAL_STORAGE_KEYS, LocalStorage } from '@/lib/storages';
import toast from 'react-hot-toast';

interface ProductOrderFormProps {
  product: Product;
}

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
const BOOK_PAPER_COUNT_CODES = [ProductCommonOption.COVER_PAPER, ...BOOK_PAPER_CODES];
const EMPTY_OPTION_GROUPS: ProductOptionGroup[] = [];
const CASE_OPTIONS = Array.from({ length: 100 }, (_, index) => {
  const value = index + 1;

  return { value: String(value), label: `${value}건` };
});
const FALLBACK_QUANTITIES = Array.from({ length: 10 }, (_, index) => (index + 1) * 100);
const normalizeCaseCount = (count: number) => Math.min(100, Math.max(1, count));

const getPapersForGroup = (paperTypes: PaperType[] | undefined, groupId?: number): PaperType[] => {
  if (!paperTypes || !groupId) return [];

  return paperTypes.flatMap((type) => {
    const paperColors = type.paper_colors.flatMap((color) => {
      const paperWeights = color.paper_weights.filter(
        (weight) => weight.paper.options?.some((option) => option.group_id === groupId) || weight.paper.group_id === groupId,
      );

      return paperWeights.length ? [{ ...color, paper_weights: paperWeights }] : [];
    });

    return paperColors.length ? [{ ...type, paper_colors: paperColors }] : [];
  });
};

const filterPapersByPaperIds = (paperTypes: PaperType[], paperIds: Set<number>): PaperType[] =>
  paperTypes.flatMap((type) => {
    const paperColors = type.paper_colors.flatMap((color) => {
      const paperWeights = color.paper_weights.filter((weight) => paperIds.has(weight.paper.id));

      return paperWeights.length ? [{ ...color, paper_weights: paperWeights }] : [];
    });

    return paperColors.length ? [{ ...type, paper_colors: paperColors }] : [];
  });

const getGroupOptions = (group?: ProductOptionGroup): ProductOption[] => (Array.isArray(group?.options) ? group.options : []);

export const ProductOrderForm = ({ product }: ProductOrderFormProps) => {
  const t = useTranslations('product');
  const tApp = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const designGroupId = Number(searchParams.get('design_group_id'));
  const hasDesignGroup = Number.isInteger(designGroupId) && designGroupId > 0;
  const isBookLayoutProduct = isBookProduct(product);
  const allowDirectInput =
    product.category.code === 'business-card' || (product.category.code === 'design' && product.name.ko !== '명함');
  // Only the size group is guaranteed by the API. Normalize malformed/missing groups
  // so optional product settings never make the form crash.
  const optionGroups = Array.isArray(product.option_groups) ? product.option_groups : EMPTY_OPTION_GROUPS;
  const shouldFilterPapersByUnitPrice = product.category.code !== 'business-card' && !isBookLayoutProduct;
  // Keep legacy products on the existing flow while the new permissions are absent.
  const allowFileUpload = product.allow_file_upload !== false;
  const allowWebEditor = product.allow_web_editor !== false;
  const { isAuthenticated, isHydrated } = useAuthStore();
  const setQuotation = useProductStore((state) => state.setQuotation);
  const setQuoteRequest = useProductStore((state) => state.setQuoteRequest);
  const setFormValues = useProductStore((state) => state.setFormValues);
  const pendingSavedOption = useProductStore((state) => state.pendingSavedOption);
  const setPendingSavedOption = useProductStore((state) => state.setPendingSavedOption);
  const setIsLoadingQuotation = useProductStore((state) => state.setIsLoadingQuotation);
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCartMutation();

  const viewPaperModalRef = useRef<ModalHandle>(null);
  const productCalculationModalRef = useRef<ModalHandle>(null);
  const fileUploadModalRef = useRef<FileUploadModalHandle>(null);
  const calculateSpineModalRef = useRef<ModalHandle>(null);
  const addToCartMessageModalRef = useRef<ModalHandle>(null);
  const [addToCartMessage, setAddToCartMessage] = useState('');

  //hook form
  const form = useForm<ProductOrderConfig>({
    defaultValues: {
      size: '',
      subjectMatter: '',
      isDirectInput: false,
      cuttingSize: { width: 0, height: 0 },
      editingSize: { width: 0, height: 0 },
      safeSize: { width: 0, height: 0 },
      paperType: '',
      paperColor: '',
      paperWeight: '',
      bookPaperSelections: {},
      bookOptionalPaperGroups: [],
      bookPaperCounts: isBookLayoutProduct ? Object.fromEntries(BOOK_PAPER_COUNT_CODES.map((code) => [code, 1])) : {},
      printColorTotal: '',
      printColorFront: '',
      printColorRear: '',
      bookPrintSelections: {},
      quantity: 0,
      count: 1,
      postProcessing: [],
      postProcessingConfigs: {},
    },
  });
  const { control, watch, handleSubmit, setValue } = form;
  const sizeWatch = watch('size');
  const cuttingWidthWatch = watch('cuttingSize.width');
  const cuttingHeightWatch = watch('cuttingSize.height');
  const isDirectInputWatch = watch('isDirectInput');
  const paperTypeWatch = watch('paperType');
  const paperColorWatch = watch('paperColor');
  const paperWeightWatch = watch('paperWeight');
  const printColorTotalWatch = watch('printColorTotal');
  const printColorFrontWatch = watch('printColorFront');
  const printColorRearWatch = watch('printColorRear');
  const subjectMatterWatch = watch('subjectMatter');
  const formValues = useWatch({
    control,
  });

  // console.log('productOPtion', product);

  //api paper
  const { data: dataPaper } = useGetPaperByProductQuery(product.id);

  const { data: unitPriceSettings } = useGetProductUnitPriceSettingQuery(
    shouldFilterPapersByUnitPrice ? product.slug : undefined,
  );

  //api size options
  const { data: dataSize } = useGetSizeOptionsByProductQuery(product.id);

  const selectedSize = useMemo(() => dataSize?.find((size) => String(size.option_id) === sizeWatch), [dataSize, sizeWatch]);

  const availablePaperIds = useMemo(() => {
    if (!shouldFilterPapersByUnitPrice || !unitPriceSettings?.length || !selectedSize) return undefined;

    return new Set(
      unitPriceSettings.flatMap((setting) => {
        if (setting.erp_size_option?.size_id !== selectedSize.id || !setting.erp_paper_option) return [];

        return [setting.erp_paper_option.paper_id];
      }),
    );
  }, [selectedSize, shouldFilterPapersByUnitPrice, unitPriceSettings]);

  const primaryPaperTypes = useMemo(() => {
    if (!isBookLayoutProduct) {
      const paperGroup = optionGroups.find((group) => group.code === ProductCommonOption.PAPER);
      if (!paperGroup) return [];

      const paperTypes = dataPaper || [];

      return availablePaperIds ? filterPapersByPaperIds(paperTypes, availablePaperIds) : paperTypes;
    }

    const coverPaperGroup = optionGroups.find((group) => group.code === ProductCommonOption.COVER_PAPER);
    return getPapersForGroup(dataPaper, coverPaperGroup?.id);
  }, [availablePaperIds, dataPaper, isBookLayoutProduct, optionGroups]);

  const quoteRequest = useMemo(() => {
    return transformFormValuesToQuotationREQ(formValues as ProductOrderConfig, product, dataSize, dataPaper);
  }, [formValues, product, dataSize, dataPaper]);

  const debouncedQuoteRequest = useDebounce(quoteRequest, 300);

  //api quotation
  const { data: dataQuotation, isLoading: isLoadingQuotation } = useProductQuotationQuery(debouncedQuoteRequest);

  const sizeOptions = useMemo(() => {
    if (!dataSize) return [];
    return dataSize.map((item) => ({ value: String(item.option_id), label: item.name }));
  }, [dataSize]);

  const subjectMatterGroup = useMemo(
    () => optionGroups.find((group) => group.code === ProductCommonOption.SUBJECT_MATTER),
    [optionGroups],
  );

  const subjectMatterOptions = useMemo(
    () => getGroupOptions(subjectMatterGroup).map((item) => ({ label: item.label, value: String(item.id) })),
    [subjectMatterGroup],
  );

  const paperTypeOptions = useMemo(() => {
    return primaryPaperTypes.map((item) => ({ value: String(item.id), label: item.label }));
  }, [primaryPaperTypes]);

  const paperColorOptions = useMemo(() => {
    const type = primaryPaperTypes.find((type) => String(type.id) === paperTypeWatch);
    return type ? type.paper_colors.map((color) => ({ value: String(color.id), label: color.label })) : [];
  }, [primaryPaperTypes, paperTypeWatch]);

  const paperWeightOptions = useMemo(() => {
    const type = primaryPaperTypes.find((type) => String(type.id) === paperTypeWatch);

    if (!type) return [];

    const color = type.paper_colors.find((color) => String(color.id) === paperColorWatch);
    return color ? color.paper_weights.map((weight) => ({ value: String(weight.id), label: weight.value + ' g/㎡' })) : [];
  }, [primaryPaperTypes, paperTypeWatch, paperColorWatch]);

  const bookPaperSections = useMemo<BookPaperSection[]>(() => {
    if (!isBookLayoutProduct) return [];

    return BOOK_PAPER_CODES.flatMap((code) => {
      const group = optionGroups.find((item) => item.code === code);
      if (!group) return [];

      const paperTypes = getPapersForGroup(dataPaper, group.id);
      const selection = formValues.bookPaperSelections?.[code];
      const selectedType = paperTypes.find((type) => String(type.id) === selection?.type);
      const selectedColor = selectedType?.paper_colors.find((color) => String(color.id) === selection?.color);

      return [
        {
          code,
          isOptional: OPTIONAL_BOOK_PAPER_CODES.has(code),
          paperTypeOptions: paperTypes.map((item) => ({ value: String(item.id), label: item.label })),
          paperColorOptions: selectedType?.paper_colors.map((item) => ({ value: String(item.id), label: item.label })) || [],
          paperWeightOptions:
            selectedColor?.paper_weights.map((item) => ({ value: String(item.id), label: item.value + ' g/㎡' })) || [],
        },
      ];
    });
  }, [dataPaper, formValues.bookPaperSelections, isBookLayoutProduct, optionGroups]);

  const spinePapers = useMemo(() => {
    if (!dataPaper) return [];

    const paperMap = new Map<number, { id: number; name: string }>();

    dataPaper.forEach((type) => {
      type.paper_colors.forEach((color) => {
        color.paper_weights.forEach((weight) => {
          paperMap.set(weight.paper.id, {
            id: weight.paper.id,
            name: weight.paper.name,
          });
        });
      });
    });

    return Array.from(paperMap.values());
  }, [dataPaper]);

  const selectedSpinePaperId = useMemo(() => {
    if (!dataPaper || !paperTypeWatch || !paperColorWatch || !formValues.paperWeight) return undefined;

    const type = dataPaper.find((item) => String(item.id) === paperTypeWatch);
    const color = type?.paper_colors.find((item) => String(item.id) === paperColorWatch);
    const weight = color?.paper_weights.find((item) => String(item.id) === formValues.paperWeight);

    return weight?.paper.id;
  }, [dataPaper, paperTypeWatch, paperColorWatch, formValues.paperWeight]);

  const printSideOptions = useMemo(() => {
    const option = optionGroups.find(
      (item) => item.code === (isBookLayoutProduct ? ProductCommonOption.PRINTED_COVER_SIDE : ProductCommonOption.PRINTED_SIDE),
    );
    return getGroupOptions(option).map((item) => ({ label: item.label, value: String(item.id) }));
  }, [isBookLayoutProduct, optionGroups]);

  const frontSideOptions = useMemo(() => {
    const option = optionGroups.find(
      (item) =>
        item.code ===
        (isBookLayoutProduct ? ProductCommonOption.PRINTED_COLOR_COVER_FSIDE : ProductCommonOption.PRINTED_COLOR_FSIDE),
    );
    return getGroupOptions(option).map((item) => ({ label: item.label, value: String(item.id) }));
  }, [isBookLayoutProduct, optionGroups]);

  const backSideOptions = useMemo(() => {
    const option = optionGroups.find(
      (item) =>
        item.code ===
        (isBookLayoutProduct ? ProductCommonOption.PRINTED_COLOR_COVER_BSIDE : ProductCommonOption.PRINTED_COLOR_BSIDE),
    );
    return getGroupOptions(option).map((item) => ({ label: item.label, value: String(item.id) }));
  }, [isBookLayoutProduct, optionGroups]);

  const innerPrintOptions = useMemo(() => {
    if (!isBookLayoutProduct || !optionGroups.some((group) => group.code === ProductCommonOption.INNER_PAPER)) return undefined;

    const getOptions = (code: ProductCommonOption) => {
      const group = optionGroups.find((item) => item.code === code);
      return getGroupOptions(group).map((item) => ({ label: item.label, value: String(item.id) }));
    };

    return {
      sideOptions: getOptions(ProductCommonOption.PRINTED_INNER_SIDE),
      frontOptions: getOptions(ProductCommonOption.PRINTED_COLOR_INNER_FSIDE),
      backOptions: getOptions(ProductCommonOption.PRINTED_COLOR_INNER_BSIDE),
    };
  }, [isBookLayoutProduct, optionGroups]);

  const quantityOptions = useMemo(() => {
    const quantityUnit = isBookLayoutProduct ? '부' : '매';
    const quantities = Array.isArray(product?.quantity_prices)
      ? product.quantity_prices.map((item) => item.quantity)
      : FALLBACK_QUANTITIES;

    return quantities.map((quantity) => ({ label: quantity + quantityUnit, value: String(quantity) }));
  }, [isBookLayoutProduct, product]);

  //post processing options -8 items
  const getPostProcessingOptions = useCallback(
    (code: PostProcessingCode) => {
      const option = optionGroups.find((item) => item.code === code);
      return getGroupOptions(option).map((item) => ({ label: item.label, value: String(item.id) }));
    },
    [optionGroups],
  );

  const coatedOptions = useMemo(() => getPostProcessingOptions(PostProcessingCode.Coated), [getPostProcessingOptions]);
  const oshiOptions = useMemo(() => {
    return getPostProcessingOptions(PostProcessingCode.Oshi);
  }, [getPostProcessingOptions]);
  const roundingOptions = useMemo(() => getPostProcessingOptions(PostProcessingCode.Rounding), [getPostProcessingOptions]);
  const foundationOptions = useMemo(() => getPostProcessingOptions(PostProcessingCode.Foundation), [getPostProcessingOptions]);
  const groundingOptions = useMemo(() => getPostProcessingOptions(PostProcessingCode.Grounding), [getPostProcessingOptions]);
  const perforationOptions = useMemo(() => getPostProcessingOptions(PostProcessingCode.Perforation), [getPostProcessingOptions]);
  const numberingOptions = useMemo(() => getPostProcessingOptions(PostProcessingCode.Numbering), [getPostProcessingOptions]);
  const domusongOptions = useMemo(() => getPostProcessingOptions(PostProcessingCode.Domusong), [getPostProcessingOptions]);
  const postProcessingOptionMap = useMemo(
    () => ({
      [PostProcessingCode.Coated]: coatedOptions,
      [PostProcessingCode.Oshi]: oshiOptions,
      [PostProcessingCode.Rounding]: roundingOptions,
      [PostProcessingCode.Foundation]: foundationOptions,
      [PostProcessingCode.Grounding]: groundingOptions,
      [PostProcessingCode.Perforation]: perforationOptions,
      [PostProcessingCode.Numbering]: numberingOptions,
      [PostProcessingCode.Domusong]: domusongOptions,
    }),
    [
      coatedOptions,
      oshiOptions,
      roundingOptions,
      foundationOptions,
      groundingOptions,
      perforationOptions,
      numberingOptions,
      domusongOptions,
    ],
  );

  const availablePostProcessingOptions = useMemo(() => {
    return POST_PROCESSING_OPTIONS.filter(
      (opt) => postProcessingOptionMap[opt.value as keyof typeof postProcessingOptionMap]?.length > 0,
    );
  }, [postProcessingOptionMap]);

  const postProcessingPriceMap = useMemo(() => {
    return new Map(dataQuotation?.breakdown?.map((item) => [item.group_code, item.price]) || []);
  }, [dataQuotation?.breakdown]);

  const onApplySavedOption = useCallback(
    (savedOption: SavedOptionRESP) => {
      const findSavedOptionByCode = (code: string) => savedOption.options.find((item) => item.group.code === code);

      const sizeOption = findSavedOptionByCode(ProductCommonOption.SIZE);
      const matchedSize = dataSize?.find((item) => item.option_id === sizeOption?.option.id);

      if (savedOption.input_options) {
        setValue('isDirectInput', true);
        setValue('cuttingSize', {
          width: savedOption.input_options.width || 0,
          height: savedOption.input_options.height || 0,
        });
      } else if (matchedSize) {
        setValue('isDirectInput', false);
        setValue('size', String(matchedSize.option_id));
      }

      const subjectMatterOption = findSavedOptionByCode(ProductCommonOption.SUBJECT_MATTER);
      const subjectMatterGroup = optionGroups.find((group) => group.code === ProductCommonOption.SUBJECT_MATTER);

      if (
        subjectMatterOption &&
        getGroupOptions(subjectMatterGroup).some((option) => option.id === subjectMatterOption.option.id)
      ) {
        setValue('subjectMatter', String(subjectMatterOption.option.id));
      }

      const findMatchedPaper = (code: ProductCommonOption) => {
        const paperOption = findSavedOptionByCode(code);
        const paperGroup = optionGroups.find((group) => group.code === code);

        return dataPaper
          ?.flatMap((type) =>
            type.paper_colors.flatMap((color) =>
              color.paper_weights.map((weight) => ({
                typeId: type.id,
                colorId: color.id,
                weightId: weight.id,
                paperOptionId: weight.paper.option_id,
                paperOptionIds: weight.paper.options?.map((option) => option.option_id) || [],
                paperGroupIds: weight.paper.options?.map((option) => option.group_id) || [],
                legacyPaperGroupId: weight.paper.group_id,
              })),
            ),
          )
          .find(
            (item) =>
              (item.paperOptionId === paperOption?.option.id || item.paperOptionIds.includes(paperOption?.option.id || -1)) &&
              (!paperGroup || item.paperGroupIds.includes(paperGroup.id) || item.legacyPaperGroupId === paperGroup.id),
          );
      };

      const matchedPaper = findMatchedPaper(isBookLayoutProduct ? ProductCommonOption.COVER_PAPER : ProductCommonOption.PAPER);

      if (matchedPaper) {
        setValue('paperType', String(matchedPaper.typeId));
        setValue('paperColor', String(matchedPaper.colorId));
        setValue('paperWeight', String(matchedPaper.weightId));
      }

      const printedSideCode = isBookLayoutProduct ? ProductCommonOption.PRINTED_COVER_SIDE : ProductCommonOption.PRINTED_SIDE;
      const frontSideCode = isBookLayoutProduct
        ? ProductCommonOption.PRINTED_COLOR_COVER_FSIDE
        : ProductCommonOption.PRINTED_COLOR_FSIDE;
      const backSideCode = isBookLayoutProduct
        ? ProductCommonOption.PRINTED_COLOR_COVER_BSIDE
        : ProductCommonOption.PRINTED_COLOR_BSIDE;
      const printedSideOption = findSavedOptionByCode(printedSideCode);
      const frontSideOption = findSavedOptionByCode(frontSideCode);
      const backSideOption = findSavedOptionByCode(backSideCode);

      if (
        printedSideOption &&
        getGroupOptions(optionGroups.find((item) => item.code === printedSideCode)).some(
          (item) => item.id === printedSideOption.option.id,
        )
      ) {
        setValue('printColorTotal', String(printedSideOption.option.id));
      }

      if (
        frontSideOption &&
        getGroupOptions(optionGroups.find((item) => item.code === frontSideCode)).some(
          (item) => item.id === frontSideOption.option.id,
        )
      ) {
        setValue('printColorFront', String(frontSideOption.option.id));
      }

      if (
        backSideOption &&
        getGroupOptions(optionGroups.find((item) => item.code === backSideCode)).some(
          (item) => item.id === backSideOption.option.id,
        )
      ) {
        setValue('printColorRear', String(backSideOption.option.id));
      }

      if (isBookLayoutProduct) {
        const selectedOptionalPaperGroups: string[] = [];

        BOOK_PAPER_CODES.forEach((code) => {
          const matchedBookPaper = findMatchedPaper(code);
          if (!matchedBookPaper) return;

          if (OPTIONAL_BOOK_PAPER_CODES.has(code)) {
            selectedOptionalPaperGroups.push(code);
          }

          setValue(`bookPaperSelections.${code}`, {
            type: String(matchedBookPaper.typeId),
            color: String(matchedBookPaper.colorId),
            weight: String(matchedBookPaper.weightId),
          });
        });

        setValue('bookOptionalPaperGroups', selectedOptionalPaperGroups);

        const innerPrintSelection = {
          side: findSavedOptionByCode(ProductCommonOption.PRINTED_INNER_SIDE)?.option.id,
          front: findSavedOptionByCode(ProductCommonOption.PRINTED_COLOR_INNER_FSIDE)?.option.id,
          back: findSavedOptionByCode(ProductCommonOption.PRINTED_COLOR_INNER_BSIDE)?.option.id,
        };

        if (innerPrintSelection.side || innerPrintSelection.front || innerPrintSelection.back) {
          setValue('bookPrintSelections.inner', {
            side: String(innerPrintSelection.side || ''),
            front: String(innerPrintSelection.front || ''),
            back: String(innerPrintSelection.back || ''),
          });
        }
      }

      setValue('quantity', savedOption.quantity);
      setValue('count', normalizeCaseCount(savedOption.number_of_cases));

      const postProcessingCodes = Object.values(PostProcessingCode);
      const postProcessingConfigs = savedOption.options.reduce<Record<string, string>>((configs, item) => {
        if (!postProcessingCodes.includes(item.group.code as PostProcessingCode)) return configs;

        const optionGroup = optionGroups.find((group) => group.code === item.group.code);
        const hasOption = getGroupOptions(optionGroup).some((option) => option.id === item.option.id);

        if (hasOption) {
          configs[item.group.code] = String(item.option.id);
        }

        return configs;
      }, {});

      setValue('postProcessing', Object.keys(postProcessingConfigs));
      setValue('postProcessingConfigs', postProcessingConfigs);
    },
    [dataPaper, dataSize, isBookLayoutProduct, optionGroups, setValue],
  );

  const onSubmit = (data: ProductOrderConfig) => {
    console.warn('Form submitted:', data);
  };

  const continueWithExistingDesign = (mode: FileUploadMode): boolean => {
    if (!allowWebEditor || !hasDesignGroup) return false;
    if (!quoteRequest) return false;

    if (mode === 'cart') {
      addToCart(
        {
          product_id: quoteRequest.product_id,
          design_group_id: designGroupId,
          quantity: quoteRequest.quantity_sets.quantity,
          number_of_cases: quoteRequest.quantity_sets.multiplier,
          selected_options: quoteRequest.selected_options,
          input_options: quoteRequest.input_options,
        },
        {
          onSuccess: (response) => {
            setAddToCartMessage(response.message ?? 'Added to cart.');
            addToCartMessageModalRef.current?.open();
          },
          onError: (error) => toast.error(error.response?.data.message ?? tApp('common.error')),
        },
      );
      return true;
    }

    LocalStorage.set<ProductSelectedOptions>(LOCAL_STORAGE_KEYS.PRODUCT_SELECTED_OPTIONS, {
      productId: quoteRequest.product_id,
      designGroupId,
      quoteRequest,
      input: formValues as ProductOrderConfig,
    });
    const params = new URLSearchParams({ productSlug: product.slug, design_group_id: String(designGroupId) });
    router.push(`${ROUTES.ORDER}?${params.toString()}`);
    return true;
  };

  const openWebEditor = () => {
    router.push(ROUTES.WEB_EDITOR.DETAIL(product.slug));
  };

  const onPayment = () => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      const currentQueryString = searchParams.toString();
      const returnUrl = currentQueryString ? `${pathname}?${currentQueryString}` : pathname;
      const loginParams = new URLSearchParams({ returnUrl });

      router.push(`${ROUTES.LOGIN}?${loginParams.toString()}`);
      return;
    }

    if (continueWithExistingDesign('order')) return;

    if (allowFileUpload) {
      fileUploadModalRef.current?.open('order');
      return;
    }

    if (allowWebEditor) {
      openWebEditor();
      return;
    }

    toast.error(tApp('common.error'));
  };

  const onCart = () => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      const currentQueryString = searchParams.toString();
      const returnUrl = currentQueryString ? `${pathname}?${currentQueryString}` : pathname;
      const loginParams = new URLSearchParams({ returnUrl });

      router.push(`${ROUTES.LOGIN}?${loginParams.toString()}`);
      return;
    }

    if (continueWithExistingDesign('cart')) return;

    if (allowFileUpload) {
      fileUploadModalRef.current?.open('cart');
      return;
    }

    if (allowWebEditor) {
      openWebEditor();
      return;
    }

    toast.error(tApp('common.error'));
  };

  const openViewPaperModal = () => {
    viewPaperModalRef.current?.open();
  };

  const openSpineCalculatorModal = () => {
    calculateSpineModalRef.current?.open();
  };

  //load default option size
  useEffect(() => {
    const hasSelectedSize = dataSize?.some((size) => String(size.option_id) === sizeWatch);

    if (dataSize?.[0] && !hasSelectedSize) {
      setValue('size', dataSize[0].option_id?.toString() || '');
    }
  }, [dataSize, setValue, sizeWatch]);

  //load default option paper
  useEffect(() => {
    if (!primaryPaperTypes.length) return;

    const paperType = primaryPaperTypes.find((item) => String(item.id) === paperTypeWatch) || primaryPaperTypes[0];
    const paperColor = paperType.paper_colors.find((item) => String(item.id) === paperColorWatch) || paperType.paper_colors[0];
    const paperWeight =
      paperColor?.paper_weights.find((item) => String(item.id) === paperWeightWatch) || paperColor?.paper_weights[0];

    if (paperTypeWatch !== String(paperType.id)) {
      setValue('paperType', String(paperType.id));
    }

    if (paperColor && paperColorWatch !== String(paperColor.id)) {
      setValue('paperColor', String(paperColor.id));
    }

    if (paperWeight && paperWeightWatch !== String(paperWeight.id)) {
      setValue('paperWeight', String(paperWeight.id));
    }
  }, [paperColorWatch, paperTypeWatch, paperWeightWatch, primaryPaperTypes, setValue]);

  useEffect(() => {
    if (!primaryPaperTypes.length || !paperTypeWatch) return;

    const type = primaryPaperTypes.find((item) => String(item.id) === paperTypeWatch);
    const currentColor = type?.paper_colors.find((item) => String(item.id) === paperColorWatch);

    if (!currentColor && type?.paper_colors[0]) {
      setValue('paperColor', type.paper_colors[0].id.toString());
    }
  }, [primaryPaperTypes, paperTypeWatch, paperColorWatch, setValue]);

  useEffect(() => {
    if (!primaryPaperTypes.length || !paperTypeWatch || !paperColorWatch) return;

    const type = primaryPaperTypes.find((item) => String(item.id) === paperTypeWatch);
    const color = type?.paper_colors.find((item) => String(item.id) === paperColorWatch);
    const currentWeight = color?.paper_weights.find((item) => String(item.id) === formValues.paperWeight);

    if (!currentWeight && color?.paper_weights[0]) {
      setValue('paperWeight', color.paper_weights[0].id.toString());
    }
  }, [primaryPaperTypes, paperTypeWatch, paperColorWatch, formValues.paperWeight, setValue]);

  useEffect(() => {
    if (!isBookLayoutProduct || !dataPaper) return;

    bookPaperSections.forEach(({ code, isOptional }) => {
      if (isOptional && !formValues.bookOptionalPaperGroups?.includes(code)) return;

      const group = optionGroups.find((item) => item.code === code);
      const paperTypes = getPapersForGroup(dataPaper, group?.id);
      const selection = formValues.bookPaperSelections?.[code];
      const type = paperTypes.find((item) => String(item.id) === selection?.type) || paperTypes[0];
      const color = type?.paper_colors.find((item) => String(item.id) === selection?.color) || type?.paper_colors[0];
      const weight = color?.paper_weights.find((item) => String(item.id) === selection?.weight) || color?.paper_weights[0];

      if (!type || !color || !weight) return;

      if (selection?.type !== String(type.id) || selection.color !== String(color.id) || selection.weight !== String(weight.id)) {
        setValue(`bookPaperSelections.${code}`, {
          type: String(type.id),
          color: String(color.id),
          weight: String(weight.id),
        });
      }
    });
  }, [
    bookPaperSections,
    dataPaper,
    formValues.bookOptionalPaperGroups,
    formValues.bookPaperSelections,
    isBookLayoutProduct,
    optionGroups,
    setValue,
  ]);

  //load default option for printSide & quantity & case
  useEffect(() => {
    if (product) {
      if (optionGroups.length) {
        const printSideOptions = optionGroups.find(
          (item) =>
            item.code === (isBookLayoutProduct ? ProductCommonOption.PRINTED_COVER_SIDE : ProductCommonOption.PRINTED_SIDE),
        );
        const frontSideOptions = optionGroups.find(
          (item) =>
            item.code ===
            (isBookLayoutProduct ? ProductCommonOption.PRINTED_COLOR_COVER_FSIDE : ProductCommonOption.PRINTED_COLOR_FSIDE),
        );
        const backSideOptions = optionGroups.find(
          (item) =>
            item.code ===
            (isBookLayoutProduct ? ProductCommonOption.PRINTED_COLOR_COVER_BSIDE : ProductCommonOption.PRINTED_COLOR_BSIDE),
        );
        const hasSelectedOption = (currentValue: string, options?: { id: number }[]) =>
          options?.some((option) => String(option.id) === currentValue);

        const printSideGroupOptions = getGroupOptions(printSideOptions);
        const frontSideGroupOptions = getGroupOptions(frontSideOptions);
        const backSideGroupOptions = getGroupOptions(backSideOptions);
        const subjectMatterGroupOptions = getGroupOptions(subjectMatterGroup);

        if (!hasSelectedOption(printColorTotalWatch, printSideGroupOptions)) {
          setValue('printColorTotal', printSideGroupOptions[0]?.id.toString() || '');
        }

        if (!hasSelectedOption(printColorFrontWatch, frontSideGroupOptions)) {
          setValue('printColorFront', frontSideGroupOptions[0]?.id.toString() || '');
        }

        if (!hasSelectedOption(printColorRearWatch, backSideGroupOptions)) {
          setValue('printColorRear', backSideGroupOptions[0]?.id.toString() || '');
        }

        if (!hasSelectedOption(subjectMatterWatch, subjectMatterGroupOptions)) {
          setValue('subjectMatter', subjectMatterGroupOptions[0]?.id.toString() || '');
        }
      }

      const defaultQuantity = Array.isArray(product.quantity_prices)
        ? product.quantity_prices[0]?.quantity
        : FALLBACK_QUANTITIES[0];
      setValue('quantity', defaultQuantity || 0);

      setValue('count', 1);
    }
  }, [
    isBookLayoutProduct,
    printColorFrontWatch,
    printColorRearWatch,
    printColorTotalWatch,
    optionGroups,
    product,
    setValue,
    subjectMatterGroup,
    subjectMatterWatch,
  ]);

  useEffect(() => {
    if (!isBookLayoutProduct || !innerPrintOptions) return;

    const currentSelection = formValues.bookPrintSelections?.inner;
    const selection = {
      side: innerPrintOptions.sideOptions.some((option) => option.value === currentSelection?.side)
        ? currentSelection?.side || ''
        : innerPrintOptions.sideOptions[0]?.value || '',
      front: innerPrintOptions.frontOptions.some((option) => option.value === currentSelection?.front)
        ? currentSelection?.front || ''
        : innerPrintOptions.frontOptions[0]?.value || '',
      back: innerPrintOptions.backOptions.some((option) => option.value === currentSelection?.back)
        ? currentSelection?.back || ''
        : innerPrintOptions.backOptions[0]?.value || '',
    };

    if (
      selection.side !== currentSelection?.side ||
      selection.front !== currentSelection?.front ||
      selection.back !== currentSelection?.back
    ) {
      setValue('bookPrintSelections.inner', selection);
    }
  }, [formValues.bookPrintSelections, innerPrintOptions, isBookLayoutProduct, setValue]);

  // Auto-apply after default option effects so saved values are never overwritten.
  useEffect(() => {
    const savedOptionId = searchParams.get('savedOptionId');

    if (!savedOptionId) return;
    if (!dataSize || !dataPaper) return;

    if (!pendingSavedOption || String(pendingSavedOption.id) !== savedOptionId || pendingSavedOption.product_id !== product.id) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete('savedOptionId');
      const nextQueryString = nextParams.toString();

      router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, { scroll: false });
      return;
    }

    onApplySavedOption(pendingSavedOption);
    setPendingSavedOption(undefined);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('savedOptionId');
    const nextQueryString = nextParams.toString();

    router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, { scroll: false });
  }, [
    dataPaper,
    dataSize,
    onApplySavedOption,
    pathname,
    pendingSavedOption,
    product.id,
    router,
    searchParams,
    setPendingSavedOption,
  ]);

  //------handle size with direct input
  useEffect(() => {
    if (!isDirectInputWatch && sizeWatch && dataSize) {
      const size = dataSize.find((item) => String(item.option_id) === sizeWatch);
      setValue('cuttingSize', { width: size?.cutting_width || 0, height: size?.cutting_height || 0 });
      setValue('editingSize', { width: size?.working_width || 0, height: size?.working_height || 0 });
      setValue('safeSize', { width: (size?.cutting_width || 4) - 4 || 0, height: (size?.cutting_height || 4) - 4 || 0 });
    }
  }, [isDirectInputWatch, sizeWatch, dataSize, setValue]);

  useEffect(() => {
    if (isDirectInputWatch) {
      const editWidth = Number(cuttingWidthWatch || -2) + 2;
      const safeWidth = Number(cuttingWidthWatch || 4) - 4;

      setValue('editingSize.width', editWidth);
      setValue('safeSize.width', safeWidth);
    }
  }, [cuttingWidthWatch, setValue, isDirectInputWatch]);

  useEffect(() => {
    if (isDirectInputWatch) {
      const editHeight = Number(cuttingHeightWatch || -2) + 2;
      const safeHeight = Number(cuttingHeightWatch || 4) - 4;

      setValue('editingSize.height', editHeight);
      setValue('safeSize.height', safeHeight);
    }
  }, [cuttingHeightWatch, setValue, isDirectInputWatch]);
  //handle size with direct input-----

  //----save quotation for using ProductCalculation
  useEffect(() => {
    if (dataQuotation) {
      setQuotation(dataQuotation);
    } else {
      setQuotation(null);
    }
  }, [dataQuotation, setQuotation]);

  useEffect(() => {
    setIsLoadingQuotation(isLoadingQuotation);
  }, [isLoadingQuotation, setIsLoadingQuotation]);

  useEffect(() => {
    setQuoteRequest(quoteRequest);
  }, [quoteRequest, setQuoteRequest]);

  useEffect(() => {
    setFormValues(formValues as ProductOrderConfig);
  }, [formValues, setFormValues]);

  useEffect(() => {
    return () => {
      setQuoteRequest(undefined);
      setFormValues(undefined);
    };
  }, [setFormValues, setQuoteRequest]);
  //save quotation for using ProductCalculation--------

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='flex w-full flex-col gap-6 bg-white p-4 md:p-0 lg:max-w-170'>
        <div className='hidden space-y-3 md:block'>
          <nav className='body-14 text-text-secondary flex items-center gap-1 p-1'>
            <span>Home</span>
            <span>
              <ChevronRight className='size-5' />
            </span>
            <span>{product.category.name.ko || ''}</span>
            <span>
              <ChevronRight className='size-5' />
            </span>
            <span className='text-text-main title-14 font-semibold'>{product.name.ko}</span>
          </nav>
          <div className='flex items-end gap-6'>
            <h1 className='title-24'>{product?.name.ko}</h1>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                <span className='body-14 font-medium'>
                  {t('star')} ({product.average_rating})
                </span>
                <Star className='fill-text-brand text-text-brand size-3.5' />
              </div>
              <div className='bg-border-soft h-3 w-px' />
              <div className='body-14 font-medium underline underline-offset-4'>
                {t('review')} ({product.total_reviews})
              </div>
            </div>
          </div>

          <div className='text-text-secondary space-y-2 rounded-lg bg-gray-50 p-4'>
            <h3 className='title-14'>{t('simple_product_description')}</h3>
            <div className='body-14 scrollbar-thin max-h-30 space-y-1 overflow-y-auto whitespace-pre-line'>
              {product?.short_description || '-'}
            </div>
          </div>
        </div>

        <ProductSelectionInput
          sizeOptions={sizeOptions}
          hasSubjectMatter={subjectMatterOptions.length > 0}
          subjectMatterOptions={subjectMatterOptions}
          paperTypeOptions={paperTypeOptions}
          paperColorOptions={paperColorOptions}
          paperWeightOptions={paperWeightOptions}
          openViewPaperModal={openViewPaperModal}
          isBookProduct={isBookLayoutProduct}
          bookPaperSections={bookPaperSections}
          innerPrintOptions={innerPrintOptions}
          printSideOptions={printSideOptions}
          frontSideOptions={frontSideOptions}
          backSideOptions={backSideOptions}
          quantityOptions={quantityOptions}
          caseOptions={CASE_OPTIONS}
          availablePostProcessingOptions={availablePostProcessingOptions}
          postProcessingOptionMap={postProcessingOptionMap}
          postProcessingPriceMap={postProcessingPriceMap}
          productSlug={product.slug}
          allowDirectInput={allowDirectInput}
          allowWebEditor={allowWebEditor}
          infoIcon={product.info_icon}
          productName={product.name.ko}
        />

        <PaymentSummary
          className='md:pt-4'
          productId={product.id}
          paymentAmount={dataQuotation?.total || 0}
          supplyPrice={dataQuotation?.sub_total || 0}
          productVAT={Math.round((dataQuotation?.sub_total || 0) * 0.1)}
          box={dataQuotation?.box_count || 1}
          displayPaymentIcon
          displayCartButton
          paymentButtonTitle={tApp('my.order_button')}
          weight={dataQuotation?.weight ? dataQuotation.weight.toFixed(1) + 'kg' : '-'}
          onPayment={onPayment}
          onCart={onCart}
          onCalculate={() => productCalculationModalRef.current?.open()}
          priceContainerClassName='items-start md:item-center'
          paymentAmountTitleClassName='md:title-24'
          paymentAmountClassName='md:title-40'
          supplyVATClassName='md:body-18'
          buttonContainerClassName='mt-2 md:mt-8'
          displayShippingQuantity={!isDesktop}
          shippingQuantityContainerClassName='mt-2'
          displayCalculateButton
          isLoading={isLoadingQuotation}
          isCartLoading={hasDesignGroup && isAddingToCart}
          onApplySavedOption={onApplySavedOption}
          paymentButtonClassname='md:body-18 bg-primary-500 max-w-50 font-bold! md:h-14'
        />

        <ViewPaper
          key={paperTypeWatch}
          ref={viewPaperModalRef}
          paperTypes={shouldFilterPapersByUnitPrice ? primaryPaperTypes : dataPaper || []}
          selectedType={paperTypeWatch}
        />
        <ProductCalculationModal ref={productCalculationModalRef} onPayment={onPayment} />
        <FileUploadModal
          ref={fileUploadModalRef}
          productSlug={product.slug}
          quoteRequest={quoteRequest}
          quotationTotal={dataQuotation?.total}
          formValues={formValues as ProductOrderConfig}
        />
        <CalculateSpineModal ref={calculateSpineModalRef} papers={spinePapers} selectedPaperId={selectedSpinePaperId} />
        <MessageModal ref={addToCartMessageModalRef} type='success' message={addToCartMessage} />
      </form>

      <ProductCalculation
        productId={product.id}
        openSpineModal={openSpineCalculatorModal}
        onPayment={onPayment}
        onApplySavedOption={onApplySavedOption}
      />
    </FormProvider>
  );
};
