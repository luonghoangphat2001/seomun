import type { ImageFormValues } from '../schemas';
import type { ImageRESP } from './image.response';

export function toImageFormValues(image?: ImageRESP): ImageFormValues {
  return {
    url: image?.url ?? '',
    type: image?.type ?? '',
    path: image?.path ?? '',
    mime_type: image?.mime_type ?? '',
  };
}
