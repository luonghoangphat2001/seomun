export enum DesignSide {
  FRONT = 'front',
  BACK = 'back',
}

export enum DesignType {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  BACKGROUND = 'background',
}

export enum DesignFontWeight {
  REGULAR = 'regular',
  MEDIUM = 'medium',
  BOLD = 'bold',
}

export enum DesignTextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

export type DesignShapeType =
  | 'rectangle'
  | 'rounded_rectangle'
  | 'circle'
  | 'triangle'
  | 'triangle_down'
  | 'diamond'
  | 'star_5'
  | 'star_4'
  | 'star_6'
  | 'burst_12'
  | 'scallop_1'
  | 'scallop_2';

export enum DesignTemplateType {
  NO_FOLD = 'no-fold',
  TWO_FOLD = '2-fold',
  THREE_FOLD = '3-fold',
  FOUR_FOLD = '4-fold',
}

export enum DesignTemplateSide {
  SINGLE = 'single',
  DOUBLE = 'double',
}
