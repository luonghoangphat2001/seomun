import type { BaseResponse, NestedPaginationResponse, NumberOptions, StringOptions } from '@/types/api';
import type { WebEditorRES } from '@/features/products/web-editors';

import type { FontWeight, LayerType, Side, StatusValue, TemplateSide, TemplateType, TextAlign, Unit } from '../enums';

// === Filter response types ===

export interface TemplateSearchFiltersDataRES {
  filters: {
    related_product_options: StringOptions[];
    specification_options: StringOptions[];
    registrant_options: NumberOptions[];
  };
}

export type TemplateSearchFiltersRESP = BaseResponse<TemplateSearchFiltersDataRES>;

// === Detail response types ===

export interface TemplateFontSet {
  primary: string;
  secondary: string;
}

export interface TemplateColorSet {
  primary: string;
  secondary: string;
}

export interface TemplateSpotColor {
  enabled: boolean;
  colors: string[];
}

export interface TemplateLayerPosition {
  x: number;
  y: number;
}

export interface TemplateLayerSize {
  width: number;
  height: number;
}

export interface TemplateLayerStyle {
  font_family: string;
  font_size: number;
  font_weight: FontWeight;
  line_height: number;
  letter_spacing: number;
  color: string;
  fill_image_url: string;
  align: TextAlign;
  stroke_color: string;
  stroke_width: number;
  opacity: number;
  shadow_color: string;
  shadow_blur: number;
  shadow_offset_x: number;
  shadow_offset_y: number;
  shadow_opacity: number;
}

export interface TemplateLayerOptions {
  group: string | null;
  editable: boolean;
}

export interface TemplateLayer {
  id: string;
  type: LayerType;
  side: Side;
  field_key: string;
  default_value: string;
  position: TemplateLayerPosition;
  size: TemplateLayerSize;
  rotation: number;
  style: TemplateLayerStyle;
  options: TemplateLayerOptions;
  label: string;
}

export interface TemplateBackground {
  front_image_url: string;
  back_image_url: string;
  front_color?: string;
  back_color?: string;
}

export interface TemplatePageConfig {
  width: number;
  height: number;
  unit: Unit;
  sides: Side[];
}

export interface TemplateLayoutConfig {
  version: number;
  page: TemplatePageConfig;
  background: TemplateBackground;
  layers: TemplateLayer[];
}

export interface TemplateEditorPermission {
  allow_text_edit: boolean;
  allow_image_replace: boolean;
}

export interface TemplateStatusRES {
  value: StatusValue;
  label: string;
}

export interface TemplateDetailRegistrantRES {
  id: number;
  username: string;
  name: string;
}

export interface Template {
  id: number;
  name: string;
  type: TemplateType | null;
  side: TemplateSide;
  product?: null;
  specifications?: null;
  file_path: string | null;
  font_set: TemplateFontSet | null;
  color_set: TemplateColorSet | null;
  spot_color: TemplateSpotColor | null;
  layout_config: TemplateLayoutConfig | null;
  editor_permission: TemplateEditorPermission | null;
  front_preview_url: string | null;
  back_preview_url: string | null;
  preview_images: string[];
  status: TemplateStatusRES;
  is_active: boolean;
  registrant: TemplateDetailRegistrantRES;
  created_at: string;
  updated_at: string;
  web_editor_id: number | null;
  web_editor: WebEditorRES | null;
  size_option_id: number | null;
}

export interface TemplateExportExcelRES {
  id: number;
  user_id: number;
  module: string;
  file_name: string;
  file_path: string | null;
  status: string;
  filters: object | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateCopyPreviewDataRES {
  template_no: number;
  template_id: number;
  customer: string | null;
  title: string;
  default_copy_title: string;
  default_copy_layers: boolean;
}

export interface TemplateDetail extends Template {
  editor_size_ids: number[];
}

export type TemplateListRESP = NestedPaginationResponse<{ templates: Template[] }>;
export type TemplateDetailRESP = BaseResponse<{ template: TemplateDetail }>;
export type TemplateExportRESP = BaseResponse<{ history: TemplateExportExcelRES }>;
export type TemplateExportProgressResultRESP = BaseResponse<{ history: TemplateExportExcelRES }>;
export type TemplateCopyPreviewRESP = BaseResponse<TemplateCopyPreviewDataRES>;
