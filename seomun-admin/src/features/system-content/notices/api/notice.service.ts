import { ExposureStatus } from '@/enums';
import { toDateTimeLocal } from '@/utils/helper/dateTimeLocal.helper';

import type { NoticeFormValues } from '@/features/system-content/notices/schemas';
import type { NoticeType } from '../enums';
import type { Notice } from './notice.response';
import type { NoticePayload } from './notice.request';

export const toNoticePayload = (values: NoticeFormValues): NoticePayload => ({
  title: values.title,
  content: values.content,
  type: values.type,
  attachments: Array.isArray(values.attachments) ? values.attachments.map((a) => ({ key: a.url, name: a.name, url: a.url, size: a.size ?? 0 })) : [],
  is_pinned: values.is_pinned,
  exposure_status: values.exposure_status,
  exposure_target: undefined,
  exposure_location: values.exposure_location ?? 'main',
  exposure_start_date: values.exposure_start_date,
  exposure_end_date: values.exposure_end_date,
});

export const toFormValues = (n?: Notice): NoticeFormValues =>
  n
    ? {
        title: n.title,
        content: n.content,
        type: (n.type as NoticeType | null) ?? undefined,
        attachments: Array.isArray(n.attachments) ? n.attachments.map((a) => ({ url: a.url, name: a.name, size: a.size })) : undefined,
        is_pinned: n.is_pinned,
        exposure_status: n.exposure_status.value as ExposureStatus,
        exposure_location: 'main',
        exposure_start_date: toDateTimeLocal(n.exposure_start_date),
        exposure_end_date: toDateTimeLocal(n.exposure_end_date),
      }
    : { title: '', content: '', is_pinned: false, exposure_status: ExposureStatus.EXPOSED, exposure_location: 'main' };
