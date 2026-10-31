import { format } from 'date-fns';

import { ExposureStatus } from '@/enums';

import { GuideType } from '../enums';
import type { GuideFormValues } from '../schemas';
import type { GuidePayload } from './guide.request';
import type { Guide } from './guide.response';

const toDateStr = (date: Date | null | undefined): string | null => (date ? format(date, 'yyyy-MM-dd') : null);

export function toGuideFormValues(guide?: Guide): GuideFormValues {
  return {
    type: (guide?.type as GuideType) ?? GuideType.COATED,
    title: guide?.title ?? '',
    content: guide?.content ?? '',
    attachments: Array.isArray(guide?.attachments) ? guide.attachments.map((a) => ({ url: a.url, name: a.name, size: a.size })) : undefined,
    exposure_status: guide?.exposure_status?.value ?? ExposureStatus.EXPOSED,
    exposure_target: guide?.exposure_target ?? undefined,
    exposure_start_date: guide?.exposure_start_date ? new Date(guide.exposure_start_date) : null,
    exposure_end_date: guide?.exposure_end_date ? new Date(guide.exposure_end_date) : null,
  };
}

export function toGuidePayload(values: GuideFormValues): GuidePayload {
  return {
    type: values.type,
    title: values.title,
    content: values.content,
    attachments: Array.isArray(values.attachments)
      ? values.attachments.map((a) => ({ key: a.url, name: a.name, url: a.url, size: a.size ?? 0 }))
      : [],
    exposure_status: values.exposure_status,
    exposure_target: values.exposure_target ?? null,
    exposure_start_date: toDateStr(values.exposure_start_date),
    exposure_end_date: toDateStr(values.exposure_end_date),
  };
}
