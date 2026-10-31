import type { TFunction } from 'i18next';
import { SortOrder } from '@/enums';
import { z } from 'zod';

import { ProductSortField, ProductStatus } from '../enums';

const booleanSearchSchema = z
  .preprocess((value) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  }, z.boolean())
  .optional()
  .catch(undefined);

export const productListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum([ProductSortField.CREATED_AT]).optional().catch(undefined),
  sort_order: z.enum([SortOrder.ASC, SortOrder.DESC]).optional().catch(undefined),
  search_term: z.coerce.string().optional().catch(undefined),
  product_name: z.coerce.string().optional().catch(undefined),
  product_code: z.coerce.string().optional().catch(undefined),
  category_id: z.coerce.number().int().min(1).optional().catch(undefined),
  status: z.enum([ProductStatus.SOLD, ProductStatus.HIDDEN]).optional().catch(undefined),
  product_type: z.coerce.string().optional().catch(undefined),
  is_promotional: booleanSearchSchema,
  branch: z.coerce.string().optional().catch(undefined),
  customer: z.coerce.string().optional().catch(undefined),
  type: z.coerce.string().optional().catch(undefined),
  is_public: booleanSearchSchema,
  has_quotation: booleanSearchSchema,
  customer_usage: z.coerce.string().optional().catch(undefined),
});

export type ProductListSearch = z.infer<typeof productListSearchSchema>;

export const BOOK_OPTION_GROUP_CODES = {
  COVER_PAPER: 'cover_paper',
  PRINTED_COVER_SIDE: 'printed_cover_side',
  PRINTED_COLOR_COVER_FSIDE: 'printed_color_cover_fside',
  PRINTED_COLOR_COVER_BSIDE: 'printed_color_cover_bside',
  INNER_PAPER: 'inner_paper',
  PRINTED_INNER_SIDE: 'printed_inner_side',
  PRINTED_COLOR_INNER_FSIDE: 'printed_color_inner_fside',
  PRINTED_COLOR_INNER_BSIDE: 'printed_color_inner_bside',
  ADDITIONAL_PAPER: 'additional_paper',
  COLORED_PAPER_1: 'colored_paper_1',
  COLORED_PAPER_2: 'colored_paper_2',
  FLYLEAF_PAPER: 'flyleaf_paper',
} as const;

export type BookOptionGroupCode = (typeof BOOK_OPTION_GROUP_CODES)[keyof typeof BOOK_OPTION_GROUP_CODES];

export const DEFAULT_BOOK_OPTION_OPTIONS: Record<BookOptionGroupCode, string[]> = {
  cover_paper: [],
  printed_cover_side: [],
  printed_color_cover_fside: [],
  printed_color_cover_bside: [],
  inner_paper: [],
  printed_inner_side: [],
  printed_color_inner_fside: [],
  printed_color_inner_bside: [],
  additional_paper: [],
  colored_paper_1: [],
  colored_paper_2: [],
  flyleaf_paper: [],
};

export type ProductSearchFilterValues = {
  search_term: string;
  product_name: string;
  product_code: string;
  category_id?: string;
  status?: ProductStatus;
  product_type?: string;
  is_promotional?: 'true' | 'false';
  branch: string;
  customer: string;
  type: string;
  is_public?: 'true' | 'false';
  has_quotation?: 'true' | 'false';
  customer_usage: string;
};

export const EMPTY_PRODUCT_SEARCH_FILTER_VALUES: ProductSearchFilterValues = {
  search_term: '',
  product_name: '',
  product_code: '',
  category_id: undefined,
  status: undefined,
  product_type: undefined,
  is_promotional: undefined,
  branch: '',
  customer: '',
  type: '',
  is_public: undefined,
  has_quotation: undefined,
  customer_usage: '',
};

function createNumericStringSchema(tValidation: TFunction<'validation'>, field: string) {
  return z
    .string()
    .trim()
    .min(1, tValidation('required', { field }))
    .refine((value) => Number.isFinite(Number(value)), tValidation('numeric_only'));
}

export function createProductFormSchema(tValidation: TFunction<'validation'>, tForm: TFunction<'page'>) {
  const required = (field: string) => tValidation('required', { field });

  return z
    .object({
      category_id: z.string().min(1, required(tForm('products.management.form.fields.category'))),
      pricing_profile_id: z.string().min(1, required(tForm('products.management.form.fields.pricing_profile'))),
      web_editor_id: z.string(),
      allow_file_upload: z.boolean(),
      allow_web_editor: z.boolean(),
      is_blank_canvas: z.boolean(),
      is_active: z.boolean(),
      is_popular: z.boolean(),
      is_book_product: z.boolean(),
      requires_separate_shipping: z.boolean(),
      separate_shipshipping: createNumericStringSchema(tValidation, tForm('products.management.form.fields.separate_shipshipping')),
      name: z
        .string()
        .trim()
        .min(1, required(tForm('products.management.form.fields.name'))),
      name_en: z
        .string()
        .trim()
        .min(1, required(tForm('products.management.form.fields.name_en'))),
      slug: z
        .string()
        .trim()
        .min(1, required(tForm('products.management.form.fields.slug'))),
      description: z
        .string()
        .trim()
        .min(1, required(tForm('products.management.form.fields.description'))),
      short_description: z
        .string()
        .trim()
        .min(1, required(tForm('products.management.form.fields.short_description'))),
      price: createNumericStringSchema(tValidation, tForm('products.management.form.fields.price')),
      sku: z
        .string()
        .trim()
        .min(1, required(tForm('products.management.form.fields.sku'))),
      images: z
        .array(z.object({ url: z.string().trim().url(tValidation('url')) }))
        .min(1, required(tForm('products.management.form.fields.product_images'))),
      shopping_setting_item_ids: z.array(z.number().int()),
      option_group_ids: z.array(z.string()),
      option_options: z.record(z.string(), z.array(z.string())),
      book_option_options: z.object({
        cover_paper: z.array(z.string()),
        printed_cover_side: z.array(z.string()),
        printed_color_cover_fside: z.array(z.string()),
        printed_color_cover_bside: z.array(z.string()),
        inner_paper: z.array(z.string()),
        printed_inner_side: z.array(z.string()),
        printed_color_inner_fside: z.array(z.string()),
        printed_color_inner_bside: z.array(z.string()),
        additional_paper: z.array(z.string()),
        colored_paper_1: z.array(z.string()),
        colored_paper_2: z.array(z.string()),
        flyleaf_paper: z.array(z.string()),
      }),
      quantity_prices: z
        .array(
          z.object({
            quantity: createNumericStringSchema(tValidation, tForm('products.management.form.fields.quantity')),
            price: createNumericStringSchema(tValidation, tForm('products.management.form.fields.price')),
          }),
        )
        .min(1, required(tForm('products.management.form.sections.quantity_prices'))),
      product_sets: z.object({
        quantity: createNumericStringSchema(tValidation, tForm('products.management.form.fields.quantity')),
        min_set: createNumericStringSchema(tValidation, tForm('products.management.form.fields.min_set')),
        max_set: createNumericStringSchema(tValidation, tForm('products.management.form.fields.max_set')),
        step_set: createNumericStringSchema(tValidation, tForm('products.management.form.fields.step_set')),
      }),
      specification: z.object({
        production_time_days: createNumericStringSchema(tValidation, tForm('products.management.form.fields.production_days')),
        notes: z.string(),
      }),
      info_icon: z.object({
        size: z.string(),
        paper: z.string(),
        printed_color: z.string(),
        quantity: z.string(),
        post_processing: z.string(),
        design: z.string(),
      }),
    })
    .superRefine((values, ctx) => {
      if (values.allow_web_editor && !values.web_editor_id.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: required(tForm('products.management.form.fields.web_editor')),
          path: ['web_editor_id'],
        });
      }
    });
}

export type ProductFormValues = z.infer<ReturnType<typeof createProductFormSchema>>;

export const DEFAULT_PRODUCT_FORM_VALUES: ProductFormValues = {
  category_id: '',
  pricing_profile_id: '',
  web_editor_id: '',
  allow_file_upload: true,
  allow_web_editor: true,
  is_blank_canvas: true,
  is_active: true,
  is_popular: false,
  is_book_product: false,
  requires_separate_shipping: false,
  separate_shipshipping: '0',
  name: '',
  name_en: '',
  slug: '',
  description: '',
  short_description: '',
  price: '0',
  sku: '',
  images: [],
  shopping_setting_item_ids: [],
  specification: {
    production_time_days: '3',
    notes: '',
  },
  info_icon: {
    size: '',
    paper: '',
    printed_color: '',
    quantity: '',
    post_processing: '',
    design: '',
  },
  option_group_ids: [],
  option_options: {},
  book_option_options: DEFAULT_BOOK_OPTION_OPTIONS,
  quantity_prices: [
    {
      quantity: '100',
      price: '0',
    },
  ],
  product_sets: {
    quantity: '100',
    min_set: '1',
    max_set: '100',
    step_set: '10',
  },
};
