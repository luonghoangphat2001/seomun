import { DesignTemplateType } from '@/enums/design';
import { OrderShippingMethod } from '@/enums/order';
import { ProductSpineSide } from '@/enums/product';
import { PaginationREQ } from '@/types';

export type ProductSearchREQ = PaginationREQ & {
  q?: string;
  category_id?: number;
};

export type ProductQuoteREQ = {
  product_id: number;
  user_coupon_id?: number;
  quantity_sets: {
    quantity: number;
    multiplier: number;
  };
  selected_options: {
    group_id: number;
    option_id: number;
  }[];
  input_options: {
    width: number;
    height: number;
    cover_page_count?: number;
    inner_page_count?: number;
    additional_page_count?: number;
    colored_page_count_1?: number;
    colored_page_count_2?: number;
    flyleaf_count?: number;
  };
  shipping_method?: OrderShippingMethod;
};

export type ArtWork = {
  url: string;
  name: string;
  size: number;
  mime: string;
  metadata?: {
    width: number;
    height: number;
  };
  print_as_is: boolean;
  print_without_proof: boolean;
};

export type ProductUploadFileREQ = {
  user_id: number;
  product_id: number;
  title: string;
  artwork: ArtWork[];
};

export type ProductSpineREQ = {
  paper_id: number;
  print_side: ProductSpineSide;
  pages: number;
};

export type ProductTemplateREQ = {
  slug: string;
  type?: DesignTemplateType;
};

export type ProductDetailReviewREQ = {
  slug: string;
  per_page: number;
};
