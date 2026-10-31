import { z } from 'zod';

import { ExposureStatus, SortOrder } from '@/enums';

import { NoticeType } from '../enums';

export type NoticeAttachmentInput = {
  url: string;
  name: string;
  size?: number;
};

export type NoticeFormValues = {
  title: string;
  content: string;
  type?: NoticeType;
  attachments?: NoticeAttachmentInput[];
  is_pinned: boolean;
  exposure_status: ExposureStatus;
  exposure_location?: string;
  exposure_start_date?: string;
  exposure_end_date?: string;
};

export const noticeFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Title must be at most 200 characters.'),
  content: z.string().trim().min(1, 'Content is required.'),
  type: z.enum(NoticeType).optional().catch(undefined),
  attachments: z.array(z.object({ url: z.string(), name: z.string(), size: z.number().optional() })).optional(),
  is_pinned: z.boolean(),
  exposure_status: z.enum(ExposureStatus),
  exposure_location: z.string().default('main'),
  exposure_start_date: z.string().trim().optional(),
  exposure_end_date: z.string().trim().optional(),
});

export const noticeListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(['title', 'author', 'created_at']).optional(),
  sort_order: z.enum(SortOrder).optional(),
  search_term: z.string().optional().catch(undefined),
  author_id: z.string().optional().catch(undefined),
  type: z.enum(NoticeType).optional().catch(undefined),
  exposure_status: z.enum(ExposureStatus).optional().catch(undefined),
  exposure_location: z.string().optional().catch(undefined),
});

export type NoticeListSearch = z.infer<typeof noticeListSearchSchema>;

export type NoticeSearchFilterValues = Omit<NoticeListSearch, 'page' | 'per_page' | 'sort_by' | 'sort_order'>;
