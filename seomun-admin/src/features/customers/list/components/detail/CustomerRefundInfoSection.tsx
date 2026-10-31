import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { Skeleton } from '@/components/ui/skeleton';

import type { MemberDetail } from '../../../types/customer.type';

type CustomerRefundInfoSectionProps = {
  member?: MemberDetail;
  isLoading?: boolean;
};

export function CustomerRefundInfoSection({ member, isLoading }: CustomerRefundInfoSectionProps) {
  const { t } = useTranslation();

  return (
    <section className='rounded-xl border'>
      <div className='border-b px-5 py-4'>
        <h2 className='text-sm font-semibold'>{sectionTitle(t)}</h2>
      </div>
      <div className='p-5'>
        <div className='bg-muted/30 grid gap-4 rounded-lg p-4 sm:grid-cols-2 md:grid-cols-3'>
          {isLoading ? (
            <ValueSkeletons />
          ) : (
            <>
              <ReadOnlyValue label={fieldLabel(t, 'refund_bank', 'Refund Bank')} value={member?.refundBank} />
              <ReadOnlyValue label={fieldLabel(t, 'refund_account_number', 'Refund Account Number')} value={member?.refundAccountNumber} />
              <ReadOnlyValue label={fieldLabel(t, 'refund_account_name', 'Refund Account Holder')} value={member?.refundAccountName} />
              <ReadOnlyValue label={fieldLabel(t, 'virtual_account_provider', 'Virtual Account Provider')} value={member?.virtualAccount?.provider} />
              <ReadOnlyValue
                label={fieldLabel(t, 'virtual_account_number', 'Virtual Account Number')}
                value={member?.virtualAccount?.accountNumber}
              />
              <ReadOnlyValue
                label={fieldLabel(t, 'virtual_account_bank_code', 'Virtual Account Bank Code')}
                value={member?.virtualAccount?.bankCode}
              />
              <ReadOnlyValue
                label={fieldLabel(t, 'virtual_account_customer_name', 'Virtual Account Holder')}
                value={member?.virtualAccount?.customerName}
              />
              <ReadOnlyValue label={fieldLabel(t, 'virtual_account_status', 'Virtual Account Status')} value={member?.virtualAccount?.status} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function sectionTitle(t: TFunction) {
  return String(t('page.customers.detail.sections.refund_info' as never, { defaultValue: 'Refund & Virtual Account Info' } as never));
}

function fieldLabel(t: TFunction, field: string, fallback: string) {
  return String(t(`form.customers.detail.refund_info.fields.${field}.label` as never, { defaultValue: fallback } as never));
}

function ValueSkeletons() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className='space-y-1.5'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-5 w-32' />
        </div>
      ))}
    </>
  );
}

function ReadOnlyValue({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className='text-muted-foreground text-xs'>{label}</p>
      <p className='font-medium'>{value || '-'}</p>
    </div>
  );
}
