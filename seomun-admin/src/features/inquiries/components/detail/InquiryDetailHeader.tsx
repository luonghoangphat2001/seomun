import { ArrowLeft, CalendarPlus, Hash, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { InquiryStatusTag, InquiryTypeTag } from '../../components/tags';
import { InquiryContent } from './InquiryContent';
import type { InquiryDetailDTO } from '../../types';
import { formatLocalDateTimeShort } from '@/utils/format-date';

type InquiryDetailHeaderProps = {
  data: InquiryDetailDTO;
  onBack: () => void;
  onAssignManager: () => void;
  onChangeStatus: () => void;
};

export function InquiryDetailHeader({ data, onBack }: InquiryDetailHeaderProps) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;

  return (
    <section className='bg-card rounded-xl border p-6 shadow-sm'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Button variant='ghost' size='sm' className='gap-2' onClick={onBack}>
          <ArrowLeft className='size-4' /> {t('page.inquiries.actions.back_to_list')}
        </Button>
        {/* <div className='flex flex-wrap gap-2'>
          <Button variant='outline' size='sm' className='gap-2' onClick={onAssignManager}>
            <UserPlus className='size-4' /> {t('page.inquiries.actions.assign_person')}
          </Button>
          <Button variant='outline' size='sm' className='gap-2' onClick={onChangeStatus}>
            <RefreshCw className='size-4' /> {t('page.inquiries.actions.change_status')}
          </Button>
        </div> */}
      </div>
      <div className='min-w-0 space-y-2'>
        <h1 className='text-2xl font-bold'>{data.title}</h1>
        <div className='text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-1 text-sm'>
          <span className='inline-flex items-center gap-1.5'>
            <CalendarPlus className='size-4' aria-hidden='true' />
            {t('page.inquiries.detail.registered_at')}
            <span className='text-foreground font-medium tabular-nums'>{formatLocalDateTimeShort(data.created_at)}</span>
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <History className='size-4' aria-hidden='true' />
            {t('page.inquiries.detail.updated_at')}
            <span className='text-foreground font-medium tabular-nums'>{formatLocalDateTimeShort(data.updated_at)}</span>
          </span>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='bg-muted text-muted-foreground inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums'>
            <Hash className='size-3' aria-hidden='true' />
            {data.inquiry_number}
          </span>
          <span className='bg-border h-4 w-px' aria-hidden='true' />
          <InquiryTypeTag value={data.inquiry_type} />
          <InquiryStatusTag value={data.status} />
        </div>
      </div>

      <Separator className='my-5' />
      <InquiryContent data={data} />
    </section>
  );
}
