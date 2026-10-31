import { DesignSourceType } from '@/enums/common';
import { PaginationRESP, UploadArtworkType } from '@/types';

export type DesignSideAssetRESP = {
  logo_path: string;
  logo_url: string;
};

export type DesignPreviewAssetRESP = {
  preview_path: string;
  preview_url: string;
};

export type DesignAssetsRESP = {
  front: DesignSideAssetRESP;
  back: DesignSideAssetRESP;
};

export type DesignPreviewRESP = {
  front: DesignPreviewAssetRESP;
  back: DesignPreviewAssetRESP;
};

export type DesignArtworkRESP = {
  id?: number;
  design_group_id?: number;
  side?: 'front' | 'back' | string;
  logo_path?: string | null;
  logo_url?: string | null;
  preview_image_path?: string | null;
  preview_url?: string | null;
  layout_data?: Record<string, unknown> | unknown[];
};

export type DesignItemRESP = {
  id: number;
  product_id?: number | null;
  product_slug: string;
  product_name?: { en: string; ko: string };
  order_id: number;
  order_item_id: number;
  source_type?: DesignSourceType;
  title?: string;
  design_title?: string;
  design_mode_id: number;
  side: 'front' | 'back' | string;
  size: string;
  size_option_id?: number;
  width_mm?: number;
  height_mm?: number;
  design_group_id: string;
  text_fields: Record<string, unknown>[];
  logo: DesignAssetsRESP;
  preview: DesignPreviewRESP;
  artworks?: {
    front?: DesignArtworkRESP;
    back?: DesignArtworkRESP;
  };
  layout_data: Record<string, unknown>;
  has_layout_s3: boolean;
  metadata: Record<string, unknown>;
  file_metadata: Record<string, unknown>;
  print_as_is: boolean;
  print_without_proof: boolean;
  created_at: string;
  updated_at: string;
  upload_artwork: UploadArtworkType;
};

export type DesignListDataRESP = {
  designs: DesignItemRESP[];
  pagination: PaginationRESP;
};

export type DesignAvailableSizeRESP = {
  label: string;
  value: string;
};

export type DesignAvailableSizesDataRESP = {
  sizes: DesignAvailableSizeRESP[];
};
