export enum TemplateSortField {
  NAME = 'name',
  IS_ACTIVE = 'is_active',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export enum TemplateExportExcelType {
  ALL = 'ALL',
  CURRENT_PAGE = 'CURRENT_PAGE',
  SELECTED = 'SELECTED',
}

export enum Unit {
  MM = 'mm',
}

export enum Side {
  FRONT = 'front',
  BACK = 'back',
}

export enum LayerType {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
}

export enum ShapeType {
  RECTANGLE = 'rectangle',
  ROUNDED_RECTANGLE = 'rounded_rectangle',
  CIRCLE = 'circle',
  TRIANGLE = 'triangle',
  TRIANGLE_DOWN = 'triangle_down',
  DIAMOND = 'diamond',
  STAR_5 = 'star_5',
  STAR_4 = 'star_4',
  STAR_6 = 'star_6',
  BURST_12 = 'burst_12',
  SCALLOP_1 = 'scallop_1',
  SCALLOP_2 = 'scallop_2',
  // Legacy — not offered in the picker; kept so pre-existing templates still render.
  ELLIPSE = 'ellipse',
  LINE = 'line',
  POLYGON = 'polygon',
}

const CENTER_ANCHORED_SHAPES: readonly ShapeType[] = [
  ShapeType.CIRCLE,
  ShapeType.TRIANGLE,
  ShapeType.TRIANGLE_DOWN,
  ShapeType.DIAMOND,
  ShapeType.STAR_5,
  ShapeType.STAR_4,
  ShapeType.STAR_6,
  ShapeType.BURST_12,
  ShapeType.SCALLOP_1,
  ShapeType.SCALLOP_2,
];

/**
 * True for shapes stored as their centre point (converted to/from the admin's
 * top-left box position at the API boundary — see template.service.ts) so the
 * user editor, which anchors these at their centre, renders an identical result.
 */
export function isCenterAnchoredShape(shapeType: ShapeType): boolean {
  return CENTER_ANCHORED_SHAPES.includes(shapeType);
}

export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

export enum FontWeight {
  REGULAR = 'regular',
  MEDIUM = 'medium',
  BOLD = 'bold',
  NORMAL400 = '400',
  BOLD700 = '700',
}

export enum StatusValue {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum TemplateType {
  NO_FOLD = 'no-fold',
  TWO_FOLD = '2-fold',
  THREE_FOLD = '3-fold',
  FOUR_FOLD = '4-fold',
}

export enum TemplateSide {
  SINGLE = 'single',
  DOUBLE = 'double',
}
