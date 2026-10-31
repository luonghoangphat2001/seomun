import { format } from 'date-fns';

import { ExposureStatus } from '@/enums';
import type { PopupFormValues } from '../schemas';
import type { PopupPayload } from './popup.request';
import type { Popup } from './popup.response';
import { POPUP_HEIGHT, POPUP_WIDTH } from '../constants';

export function toPopupFormValues(p?: Popup): PopupFormValues {
  return p
    ? {
        name: p.name,
        content: p.content ?? undefined,
        image_path: p.image_path ?? '',
        exposure_location: p.exposure_location ?? null,
        exposure_target:
          p.exposure_target === 'all'
            ? 'all'
            : Array.isArray(p.exposure_target) && p.exposure_target.length > 0
              ? String(p.exposure_target[0])
              : undefined,
        width: p.size_settings?.width ? String(p.size_settings.width) : POPUP_WIDTH,
        height: p.size_settings?.height ? String(p.size_settings.height) : POPUP_HEIGHT,
        status: p.status.value,
        exposure_start_date: p.exposure_start_date ? new Date(p.exposure_start_date) : null,
        exposure_end_date: p.exposure_end_date ? new Date(p.exposure_end_date) : null,
      }
    : {
        name: '',
        image_path: '',
        width: POPUP_WIDTH,
        height: POPUP_HEIGHT,
        status: ExposureStatus.EXPOSED,
      };
}

export function toPopupPayload(values: PopupFormValues): PopupPayload {
  return {
    name: values.name,
    content: values.content || null,
    image_path: values.image_path || null,
    exposure_location: values.exposure_location ?? null,
    exposure_target: values.exposure_target === 'all' ? 'all' : values.exposure_target ? [Number(values.exposure_target)] : null,
    width: Number(values.width),
    height: Number(values.height),
    status: values.status,
    exposure_start_date: values.exposure_start_date ? format(values.exposure_start_date, 'yyyy-MM-dd') : null,
    exposure_end_date: values.exposure_end_date ? format(values.exposure_end_date, 'yyyy-MM-dd') : null,
  };
}
