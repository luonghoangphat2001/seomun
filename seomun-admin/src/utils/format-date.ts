import { format, isValid, parseISO } from 'date-fns';

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseDateOnly(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

export function formatDateOnly(value?: Date | null): string | undefined {
  if (!value || !isValid(value)) {
    return undefined;
  }

  return format(value, 'yyyy-MM-dd');
}

export function subtractDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() - days);
  return next;
}

export function formatKoreanDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * Parses a server timestamp for display in the viewer's own timezone.
 *
 * parseISO is used first because it keeps date-only strings ('2026-08-14') on their own calendar
 * day; `new Date()` would read those as UTC midnight and shift them back a day west of GMT.
 * Values carrying a time or offset are parsed as a real instant, so they do convert to local.
 */
function parseTimestamp(value: string) {
  const parsed = parseISO(value);
  if (isValid(parsed)) return parsed;

  // Some endpoints send 'YYYY-MM-DD HH:mm:ss', which is not ISO; Date reads it as local wall-clock.
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

/** Local calendar date, e.g. 2026-08-14. */
export function formatLocalDate(value?: string | null) {
  if (!value) return '-';

  const parsed = parseTimestamp(value);
  return parsed ? format(parsed, 'yyyy-MM-dd') : value;
}

/** Local date and time, e.g. 2026-09-17 10:39:22. */
export function formatLocalDateTime(value?: string | null) {
  if (!value) return '-';

  const parsed = parseTimestamp(value);
  return parsed ? format(parsed, 'yyyy-MM-dd HH:mm:ss') : value;
}

/** Local date and time without seconds, e.g. 2026-09-17 10:39. */
export function formatLocalDateTimeShort(value?: string | null) {
  if (!value) return '-';

  const parsed = parseTimestamp(value);
  return parsed ? format(parsed, 'yyyy-MM-dd HH:mm') : value;
}
