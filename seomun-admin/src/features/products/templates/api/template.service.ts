import { FontWeight, isCenterAnchoredShape, LayerType, ShapeType, Side, TemplateSide, TemplateType, TextAlign, Unit } from '../enums';
import type { CreateTemplateFormValues } from '../schemas';
import type { CreateLayer, TemplateWriteREQ } from './template.request';
import type { TemplateDetail } from './template.response';

export function buildPayload(values: CreateTemplateFormValues): TemplateWriteREQ {
  return {
    name: values.name,
    web_editor_id: values.web_editor_id,
    size_option_id: values.size_option_id,
    type: values.type,
    side: values.side,
    is_active: values.is_active,
    specifications: {},
    file_path: '',
    font_set: {},
    color_set: {},
    spot_color: { enabled: values.spot_color_enabled },
    layout_config: {
      version: 1,
      page: { width: values.page_width, height: values.page_height, unit: values.page_unit },
      background: {
        front_image_url: values.background_front,
        back_image_url: values.background_back,
        front_color: values.background_color_front,
        back_color: values.background_color_back,
      },
      layers: values.layers.map((l): CreateLayer => {
        // In the user editor these shapes anchor at their centre and size by the
        // corner radius (size/√2), except the circle (size/2). Convert the admin's
        // top-left box position → centre and box size → the user's size basis so
        // the user app renders the same shape the admin fits to its box.
        const centered = l.type === LayerType.SHAPE && isCenterAnchoredShape(l.shape_type);
        const sizeFactor = centered && l.shape_type !== ShapeType.CIRCLE ? 1 / Math.SQRT2 : 1;
        return {
          id: l.layer_id,
          type: l.type,
          side: l.side,
          field_key: l.field_key,
          default_value: l.default_value,
          image_url: l.image_url,
          shape_type: l.shape_type,
          polygon_sides: l.polygon_sides,
          locked: l.locked,
          visible: l.visible,
          position: {
            x: centered ? l.position_x + l.width / 2 : l.position_x,
            y: centered ? l.position_y + l.height / 2 : l.position_y,
          },
          size: { width: l.width * sizeFactor, height: l.height * sizeFactor },
          rotation: l.rotation,
          style: {
            font_family: l.font_family,
            font_size: l.font_size,
            font_weight: l.font_weight,
            line_height: l.line_height,
            color: l.color,
            fill_image_url: l.fill_image_url,
            align: l.align,
            stroke_color: l.stroke_color,
            stroke_width: l.stroke_width,
            opacity: l.opacity,
            shadow_color: l.shadow_color,
            shadow_blur: l.shadow_blur,
            shadow_offset_x: l.shadow_offset_x,
            shadow_offset_y: l.shadow_offset_y,
            shadow_opacity: l.shadow_opacity,
          },
        };
      }),
    },
    editor_permission: {
      allow_text_edit: values.allow_text_edit,
      allow_image_replace: values.allow_image_replace,
    },
    front_preview_url: '',
    back_preview_url: '',
    preview_images: [],
  };
}

export function templateToFormValues(t: TemplateDetail): CreateTemplateFormValues {
  return {
    name: t.name ?? '',
    web_editor_id: t.web_editor_id ?? 0,
    size_option_id: t.size_option_id ?? 0,
    type: t.type ?? TemplateType.TWO_FOLD,
    side: t.side ?? TemplateSide.SINGLE,
    is_active: t.is_active ?? false,
    allow_text_edit: t.editor_permission?.allow_text_edit ?? false,
    allow_image_replace: t.editor_permission?.allow_image_replace ?? false,
    spot_color_enabled: t.spot_color?.enabled ?? false,
    page_width: t.layout_config?.page.width ?? 90,
    page_height: t.layout_config?.page.height ?? 50,
    page_unit: (t.layout_config?.page.unit as Unit) ?? Unit.MM,
    background_front: t.layout_config?.background?.front_image_url ?? '',
    background_back: t.layout_config?.background?.back_image_url ?? '',
    background_color_front: t.layout_config?.background?.front_color ?? '',
    background_color_back: t.layout_config?.background?.back_color ?? '',
    layers: (t.layout_config?.layers ?? []).map((l) => {
      const shapeType = (l as { shape_type?: ShapeType }).shape_type ?? ShapeType.RECTANGLE;
      // Reverse the save-time conversion back to the admin's top-left box + box size.
      const centered = l.type === 'shape' && isCenterAnchoredShape(shapeType);
      const sizeFactor = centered && shapeType !== ShapeType.CIRCLE ? Math.SQRT2 : 1;
      const width = (l.size?.width ?? 100) * sizeFactor;
      const height = (l.size?.height ?? 40) * sizeFactor;
      return {
        layer_id: l.id,
        type: (l.type as LayerType) ?? LayerType.TEXT,
        side: (l.side as Side) ?? Side.FRONT,
        field_key: l.field_key ?? '',
        default_value: l.default_value ?? '',
        image_url: (l as { image_url?: string }).image_url ?? '',
        shape_type: shapeType,
        polygon_sides: (l as { polygon_sides?: number }).polygon_sides ?? 6,
        locked: (l as { locked?: boolean }).locked ?? false,
        visible: (l as { visible?: boolean }).visible ?? true,
        position_x: (l.position?.x ?? 0) - (centered ? width / 2 : 0),
        position_y: (l.position?.y ?? 0) - (centered ? height / 2 : 0),
        width,
        height,
        rotation: l.rotation ?? 0,
        font_family: l.style?.font_family ?? '',
        font_size: l.style?.font_size ?? 14,
        font_weight: (l.style?.font_weight as FontWeight) ?? FontWeight.REGULAR,
        line_height: l.style?.line_height ?? 1.4,
        color: l.style?.color ?? '#000000',
        fill_image_url: l.style?.fill_image_url ?? '',
        align: (l.style?.align as TextAlign) ?? TextAlign.LEFT,
        stroke_color: l.style?.stroke_color ?? '',
        stroke_width: l.style?.stroke_width ?? 0,
        opacity: l.style?.opacity ?? 1,
        shadow_color: l.style?.shadow_color ?? '',
        shadow_blur: l.style?.shadow_blur ?? 0,
        shadow_offset_x: l.style?.shadow_offset_x ?? 0,
        shadow_offset_y: l.style?.shadow_offset_y ?? 0,
        shadow_opacity: l.style?.shadow_opacity ?? 1,
      };
    }),
  };
}
