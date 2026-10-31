import { z } from 'zod';

import { SortOrder } from '@/enums';

import { FontWeight, LayerType, ShapeType, Side, StatusValue, TemplateSide, TemplateSortField, TemplateType, TextAlign, Unit } from '../enums';

export const templateListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.nativeEnum(TemplateSortField).optional().catch(undefined),
  sort_order: z.enum([SortOrder.ASC, SortOrder.DESC]).optional().catch(undefined),
  template_name: z.coerce.string().optional().catch(undefined),
  specification: z.coerce.string().optional().catch(undefined),
  status: z.nativeEnum(StatusValue).optional().catch(undefined),
  registrant: z.coerce.string().optional().catch(undefined),
  last_modified_from: z.coerce.string().optional().catch(undefined),
  last_modified_to: z.coerce.string().optional().catch(undefined),
});

export type TemplateListSearch = z.infer<typeof templateListSearchSchema>;

export type TemplateSearchFilterValues = {
  template_name: string;
  specification: string;
  status?: StatusValue;
  registrant: string;
  modified_from: Date | null;
  modified_to: Date | null;
};

export const templateDetailEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  is_active: z.boolean(),
  allow_text_edit: z.boolean(),
  allow_image_replace: z.boolean(),
  spot_color_enabled: z.boolean(),
});

export type TemplateDetailEditFormValues = z.infer<typeof templateDetailEditSchema>;

export const templateWriteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  web_editor_id: z.coerce.number().int().positive('Web editor is required'),
  is_active: z.boolean(),
});

export type TemplateWriteFormValues = z.infer<typeof templateWriteSchema>;

export const TEMPLATE_WRITE_DEFAULT_VALUES: TemplateWriteFormValues = {
  name: '',
  web_editor_id: 0,
  is_active: true,
};

// === Layer form schema (mirrors CreateLayer / CreateLayerStyle) ===

export const layerFormSchema = z.object({
  layer_id: z.string(),
  type: z.nativeEnum(LayerType),
  side: z.nativeEnum(Side),
  field_key: z.string().min(1, 'Field key is required'),
  default_value: z.string(),
  image_url: z.string(),
  shape_type: z.nativeEnum(ShapeType),
  polygon_sides: z.coerce.number().int().min(3).max(12).default(6),
  position_x: z.coerce.number(),
  position_y: z.coerce.number(),
  width: z.coerce.number().min(1, 'Must be > 0'),
  height: z.coerce.number().min(1, 'Must be > 0'),
  rotation: z.coerce.number().default(0),
  font_family: z.string(),
  font_size: z.coerce.number().min(1, 'Size must be ≥ 1'),
  font_weight: z.nativeEnum(FontWeight),
  line_height: z.coerce.number().min(0, 'Line height must be ≥ 0'),
  color: z.string(),
  fill_image_url: z.string(),
  align: z.nativeEnum(TextAlign),
  stroke_color: z.string(),
  stroke_width: z.coerce.number().min(0),
  locked: z.boolean().default(false),
  visible: z.boolean().default(true),
  opacity: z.coerce.number().min(0).max(1).default(1),
  shadow_color: z.string(),
  shadow_blur: z.coerce.number().min(0).default(0),
  shadow_offset_x: z.coerce.number().default(0),
  shadow_offset_y: z.coerce.number().default(0),
  shadow_opacity: z.coerce.number().min(0).max(1).default(1),
});

export type LayerFormValues = z.infer<typeof layerFormSchema>;

export const createTemplateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  web_editor_id: z.coerce.number().int().positive('Web editor is required'),
  size_option_id: z.coerce.number().int().positive('Size option is required'),
  type: z.enum(TemplateType).default(TemplateType.NO_FOLD),
  side: z.enum(TemplateSide).default(TemplateSide.SINGLE),
  is_active: z.boolean(),
  allow_text_edit: z.boolean(),
  allow_image_replace: z.boolean(),
  spot_color_enabled: z.boolean(),
  page_width: z.coerce.number().positive('Width is required'),
  page_height: z.coerce.number().positive('Height is required'),
  page_unit: z.enum(Unit),
  background_front: z.string(),
  background_back: z.string(),
  background_color_front: z.string(),
  background_color_back: z.string(),
  layers: z.array(layerFormSchema),
});

export type CreateTemplateFormValues = z.infer<typeof createTemplateFormSchema>;

export const CREATE_TEMPLATE_DEFAULT_VALUES: CreateTemplateFormValues = {
  name: '',
  web_editor_id: 0,
  size_option_id: 0,
  type: TemplateType.NO_FOLD,
  side: TemplateSide.SINGLE,
  is_active: false,
  allow_text_edit: true,
  allow_image_replace: true,
  spot_color_enabled: true,
  page_width: 90,
  page_height: 50,
  page_unit: Unit.MM,
  background_front: '',
  background_back: '',
  background_color_front: '',
  background_color_back: '',
  layers: [],
};

export const TEMPLATE_SEARCH_FILTER_DEFAULT_VALUES: TemplateSearchFilterValues = {
  template_name: '',
  specification: '',
  status: undefined,
  registrant: '',
  modified_from: null,
  modified_to: null,
};
