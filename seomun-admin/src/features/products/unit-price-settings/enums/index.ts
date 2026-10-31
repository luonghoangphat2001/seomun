// ========== Paper Unit Price Enums ==========

export enum PaperPriceSortField {
  PAPER_ID = 'paper_id',
  SUPPLY_PRICE = 'supply_price',
  COST = 'cost',
  CREATED_AT = 'created_at',
}

export enum PaperSizeDivisionCode {
  NATIONAL_FULL = 'NATIONAL_FULL',
  NATIONAL_2 = 'NATIONAL_2',
  NATIONAL_4 = 'NATIONAL_4',
  NATIONAL_8 = 'NATIONAL_8',
  NATIONAL_16 = 'NATIONAL_16',
  SIZE_46_FULL = 'SIZE_46_FULL',
  SIZE_46_2 = 'SIZE_46_2',
  SIZE_46_4 = 'SIZE_46_4',
  SIZE_46_8 = 'SIZE_46_8',
  SIZE_46_16 = 'SIZE_46_16',
  SMALL_NATIONAL_FULL = 'SMALL_NATIONAL_FULL',
  SMALL_NATIONAL_2 = 'SMALL_NATIONAL_2',
  SMALL_NATIONAL_4 = 'SMALL_NATIONAL_4',
}

// ========== Printing Unit Price Enums ==========

export enum PrintingMachineType {
  IX3200 = 'IX3200',
  P1350 = 'P1350',
  P140 = 'P140',
}

export enum BookPrintingSizeType {
  TYPE_A = 'TYPE_A',
  TYPE_B = 'TYPE_B',
  TYPE_C = 'TYPE_C',
  A4 = 'A4',
  A5 = 'A5',
  B5 = 'B5',
  NATION4 = 'nation_4',
  NATION8 = 'nation_8',
  NATION16 = 'nation_16',
}

export enum PrintSideType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
}

export enum BookPrintingType {
  BOOKLET_COVER = 'BOOKLET_COVER',
  BOOKLET_INNER = 'BOOKLET_INNER',
}

// ========== Post Processing Unit Price Enums ==========

export enum PostProcessingSizeType {
  NATIONAL_4 = 'NATIONAL_4',
  A3 = 'A3',
  A4 = 'A4',
  A5 = 'A5',
  A6 = 'A6',
}
