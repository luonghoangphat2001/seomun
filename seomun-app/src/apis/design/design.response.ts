import { DesignSourceType } from '@/enums/common';
import { DesignSide } from '@/enums/design';
import { DesignLayer, DesignWebEditor } from '@/types/design';

export type ArtWork = {
  id: number;
  side: DesignSide;
  layout_data: {
    background: {
      color?: string;
      image_url?: string;
    };
    objects: DesignLayer[];
  };
  layout_s3_path: string;
  logo_path?: string;
  preview_image_path: string;
  cutline_image_url?: string;
};

export type DesignGroup = {
  id: number;
  user_id: number;
  product_id: number;
  title: string;
  size_option_id: number;
  size_option_width: number;
  size_option_height: number;
  width_mm: number;
  height_mm: number;
  preview_image_path: string;
  preview_pdf_url: string | null;
  web_editor?: DesignWebEditor | null;
  artworks: ArtWork[];
};

export type DesignCreateRESP = {
  design_group: DesignGroup;
};

export type DesignDetailRESP = DesignGroup;

export type DesignHistoryArtWork = Omit<ArtWork, 'layout_data' | 'layout_s3_path'> & {
  layout_data: DesignLayer[] | ArtWork['layout_data'];
  layout_s3_path: string | null;
};

export type DesignHistoryRESP = {
  id: number;
  product_id: number;
  order_id: number | null;
  order_item_id: number | null;
  source_type: DesignSourceType;
  title: string;
  metadata: string | null;
  size_option_id: number;
  width_mm: number;
  height_mm: number;
  preview: {
    front: {
      preview_path: string;
      preview_url: string;
    };
    back: {
      preview_path: string;
      preview_url: string;
    };
  };
  created_at: string;
  updated_at: string;
  artworks: {
    front: DesignHistoryArtWork | null;
    back: DesignHistoryArtWork | null;
  };
};

export type DesignHistoryListRESP = {
  designs: DesignHistoryRESP[];
};
