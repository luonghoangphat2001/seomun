import type { PaginationRequest, SortRequest } from '@/types/api';

import type {
  FontWeight,
  LayerType,
  ShapeType,
  Side,
  StatusValue,
  TemplateExportExcelType,
  TemplateSide,
  TemplateSortField,
  TemplateType,
  TextAlign,
  Unit,
} from '../enums';

export interface TemplateListREQ extends PaginationRequest, SortRequest<TemplateSortField> {
  template_name?: string;
  specification?: string;
  status?: StatusValue;
  registrant?: string;
  last_modified_from?: string;
  last_modified_to?: string;
}

export interface TemplateExportExcelREQ extends SortRequest<TemplateSortField> {
  export_type: TemplateExportExcelType;
  selected_ids?: number[];
  current_page?: number;
  per_page?: number;
  template_name?: string;
  specification?: string;
  status?: StatusValue;
  registrant?: string;
  last_modified_from?: string;
  last_modified_to?: string;
}

export interface TemplateCopyREQ {
  copy_title: string;
  copy_layers: boolean;
}

export interface TemplateWriteREQ {
  name: string;
  web_editor_id: number;
  type: TemplateType;
  side: TemplateSide;
  size_option_id: number;
  specifications: Record<string, unknown>;

  file_path: string;

  font_set: Record<string, unknown>;
  color_set: Record<string, unknown>;
  spot_color: Record<string, unknown>;

  layout_config: CreateLayoutConfig;

  editor_permission: Record<string, unknown>;

  front_preview_url: string;
  back_preview_url: string;
  preview_images: string[];

  is_active: boolean;
}

export interface CreateLayoutConfig {
  version: number;
  page: CreatePageConfig;
  background: CreateBackground;
  layers: CreateLayer[];
}

export interface CreatePageConfig {
  width: number;
  height: number;
  unit: Unit;
}

export interface CreateBackground {
  front_image_url: string;
  back_image_url: string;
  front_color: string;
  back_color: string;
}

export interface CreateLayer {
  id: string;
  type: LayerType;
  side: Side;
  field_key: string;
  default_value: string;
  image_url: string;
  shape_type: ShapeType;
  polygon_sides: number;
  locked: boolean;
  visible: boolean;

  position: Position;
  size: Size;
  rotation: number;
  style: CreateLayerStyle;
}

export interface CreateLayerStyle {
  font_family: string;
  font_size: number;
  font_weight: FontWeight;
  line_height: number;
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

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
