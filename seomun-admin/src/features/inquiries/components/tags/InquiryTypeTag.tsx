import { useTranslation } from 'react-i18next';

import { getInquiryTypeLabel, INQUIRY_TYPE_STYLES } from '../../constants';
import type { InquiryType } from '../../enums';
import { cn } from '@/utils/cn';

export function InquiryTypeTag({ value }: { value: InquiryType }) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;

  if (!value) {
    return null;
  }

  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold', INQUIRY_TYPE_STYLES[value])}>
      {getInquiryTypeLabel(t, value)}
    </span>
  );
}
