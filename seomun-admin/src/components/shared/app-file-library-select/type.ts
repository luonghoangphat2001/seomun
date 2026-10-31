export type FileKind = 'all' | 'image' | 'pdf' | 'document';

export type SelectedFile = {
  url: string;
  path: string;
  name: string;
  mime_type: string;
  size: number;
};

export const DEFAULT_PER_PAGE = 20;
export const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

export const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
export const PDF_EXTS = ['pdf'];
export const DOC_EXTS = ['doc', 'docx', 'txt'];
