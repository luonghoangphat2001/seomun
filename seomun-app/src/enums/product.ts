export enum PrintOption {
  AS_IS = 'as_is',
  SKIP_PROOFREADING = 'skip_proofreading',
}

export enum PostProcessingCode {
  Coated = 'coated', //코팅
  Oshi = 'oshi', //오시
  Rounding = 'rounding', //라운딩
  Foundation = 'foundation', //박(앞면)
  Grounding = 'grounding', //형압
  Perforation = 'perforation', //에폭시
  Numbering = 'numbering', // 투명엠보싱
  Domusong = 'domusong', // 엠보싱박
}

export enum ProductCommonOption {
  SIZE = 'size',
  SUBJECT_MATTER = 'subject_matter',
  PAPER = 'paper',
  COVER_PAPER = 'cover_paper',
  INNER_PAPER = 'inner_paper',
  ADDITIONAL_PAPER = 'additional_paper',
  COLORED_PAPER_1 = 'colored_paper_1',
  COLORED_PAPER_2 = 'colored_paper_2',
  FLYLEAF_PAPER = 'flyleaf_paper',
  PRINTED_SIDE = 'printed_side',
  PRINTED_COLOR_FSIDE = 'printed_color_fside',
  PRINTED_COLOR_BSIDE = 'printed_color_bside',
  PRINTED_COVER_SIDE = 'printed_cover_side',
  PRINTED_COLOR_COVER_FSIDE = 'printed_color_cover_fside',
  PRINTED_COLOR_COVER_BSIDE = 'printed_color_cover_bside',
  PRINTED_INNER_SIDE = 'printed_inner_side',
  PRINTED_COLOR_INNER_FSIDE = 'printed_color_inner_fside',
  PRINTED_COLOR_INNER_BSIDE = 'printed_color_inner_bside',
}

export enum ProductSpineSide {
  SINGLE = 'single',
  DOUBLE = 'double',
}
