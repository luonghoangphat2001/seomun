import { useTranslation } from 'react-i18next';

import { getInquiryStatusLabel, STATUS_STYLES } from '../../constants';
import type { InquiryStatus } from '../../enums';
import { cn } from '@/utils/cn';

export function InquiryStatusTag({ value }: { value: InquiryStatus }) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;

  if (!value) {
    return null;
  }

  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold', STATUS_STYLES[value])}>
      {getInquiryStatusLabel(t, value)}
    </span>
  );
}
