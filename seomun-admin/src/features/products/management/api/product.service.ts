import {
  BOOK_OPTION_GROUP_CODES,
  DEFAULT_BOOK_OPTION_OPTIONS,
  DEFAULT_PRODUCT_FORM_VALUES,
  type BookOptionGroupCode,
  type ProductFormValues,
} from '../schemas';
import { PRODUCT_INFO_ICON_FIELDS } from '../constants';
import { ProductStatus } from '../enums';
import type { ExportProductListREQ, ProductCreateREQ, ProductListREQ, ProductUpdateREQ } from './product.request';
import type {
  AdminProductRESP,
  ErpOptionGroup,
  ErpOptionGroupsRESP,
  ProductCreateRESP,
  ProductDetailRESP,
  ProductExportRESP,
  ProductListItemRESP,
  ProductListLocale,
  ProductListRESP,
  ProductLocalizedText,
  ProductUpdateRESP,
} from './product.response';
import {
  checkProductExportStatusAPI,
  createProductAPI,
  deleteProductAPI,
  exportProductsExcelAPI,
  getErpOptionGroupsAPI,
  getProductDetailAPI,
  getProductsAPI,
  updateProductAPI,
} from './product.api';

export async function getProductList(params: ProductListREQ, locale: ProductListLocale = 'en'): Promise<ProductListRESP> {
  const response = await getProductsAPI(params);
  const currentPage = response.pagination.current_page;
  const perPage = response.pagination.per_page;
  const startNo = (currentPage - 1) * perPage;

  return {
    ...response,
    data: {
      products: response.data.products.map((product, index) => mapAdminProductToListItem(product, startNo + index + 1, locale)),
    },
  };
}

export function createProduct(payload: ProductCreateREQ): Promise<ProductCreateRESP> {
  return createProductAPI(payload);
}

export function getProductDetail(productId: string): Promise<ProductDetailRESP> {
  return getProductDetailAPI(productId);
}

export function updateProduct(productId: string, payload: ProductUpdateREQ): Promise<ProductUpdateRESP> {
  return updateProductAPI(productId, payload);
}

export function deleteProduct(productId: string): Promise<ProductUpdateRESP> {
  return deleteProductAPI(productId);
}

export function getErpOptionGroups(): Promise<ErpOptionGroupsRESP> {
  return getErpOptionGroupsAPI();
}

const BOOK_OPTION_GROUP_DEFINITIONS: Array<{
  code: BookOptionGroupCode;
  name: string;
  sourceGroupCode: 'paper' | 'printed_side' | 'printed_color_fside' | 'printed_color_bside';
  isRequired: boolean;
}> = [
  { code: BOOK_OPTION_GROUP_CODES.COVER_PAPER, name: 'Cover Paper', sourceGroupCode: 'paper', isRequired: true },
  { code: BOOK_OPTION_GROUP_CODES.PRINTED_COVER_SIDE, name: 'Printed Cover Side', sourceGroupCode: 'printed_side', isRequired: true },
  {
    code: BOOK_OPTION_GROUP_CODES.PRINTED_COLOR_COVER_FSIDE,
    name: 'Printed Color Cover Front Side',
    sourceGroupCode: 'printed_color_fside',
    isRequired: true,
  },
  {
    code: BOOK_OPTION_GROUP_CODES.PRINTED_COLOR_COVER_BSIDE,
    name: 'Printed Color Cover Back Side',
    sourceGroupCode: 'printed_color_bside',
    isRequired: true,
  },
  { code: BOOK_OPTION_GROUP_CODES.INNER_PAPER, name: 'Inner Paper', sourceGroupCode: 'paper', isRequired: true },
  { code: BOOK_OPTION_GROUP_CODES.PRINTED_INNER_SIDE, name: 'Printed Inner Side', sourceGroupCode: 'printed_side', isRequired: true },
  {
    code: BOOK_OPTION_GROUP_CODES.PRINTED_COLOR_INNER_FSIDE,
    name: 'Printed Color Inner Front Side',
    sourceGroupCode: 'printed_color_fside',
    isRequired: true,
  },
  {
    code: BOOK_OPTION_GROUP_CODES.PRINTED_COLOR_INNER_BSIDE,
    name: 'Printed Color Inner Back Side',
    sourceGroupCode: 'printed_color_bside',
    isRequired: true,
  },
  { code: BOOK_OPTION_GROUP_CODES.ADDITIONAL_PAPER, name: 'Additional Paper', sourceGroupCode: 'paper', isRequired: false },
  { code: BOOK_OPTION_GROUP_CODES.COLORED_PAPER_1, name: 'Colored Paper 1', sourceGroupCode: 'paper', isRequired: false },
  { code: BOOK_OPTION_GROUP_CODES.COLORED_PAPER_2, name: 'Colored Paper 2', sourceGroupCode: 'paper', isRequired: false },
  { code: BOOK_OPTION_GROUP_CODES.FLYLEAF_PAPER, name: 'Flyleaf Paper', sourceGroupCode: 'paper', isRequired: false },
];

const BOOK_SOURCE_OPTION_GROUP_CODES: Set<string> = new Set(BOOK_OPTION_GROUP_DEFINITIONS.map((definition) => definition.sourceGroupCode));

export function exportProductsExcel(payload: ExportProductListREQ): Promise<ProductExportRESP> {
  return exportProductsExcelAPI(payload);
}

export function checkProductExportStatus(historyId: string | number): Promise<ProductExportRESP> {
  return checkProductExportStatusAPI(historyId);
}

function toNumber(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function getLocalizedText(value: ProductLocalizedText | null | undefined, locale: ProductListLocale) {
  const fallbackLocale: ProductListLocale = locale === 'en' ? 'ko' : 'en';
  const localizedValue = value?.[locale]?.trim();
  const fallbackValue = value?.[fallbackLocale]?.trim();

  return localizedValue || fallbackValue || '-';
}

function mapAdminProductToListItem(product: AdminProductRESP, no: number, locale: ProductListLocale): ProductListItemRESP {
  return {
    id: String(product.id),
    no,
    product_code: product.sku || '-',
    product_name: getLocalizedText(product.name, locale),
    product_name_en: product.name?.en?.trim() || null,
    category_name: getLocalizedText(product.category?.name, locale),
    status: product.status ?? (product.is_active ? ProductStatus.SOLD : ProductStatus.HIDDEN),
    is_promotional: product.is_popular || product.is_featured,
    is_public: product.is_public,
    has_quotation: product.has_quotation,
    branch: product.branch || '-',
    customer: product.customer || '-',
    manager_name: product.registered_by || '-',
    created_at: product.created_at,
    registration_date: product.created_at,
    thumbnail_url: product.first_image || product.images[0] || null,
    is_active: product.is_active,
  };
}

export function mapProductFormToRequest(values: ProductFormValues, erpOptionGroups: ErpOptionGroup[], isBookProduct = false): ProductCreateREQ {
  const selectedGroupIds = new Set(values.option_group_ids);
  const groupById = new Map(erpOptionGroups.map((group) => [String(group.id), group]));
  const groupByCode = new Map(erpOptionGroups.map((group) => [group.code, group]));
  const hasBookOptionValues =
    isBookProduct && BOOK_OPTION_GROUP_DEFINITIONS.some((definition) => (values.book_option_options[definition.code] ?? []).length > 0);

  const standardOptionGroups = values.option_group_ids
    .filter((groupId) => selectedGroupIds.has(groupId))
    .map((groupId) => {
      const group = groupById.get(groupId);
      if (!group || (hasBookOptionValues && BOOK_SOURCE_OPTION_GROUP_CODES.has(group.code))) return null;

      const selectedOptionIds = new Set(values.option_options[groupId] ?? []);
      const options = group.erp_options
        .filter((option) => selectedOptionIds.has(String(option.id)))
        .map((option) => ({
          label: option.label,
          value: option.value,
          erp_option_id: option.id,
          additional_price: toNumber(option.additional_price),
          metadata: [],
          sort_order: option.sort_order,
          is_active: option.is_active,
        }));

      return {
        code: group.code,
        erp_option_group_id: group.id,
        name: group.label,
        display_type: group.display_type,
        is_required: group.is_required,
        sort_order: group.sort_order,
        options,
      };
    })
    .filter((group): group is NonNullable<typeof group> => Boolean(group));

  const bookOptionGroups = hasBookOptionValues
    ? BOOK_OPTION_GROUP_DEFINITIONS.map((definition, index) => {
        const selectedOptionIds = new Set(values.book_option_options[definition.code] ?? []);
        const group = groupByCode.get(definition.sourceGroupCode);
        if (!group || selectedOptionIds.size === 0) return null;

        return {
          code: definition.code,
          erp_option_group_id: group.id,
          name: definition.name,
          display_type: group.display_type,
          is_required: definition.isRequired,
          sort_order: index + 1,
          options: group.erp_options
            .filter((option) => selectedOptionIds.has(String(option.id)))
            .map((option) => ({
              label: option.label,
              value: option.value,
              erp_option_id: option.id,
              additional_price: toNumber(option.additional_price),
              metadata: [],
              sort_order: option.sort_order,
              is_active: option.is_active,
            })),
        };
      }).filter((group): group is NonNullable<typeof group> => Boolean(group))
    : [];

  return {
    category_id: toNumber(values.category_id),
    pricing_profile_id: toNumber(values.pricing_profile_id),
    web_editor_id: values.allow_web_editor ? toNumber(values.web_editor_id) : null,
    allow_file_upload: values.allow_file_upload,
    allow_web_editor: values.allow_web_editor,
    is_blank_canvas: values.is_blank_canvas,
    is_active: values.is_active,
    is_popular: values.is_popular,
    requires_separate_shipping: values.requires_separate_shipping,
    separate_shipping_fee: toNumber(values.separate_shipshipping),
    name: values.name.trim(),
    name_en: values.name_en.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    short_description: values.short_description.trim(),
    price: toNumber(values.price),
    sku: values.sku.trim(),
    images: values.images.map((image) => image.url.trim()).filter(Boolean),
    shopping_setting_item_ids: values.shopping_setting_item_ids,
    specification: {
      production_time_days: toNumber(values.specification.production_time_days),
      notes: values.specification.notes.trim(),
    },
    info_icon: Object.fromEntries(
      PRODUCT_INFO_ICON_FIELDS.map((field) => [field, values.info_icon[field].trim() || null]),
    ) as ProductCreateREQ['info_icon'],
    option_groups: [...standardOptionGroups, ...bookOptionGroups],
    quantity_prices: values.quantity_prices.map((price) => ({
      quantity: toNumber(price.quantity),
      price: toNumber(price.price),
    })),
    product_sets: {
      quantity: toNumber(values.product_sets.quantity),
      set_type: 'input',
      min_set: toNumber(values.product_sets.min_set),
      max_set: toNumber(values.product_sets.max_set),
      step_set: toNumber(values.product_sets.step_set),
    },
  };
}

function toFormString(value: number | string | null | undefined, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

export function mapProductDetailToFormValues(product: AdminProductRESP): ProductFormValues {
  const imageUrls = product.images.length > 0 ? product.images : product.first_image ? [product.first_image] : [];
  const bookOptionOptions = { ...DEFAULT_BOOK_OPTION_OPTIONS };
  const optionOptions = Object.fromEntries(
    (product.option_groups ?? [])
      .filter((group) => !BOOK_OPTION_GROUP_DEFINITIONS.some((definition) => definition.code === group.code))
      .map((group) => [
        String(group.erp_option_group_id ?? group.id ?? ''),
        group.options.map((option) => String(option.erp_option_id ?? option.id ?? '')).filter(Boolean),
      ]),
  );

  (product.option_groups ?? []).forEach((group) => {
    const bookDefinition = BOOK_OPTION_GROUP_DEFINITIONS.find((definition) => definition.code === group.code);
    if (bookDefinition) {
      bookOptionOptions[bookDefinition.code] = group.options.map((option) => String(option.erp_option_id ?? option.id ?? '')).filter(Boolean);
    }
  });

  const quantityPrices =
    product.quantity_prices && product.quantity_prices.length > 0
      ? product.quantity_prices.map((quantityPrice) => ({
          quantity: toFormString(quantityPrice.quantity, '100'),
          price: toFormString(quantityPrice.price, '0'),
        }))
      : DEFAULT_PRODUCT_FORM_VALUES.quantity_prices;

  return {
    category_id: toFormString(product.category_id),
    pricing_profile_id: toFormString(product.pricing_profile_id ?? product.pricing_profile?.id),
    web_editor_id: toFormString(product.web_editor_id),
    allow_file_upload: product.allow_file_upload ?? DEFAULT_PRODUCT_FORM_VALUES.allow_file_upload,
    allow_web_editor: product.allow_web_editor ?? DEFAULT_PRODUCT_FORM_VALUES.allow_web_editor,
    is_blank_canvas: product.is_blank_canvas ?? DEFAULT_PRODUCT_FORM_VALUES.is_blank_canvas,
    is_active: product.is_active ?? DEFAULT_PRODUCT_FORM_VALUES.is_active,
    is_popular: product.is_popular ?? DEFAULT_PRODUCT_FORM_VALUES.is_popular,
    is_book_product: (product.option_groups ?? []).some((group) =>
      BOOK_OPTION_GROUP_DEFINITIONS.some((definition) => definition.code === group.code),
    ),
    requires_separate_shipping: product.requires_separate_shipping ?? DEFAULT_PRODUCT_FORM_VALUES.requires_separate_shipping,
    separate_shipshipping: toFormString(product.separate_shipping_fee, DEFAULT_PRODUCT_FORM_VALUES.separate_shipshipping),
    name: product.name.ko ?? '',
    name_en: product.name.en ?? '',
    slug: product.slug ?? '',
    description: product.description ?? '',
    short_description: product.short_description ?? '',
    price: toFormString(product.price, '0'),
    sku: product.sku ?? '',
    images: imageUrls.map((url) => ({ url })),
    shopping_setting_item_ids: product.shopping_setting_item_ids ?? [],
    specification: {
      production_time_days: toFormString(product.specification?.production_time_days, DEFAULT_PRODUCT_FORM_VALUES.specification.production_time_days),
      notes: product.specification?.notes ?? '',
    },
    info_icon: Object.fromEntries(
      PRODUCT_INFO_ICON_FIELDS.map((field) => [field, product.info_icon?.[field] ?? '']),
    ) as ProductFormValues['info_icon'],
    option_group_ids: Object.keys(optionOptions).filter(Boolean),
    option_options: optionOptions,
    book_option_options: bookOptionOptions,
    quantity_prices: quantityPrices,
    product_sets: {
      quantity: toFormString(product.product_sets?.quantity, DEFAULT_PRODUCT_FORM_VALUES.product_sets.quantity),
      min_set: toFormString(product.product_sets?.min_set, DEFAULT_PRODUCT_FORM_VALUES.product_sets.min_set),
      max_set: toFormString(product.product_sets?.max_set, DEFAULT_PRODUCT_FORM_VALUES.product_sets.max_set),
      step_set: toFormString(product.product_sets?.step_set, DEFAULT_PRODUCT_FORM_VALUES.product_sets.step_set),
    },
  };
}
