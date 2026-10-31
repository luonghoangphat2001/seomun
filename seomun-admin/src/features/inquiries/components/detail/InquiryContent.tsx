import { Paperclip } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import type { InquiryDetailDTO } from '../../types';
import { formatLocalDateTimeShort } from '@/utils/format-date';
import { downloadFileFromUrl } from '@/utils/download-file';

export function InquiryContent({ data }: { data: InquiryDetailDTO }) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-muted-foreground text-xs font-semibold tracking-wide'>{t('page.inquiries.detail.inquiry_content')}</h2>
        <div className='bg-muted/50 border-primary/40 rounded-r-lg border-l-4 px-4 py-3'>
          <p className='text-foreground text-base leading-7 wrap-break-word whitespace-pre-line'>{data.content}</p>
        </div>
      </div>
      <div className='space-y-2'>
        <h3 className='text-muted-foreground text-xs font-semibold tracking-wide'>{t('page.inquiries.detail.attached_files')}</h3>
        {data.attachments.length ? (
          <div className='space-y-2'>
            {data.attachments.map((attachment) => (
              <div key={attachment.id} className='flex items-center justify-between gap-3 rounded-lg border px-3 py-2'>
                <div className='flex min-w-0 items-center gap-2'>
                  <Paperclip className='text-muted-foreground size-4 shrink-0' />
                  <div className='min-w-0'>
                    <div className='truncate text-sm font-medium'>{attachment.file_name}</div>
                    <div className='text-muted-foreground text-xs'>
                      {Math.round(attachment.file_size / 1024)} KB · {formatLocalDateTimeShort(attachment.uploaded_at)}
                    </div>
                  </div>
                </div>
                <Button variant='link' size='sm' onClick={() => downloadFileFromUrl(attachment.file_url, attachment.file_name)}>
                  {t('page.inquiries.actions.download')}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-muted-foreground text-sm'>{t('page.inquiries.messages.no_attachments')}</div>
        )}
      </div>
    </div>
  );
}
