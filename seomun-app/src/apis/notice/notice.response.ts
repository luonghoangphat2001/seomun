import { FileType } from '@/types';

export type NoticeRESP = {
  id: number;
  title: string;
  content: string;
  type: string;
  attachments: FileType[];
  is_pinned: boolean;
  is_new: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
};

export type NoticeResponse = {
  notices: NoticeRESP[];
};

export type NoticeDetailResponse = {
  notice: NoticeRESP;
};
