import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useInquiryMemos } from '../../api';
import { formatLocalDateTimeShort } from '@/utils/format-date';

export function InternalMemoSection({ inquiryId, onCreate }: { inquiryId: string; onCreate: () => void }) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const { data, isLoading } = useInquiryMemos(inquiryId);
  const memos = data ?? [];

  return (
    <section className='bg-card rounded-xl border'>
      <div className='flex items-center justify-between px-6 py-4'>
        <h2 className='text-sm font-semibold'>{t('page.inquiries.detail.internal_memos')}</h2>
        <Button variant='outline' size='sm' className='gap-2' onClick={onCreate}>
          <Plus className='size-4' /> {t('page.inquiries.actions.add_memo')}
        </Button>
      </div>
      <Separator />
      <div className='space-y-3 p-6'>
        {isLoading ? <div className='text-muted-foreground text-sm'>{t('page.inquiries.messages.loading_memos')}</div> : null}
        {!isLoading && memos.length === 0 ? <div className='text-muted-foreground text-sm'>{t('page.inquiries.messages.no_memos')}</div> : null}
        {memos.map((memo) => (
          <div key={memo.id} className='rounded-lg border px-4 py-3 text-sm'>
            <div className='whitespace-pre-line'>{memo.content}</div>
            <div className='text-muted-foreground mt-2 text-xs'>
              {memo.created_by.name} · {formatLocalDateTimeShort(memo.created_at)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
