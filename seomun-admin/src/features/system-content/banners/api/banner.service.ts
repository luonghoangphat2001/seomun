import { format } from 'date-fns';

import { ExposureStatus } from '@/enums';

import type { BannerFormValues } from '../schemas';
import type { BannerPayload } from './banner.request';
import type { Banner } from './banner.response';

export function toBannerFormValues(b?: Banner): BannerFormValues {
  return b
    ? {
        name: b.name,
        image_path: b.image_path,
        image_path_mobile: b.image_path_mobile ?? '',
        link_url: b.link_url ?? undefined,
        exposure_location: b.exposure_location,
        exposure_target:
          b.exposure_target === 'all'
            ? 'all'
            : Array.isArray(b.exposure_target) && b.exposure_target.length > 0
              ? String(b.exposure_target[0])
              : undefined,
        status: b.status.value,
        sort_order: b.sort_order ? String(b.sort_order) : undefined,
        exposure_start_date: b.exposure_start_date ? new Date(b.exposure_start_date) : null,
        exposure_end_date: b.exposure_end_date ? new Date(b.exposure_end_date) : null,
      }
    : {
        name: '',
        image_path: '',
        image_path_mobile: '',
        exposure_location: 'main',
        status: ExposureStatus.EXPOSED,
      };
}

export function toBannerPayload(values: BannerFormValues): BannerPayload {
  return {
    name: values.name,
    image_path: values.image_path,
    image_path_mobile: values.image_path_mobile ?? '',
    link_url: values.link_url ?? '',
    exposure_location: 'main',
    exposure_target: values.exposure_target ?? 'all',
    status: values.status,
    sort_order: values.sort_order ? Number(values.sort_order) : 0,
    exposure_start_date: values.exposure_start_date ? format(values.exposure_start_date, 'yyyy-MM-dd') : '',
    exposure_end_date: values.exposure_end_date ? format(values.exposure_end_date, 'yyyy-MM-dd') : '',
  };
}
