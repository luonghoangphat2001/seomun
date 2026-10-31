import { DesignSourceType } from '@/enums/common';
import { DesignSide } from '@/enums/design';
import { DesignLayer } from '@/types/design';

export type ArtWorkREQ = {
  side: DesignSide;
  layout_data: {
    background: {
      color?: string;
      image_url?: string;
    };
    objects: DesignLayer[];
  };
  layout_s3_path: string;
  preview_image_path: string;
  cutline_image_url: string;
};

export type ArtWorkUpdateREQ = ArtWorkREQ & {
  id?: number;
};

export type DesignCreateREQ = {
  user_id: number;
  product_id: number;
  title: string;
  size_option_id: number;
  width_mm: number;
  height_mm: number;
  // preview_image_path: string;
  artworks: ArtWorkREQ[];
};

export type DesignUpdateREQ = Omit<DesignCreateREQ, 'artworks'> & {
  id: number;
  artworks: ArtWorkUpdateREQ[];
};

export type DesignHistoryREQ = {
  page?: number;
  source_type?: DesignSourceType;
  per_page?: number;
  productId?: number;
  sort_by?: string;
  sort_order?: string;
};
