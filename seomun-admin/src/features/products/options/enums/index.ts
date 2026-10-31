export enum ErpOptionGroupType {
  DEFAULT = 'DEFAULT',
  STANDARD = 'STANDARD',
  PRINTED_COLOR = 'PRINTED_COLOR',
  PAPER = 'PAPER',
  POST_PROCESSING = 'POST_PROCESSING',
}

export enum ErpOptionDisplayType {
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
}

export enum ErpOptionGroupSortField {
  CODE = 'code',
  LABEL = 'label',
  TYPE = 'type',
  IS_REQUIRED = 'is_required',
  DISPLAY_TYPE = 'display_type',
  CREATED_AT = 'created_at',
}

export enum ErpOptionSortField {
  CODE = 'code',
  LABEL = 'label',
  VALUE = 'value',
  ADDITIONAL_PRICE = 'additional_price',
  SORT_ORDER = 'sort_order',
  STATUS = 'status',
  CREATED_AT = 'created_at',
}

export enum ErpExportType {
  ALL = 'ALL',
  CURRENT_PAGE = 'CURRENT_PAGE',
  SELECTED = 'SELECTED',
}

export enum PaperCategory {
  GENERAL_PAPER = 'GENERAL_PAPER',
  SPECIALTY_PAPER = 'SPECIALTY_PAPER',
  HIGH_QUALITY_PAPER = 'HIGH_QUALITY_PAPER',
  STICKER_PAPER = 'STICKER_PAPER',
  PAPERBOARD = 'PAPERBOARD',
  BANNER = 'BANNER',
  PLASTIC = 'PLASTIC',
  COLORED_PAPER = 'COLORED_PAPER',
}

export enum PaperStatusValue {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
}

export enum ErpOptionGroupCode {
  SIZE = 'size',

  PAPER = 'paper',
  PAPER_COVER = 'paper_cover',
  PAPER_INSIDE = 'paper_inside',

  PAPER_TYPE = 'paper_type',
  PAPER_COLOR = 'paper_color',
  PAPER_WEIGHT = 'paper_weight',

  PRINTED_SIDE = 'printed_side',
  PRINTED_COVER_SIDE = 'printed_cover_side',
  PRINTED_INNER_SIDE = 'printed_inner_side',

  PRINTED_COLOR_FSIDE = 'printed_color_fside',
  PRINTED_COLOR_BSIDE = 'printed_color_bside',

  PRINTED_COLOR_COVER_SIDE = 'printed_color_cover_side',
  PRINTED_COLOR_INNER_SIDE = 'printed_color_inner_side',

  COATED = 'coated',
  OSHI = 'oshi',
  ROUNDING = 'rounding',
  PERFORATION = 'perforation',
  GROUNDING = 'grounding',
  NUMBERING = 'numbering',
  DOMUSONG = 'domusong',
  FOUNDATION = 'foundation',
}
