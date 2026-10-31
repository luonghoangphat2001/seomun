import type { ProductQuoteREQ } from '@/apis/product/product.request';

export interface Dimension {
  width: number;
  height: number;
}

export interface ProductOrderConfig {
  size: string;
  subjectMatter: string;
  isDirectInput: boolean;
  cuttingSize: Dimension;
  editingSize: Dimension;
  safeSize: Dimension;
  paperType: string;
  paperColor: string;
  paperWeight: string;
  bookPaperSelections?: Record<string, PaperSelection>;
  bookOptionalPaperGroups?: string[];
  bookPaperCounts?: Record<string, number>;
  printColorTotal: string;
  printColorFront: string;
  printColorRear: string;
  bookPrintSelections?: Record<string, PrintColorSelection>;
  quantity: number;
  count: number;
  postProcessing: string[];
  postProcessingConfigs?: Record<string, string>;
  designType: 'web-editor' | 'design-request';
}

export interface PaperSelection {
  type: string;
  color: string;
  weight: string;
}

export interface PrintColorSelection {
  side: string;
  front: string;
  back: string;
}

export interface ProductSelectedOptions {
  productId: number;
  designGroupId: number;
  quoteRequest: ProductQuoteREQ;
  input: ProductOrderConfig;
}
