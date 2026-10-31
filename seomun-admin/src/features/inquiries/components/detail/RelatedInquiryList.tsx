import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getRelatedInquiryTypeLabel } from '../../constants';
import { useRelatedInquiries } from '../../api';
import { InquiryStatusTag, InquiryTypeTag } from '../../components/tags';
import { formatLocalDateTimeShort } from '@/utils/format-date';
import { cn } from '@/utils/cn';

export function RelatedInquiryList({ inquiryId }: { inquiryId: string }) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const { data, isLoading } = useRelatedInquiries(inquiryId);
  const relatedInquiries = data ?? [];

  return (
    <section className='bg-card rounded-xl border'>
      <div className='px-6 py-4'>
        <h2 className='text-sm font-semibold'>{t('page.inquiries.detail.related_inquiries')}</h2>
        <p className='text-muted-foreground mt-1 text-xs'>{t('page.inquiries.detail.related_inquiries_hint')}</p>
      </div>
      <Separator />
      <div className='space-y-2 p-4'>
        {isLoading ? <div className='text-muted-foreground p-2 text-sm'>{t('page.inquiries.messages.loading_related')}</div> : null}
        {!isLoading && relatedInquiries.length === 0 ? (
          <div className='text-muted-foreground p-2 text-sm'>{t('page.inquiries.messages.no_related')}</div>
        ) : null}
        {relatedInquiries.map((item) => (
          <Button
            key={item.id}
            variant='ghost'
            asChild
            className={cn(
              'h-auto w-full justify-start rounded-lg border p-3 text-left',
              String(item.id) === inquiryId ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
            )}
          >
            <Link to='/inquiries/$inquiryId' params={{ inquiryId: String(item.id) }}>
              <div className='min-w-0 flex-1 space-y-2'>
                <div className='flex flex-wrap gap-2'>
                  <InquiryTypeTag value={item.inquiry_type} />
                  <InquiryStatusTag value={item.status} />
                </div>
                <div className='truncate text-sm font-semibold'>{item.title}</div>
                <div className='text-muted-foreground text-xs'>
                  {getRelatedInquiryTypeLabel(t, item.relation_type)} · {formatLocalDateTimeShort(item.created_at)}
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
