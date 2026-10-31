import { PostProcessingCode } from '@/enums/product';

export type GuideListREQ = {
  type?: PostProcessingCode;
  per_page?: number;
};
