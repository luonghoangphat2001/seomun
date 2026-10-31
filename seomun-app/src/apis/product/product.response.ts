import { DesignTemplateSide, DesignTemplateType } from '@/enums/design';
import { Category } from '../category/category.response';
import { DesignLayer, DesignTemplateLayoutConfig, DesignWebEditor } from '@/types/design';
import { ActiveStatus } from '@/enums/common';

export type ProductSpecification = {
  size: {
    width: number | null;
    height: number | null;
    unit: string;
    display: string | null;
  };
  production_time_days: number;
  notes?: string;
  dieline: {
    enabled: boolean;
    margin_mm: number;
  };
};

export interface Product {
  id: number;
  category_id: number;
  name: { ko: string; en: string };
  slug: string;
  description: string;
  short_description?: string;
  price: string;
  compare_price?: string | null;
  sku?: string;
  images: string[];
  is_popular: boolean;
  is_featured: boolean;
  stock_quantity: number;
  min_quantity: number;
  max_quantity?: number | null;
  sort_order: number;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  category: Category;
  first_image?: string;
  has_discount: boolean;
  discount_percentage?: number | null;
  average_rating: string;
  total_reviews: number;
  option_groups: ProductOptionGroup[];
  product_sets: ProductSet;
  quantity_prices: ProductQuantityOption[];
  specification: ProductSpecification;
  web_editor: DesignWebEditor | null;
  allow_file_upload: boolean;
  allow_web_editor: boolean;
  info_icon: {
    size: string | null;
    paper: string | null;
    printed_color: string | null;
    quantity: string | null;
    post_processing: string | null;
    design: string | null;
  };
}

export type ProductQuantityOption = {
  id: number;
  quantity: number;
  price: number;
  currency: string;
  unit: string;
  production_days: number | null;
  display_unit: string;
  display: {
    quantity_text: string;
    price_text: string;
  };
};

export type ProductOptionGroup = {
  id: number;
  code: string;
  name: string;
  display_type: string;
  is_required: boolean;
  sort_order: number;
  options: ProductOption[];
  erp_option_group_id: number;
  info_content: string | null;
  info_icon_enabled: boolean;
};

export type ProductOption = {
  id: number;
  label: string;
  value: string;
  additional_price: string;
  metadata?: unknown;
  sort_order: number;
  info_icon: {
    description: string | null;
    enabled: boolean;
  };
};

export type ProductSet = {
  id: number;
  min_set: number;
  max_set: number;
  quantity: number;
  select_options: string[] | null;
  set_type: 'select';
  set_unit: string;
  step_set: number;
};

export type ProductsByCategoryRESP = {
  category: Category;
  products: Product[];
};

export type PopularProductRESP = {
  category: Category;
  products: Product[];
};

export type ProductDetailRESP = {
  product: Product;
};

export type ProductSearchRESP = {
  keyword?: string;
  products: Product[];
};

export type ProductListRESP = {
  products: Product[];
};

export type PaperSpecification = {
  thickness_mm: number;
  unit_weight_g: number;
};

export type Paper = {
  id: number;
  name: string;
  specification: PaperSpecification;
  group_id: number;
  option_id: number;
  options?: PaperOption[];
};

export type PaperOption = {
  option_id: number;
  group_id: number;
};

export type PaperResponse = {
  papers: Paper[];
};

export type PaperWeight = {
  id: number;
  code: string;
  label: string;
  value: string;
  paper: Paper;
};

export type PaperColor = {
  id: number;
  code: string;
  label: string;
  value: string;
  paper_weights: PaperWeight[];
};

export type PaperType = {
  id: number;
  code: string;
  label: string;
  value: string;
  attributes: {
    description: string;
    image: string;
  };
  paper_colors: PaperColor[];
};

export type PaperTypeRESP = {
  paper_types: PaperType[];
};

//size options
export type ProductSize = {
  id: number;
  name: string;
  width: number | null;
  height: number | null;
  cutting_width: number;
  cutting_height: number;
  working_width: number;
  working_height: number;
  size_type: string;
  is_custom_input_allowed: number;
  min_width: number | null;
  max_width: number | null;
  min_height: number | null;
  max_height: number | null;
  width_step: number;
  height_step: number;
  additional_widths: number[] | null;
  additional_heights: number[] | null;
  size_limit: number | null;
  erp_option_id: number | null;
  is_default: number;
  size_ratio: number;
  created_at: string;
  updated_at: string;
  group_id: number;
  option_id: number;
};

export type ProductSizeRESP = {
  size_options: ProductSize[];
};

export type Layer = DesignLayer;

export type Template = {
  id: number;
  name: string;
  type: DesignTemplateType;
  side: DesignTemplateSide;
  product?: null;
  specifications?: null;
  file_path: string | null;
  // font_set: TemplateFontSet | null;
  // color_set: TemplateColorSet | null;
  spot_color: {
    enabled: boolean;
    colors: string[];
  } | null;
  layout_config: DesignTemplateLayoutConfig | null;
  editor_permission: {
    allow_text_edit: boolean;
    allow_image_replace: boolean;
  } | null;
  front_preview_url: string | null;
  back_preview_url: string | null;
  preview_images: string[];
  status: ActiveStatus;
  is_active: boolean;
  registrant: {
    id: number;
    username: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  web_editor_id: number | null;
  web_editor: DesignWebEditor | null;
  size_option_id: number | null;
  size_option: {
    cutting_height: number;
    cutting_width: number;
    id: number;
    name: string;
    working_height: number;
    working_width: number;
  };
};

export type TemplateRESP = {
  templates: Template[];
};

//order quote
export type OrderQuoteRESP = {
  quote: OrderQuote;
};

export type OrderQuote = {
  product: OrderQuoteProduct;
  items: OrderQuoteItem[];
  selected_options: SelectedOption[];
  summary: OrderQuoteSummary;
};

export type OrderQuoteProduct = {
  id: number;
  name: string;
  slug: string;
};

export type OrderQuoteItem = {
  product_id: number;
  title: string;
  quantity: number;
  multiplier: number;
  unit: string;
  unit_price: number;
  total_price: number;
  production_days: number;
  configuration: OrderQuoteConfiguration;
  weight: number;
};

export type OrderQuoteConfiguration = {
  product_name: string;
  product_name_en: string;
  product_name_ja: string;
  product_slug: string;
  product_sku: string;
  product_category: string;
  product_category_en: string;
  product_category_ja: string;
  product_id: number;
  options: OrderQuoteConfigurationOption[];
  jobs: string;
  sheets: number;
  attachment: string;
  design_preview: string;
};

export type OrderQuoteConfigurationOption = {
  group_id: number;
  option_id: number;
};

export type SelectedOption = {
  group: {
    id: number;
    code: string;
    name: string;
  };
  option: {
    id: number;
    label: string;
    value: string;
    additional_price: number;
  };
};

export type OrderQuoteSummary = {
  currency: 'KRW' | string;
  line_items_total: number;
  options_total: number;
  subtotal: number;
  discount: number;
  point_used: number;
  point_discount: number;
  tax: number;
  shipping_fee: number;
  shipping_fee_type: string | null;
  total: number;
  estimated_production_days: number;
  box_count: number;
  shipping_weight: number;
};

export type ProductQuoteRESP = {
  total: number;
  sub_total: number;
  quantity: number;
  case: number;
  paper_price: number;
  printing_price: number;
  foundation_fee: number;
  post_processing_price: number;
  component_price: number;
  breakdown: ProductQuoteBreakdown[];
  estimated_production_days: number;
  vat: number;
  weight: number;
  box_count: number;
};

export type ProductQuoteBreakdown = {
  group_code: string;
  price: number;
};

export type UploadArtwork = {
  id: number;
  design_group_id: number;
  url: string;
  name: string;
  size: string;
  mime: string;
  metadata: Record<string, unknown> | null;
  print_as_is: boolean;
  print_without_proof: boolean;
  created_at: string;
  updated_at: string;
};

export type DesignGroupArtworks = {
  front: string | null;
  back: string | null;
};

export type ProductUploadFileRESP = {
  id: number;
  title: string;
  source_type: 'upload_file' | 'web_editor';
  order_id: number | null;
  order_item_id: number | null;
  size_option_id: number | null;
  size_option_name: string | null;
  metadata: Record<string, unknown> | null;
  file_metadata: Record<string, unknown> | null;
  preview_image_path: string | null;
  artworks: DesignGroupArtworks;
  upload_artworks: UploadArtwork[];
};

export type ProductUploadFileResponse = {
  design_group: ProductUploadFileRESP;
};

export type ProductSpineResponse = {
  spine_width_mm: number;
};

export type ProductDetailReviewRESP = {
  id: number;
  user_id: number;
  product_id: number;
  order_id: number;
  rating: number;
  title: string;
  content: string;
  images: string[];
  is_approved: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export type ProductReviewListRESP = {
  reviews: ProductDetailReviewRESP[];
};

export type ProductUnitPriceSettingRESP = {
  id: number;
  erp_size_option_id: number;
  erp_paper_option_id: number;
  product_id: number;
  combination_options: unknown | null;
  is_active: boolean;
  erp_subject_master_option_id: number | null;
  erp_size_option: {
    id: number;
    size_id: number;
    label: string;
  } | null;
  erp_paper_option: {
    id: number;
    paper_id: number;
    label: string;
  } | null;
  subject_master_option: unknown | null;
  quantitys: number[];
};
