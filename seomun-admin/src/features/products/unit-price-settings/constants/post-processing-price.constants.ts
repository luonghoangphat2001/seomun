import { PostProcessingSizeType } from '../enums';
import { createEnumHelpers } from './printing-price.constants';

const POST_PROCESSING_SIZE_TYPE_LABELS: Record<PostProcessingSizeType, string> = {
  [PostProcessingSizeType.NATIONAL_4]: 'page.products.unit_price_settings.post_processing_price.size_type.NATIONAL_4',
  [PostProcessingSizeType.A3]: 'page.products.unit_price_settings.post_processing_price.size_type.A3',
  [PostProcessingSizeType.A4]: 'page.products.unit_price_settings.post_processing_price.size_type.A4',
  [PostProcessingSizeType.A5]: 'page.products.unit_price_settings.post_processing_price.size_type.A5',
  [PostProcessingSizeType.A6]: 'page.products.unit_price_settings.post_processing_price.size_type.A6',
};

const POST_PROCESSING_SIZE_TYPE_FALLBACK_LABELS: Record<PostProcessingSizeType, string> = {
  [PostProcessingSizeType.NATIONAL_4]: 'National 4',
  [PostProcessingSizeType.A3]: 'A3',
  [PostProcessingSizeType.A4]: 'A4',
  [PostProcessingSizeType.A5]: 'A5',
  [PostProcessingSizeType.A6]: 'A6',
};

const postProcessingSizeTypeHelpers = createEnumHelpers<PostProcessingSizeType, string>(
  POST_PROCESSING_SIZE_TYPE_LABELS,
  POST_PROCESSING_SIZE_TYPE_FALLBACK_LABELS,
);

export const getPostProcessingSizeTypeLabel = postProcessingSizeTypeHelpers.getLabel;
export const getPostProcessingSizeTypeOptions = postProcessingSizeTypeHelpers.getOptions;
