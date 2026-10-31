import type { SelectedFile } from '@/components/shared/app-file-library-select/type';

export function parseAccepted(accepted: string): string[] {
  return accepted
    .split(',')
    .map((ext) => ext.trim().toLowerCase().replace(/^\./, ''))
    .filter(Boolean);
}

export function matchesAccepted(name: string, extensions: string[]): boolean {
  const lower = name.toLowerCase();
  return extensions.some((ext) => lower.endsWith(`.${ext}`));
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  const KB = 1024;
  const MB = KB * 1024;
  if (bytes >= MB) {
    const mb = bytes / MB;
    return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
  }
  if (bytes >= KB) {
    const kb = bytes / KB;
    return `${kb >= 10 ? Math.round(kb) : kb.toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

export function guessMimeFromUrl(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'pdf') return 'application/pdf';
  return '';
}

export function placeholderFromUrl(url: string, size = 0): SelectedFile {
  return {
    url,
    path: '',
    name: url.split('/').pop() ?? url,
    mime_type: guessMimeFromUrl(url),
    size,
  };
}

export function toSelectedFile(file: { url: string; path: string; name: string; mime_type: string; size: number }): SelectedFile {
  return {
    url: file.url,
    path: file.path,
    name: file.name,
    mime_type: file.mime_type,
    size: file.size,
  };
}
