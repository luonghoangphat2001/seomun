import { ActiveStatus } from '@/enums/common';
import { DesignFontWeight, DesignShapeType, DesignSide, DesignTextAlign, DesignType } from '@/enums/design';

export type DesignLayerStyle = {
  font_family: string;
  font_size: number;
  font_weight: DesignFontWeight;
  line_height: number;
  letter_spacing: number;
  color: string;
  fill_image_url: string;
  align: DesignTextAlign;
  stroke_color: string;
  stroke_width: number;
  opacity: number;
  shadow_color: string;
  shadow_blur: number;
  shadow_offset_x: number;
  shadow_offset_y: number;
  shadow_opacity: number;
};

export type DesignLayer = {
  id: string;
  type: DesignType;
  side: DesignSide;
  field_key: string;
  default_value: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  style: DesignLayerStyle;
  label: string;
  image_url?: string;
  shape_type: DesignShapeType;
  locked: boolean;
  polygon_sides: number;
  note: string;
};

export type DesignTemplateLayoutConfig = {
  version: number;
  page: {
    width: number;
    height: number;
    unit: string;
  };
  background: {
    back_image_url: string | null;
    front_image_url: string | null;
    front_color: string | null;
    back_color: string | null;
  };
  layers: DesignLayer[];
};

export type DesignWebEditor = {
  id: number;
  name: string;
  type: string;
  width: number;
  height: number;
  unit: string;
  dpi: number;
  bleed: number;
  safe_area: number;
  config_json: {
    side: string;
  };
  status: { value: ActiveStatus };
  created_at: string;
  updated_at: string;
};
