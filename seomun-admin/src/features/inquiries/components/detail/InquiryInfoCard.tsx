import { useTranslation } from 'react-i18next';

import { Separator } from '@/components/ui/separator';
import { InquiryStatusTag } from '../../components/tags';
import type { InquiryDetailDTO } from '../../types';
import { formatLocalDateTimeShort } from '@/utils/format-date';

export function InquiryInfoCard({ data }: { data: InquiryDetailDTO }) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;

  return (
    <section className='bg-card rounded-xl border'>
      <div className='px-6 py-4'>
        <h2 className='text-sm font-semibold'>{t('page.inquiries.detail.inquiry_info')}</h2>
      </div>
      <Separator />
      <div className='space-y-3 p-6'>
        <Info label={t('page.inquiries.detail.customer')} value={data.customer_name} />
        <Info label={t('page.inquiries.detail.inquirer')} value={data.inquirer_name} />
        <Info label={t('page.inquiries.detail.email')} value={data.inquirer_email} />
        <Info label={t('page.inquiries.detail.phone')} value={data.inquirer_phone} />
        {data.inquirer_department && <Info label={t('page.inquiries.detail.department')} value={data.inquirer_department} />}
        <Info label={t('page.inquiries.detail.registration_date')} value={formatLocalDateTimeShort(data.created_at)} />
        <Info label={t('page.inquiries.detail.person_in_charge')} value={data.assigned_to?.name ?? '-'} />
        <div className='flex items-center justify-between gap-3'>
          <span className='text-muted-foreground text-sm'>{t('page.inquiries.detail.status')}</span>
          <InquiryStatusTag value={data.status} />
        </div>
        {data.related_order_number && <Info label={t('page.inquiries.detail.order')} value={data.related_order_number} />}
        {data.related_design_draft_id && <Info label={t('page.inquiries.detail.design_draft')} value={data.related_design_draft_id} />}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start justify-between gap-3 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium'>{value}</span>
    </div>
  );
}
