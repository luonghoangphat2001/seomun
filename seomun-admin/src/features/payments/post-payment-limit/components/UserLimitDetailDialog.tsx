import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatKrw } from '@/utils/format-currency';

import { useUserLimitDetailQuery } from '../api';
import { USER_LIMIT_STATUS_LABELS, USER_LIMIT_STATUS_STYLES } from '../constants';
import type { UserLimitStatus } from '../enums';

// === Types ===

type Props = {
  id: number | null;
  onClose: () => void;
};

// === Variables ===

function formatAmount(amount: number): string {
  return formatKrw(amount);
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-start gap-3'>
      <span className='text-muted-foreground w-32 shrink-0 text-sm'>{label}</span>
      <span className='text-sm font-medium break-all'>{value ?? '—'}</span>
    </div>
  );
}

// === Component ===

export function UserLimitDetailDialog({ id, onClose }: Props) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  // === Hooks ===

  const { data, isLoading } = useUserLimitDetailQuery(id ?? 0);
  const limit = data?.data.limit;
  const customer = limit?.customer;

  // === JSX ===

  return (
    <Dialog
      open={id !== null}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('post_payment_limit.detail_dialog.title', 'Limit Detail')}</DialogTitle>
        </DialogHeader>

        {isLoading || !limit ? (
          <div className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground text-sm'>{tCommon('message.loading', 'Loading…')}</p>
          </div>
        ) : (
          <div className='space-y-5'>
            <div className='space-y-3'>
              <p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                {t('post_payment_limit.detail_dialog.section_limit', 'Limit Info')}
              </p>
              <Field label={t('post_payment_limit.detail_dialog.limit', 'Credit Limit')} value={formatAmount(limit.limit)} />
              {limit.usage_amount !== undefined && (
                <Field
                  label={t('post_payment_limit.detail_dialog.usage_amount', 'Used')}
                  value={<span className='text-red-600'>{formatAmount(limit.usage_amount)}</span>}
                />
              )}
              {limit.remaining_amount !== undefined && (
                <Field
                  label={t('post_payment_limit.detail_dialog.remaining_amount', 'Remaining')}
                  value={<span className='text-green-600'>{formatAmount(limit.remaining_amount)}</span>}
                />
              )}
              <Field
                label={t('post_payment_limit.detail_dialog.status', 'Status')}
                value={
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${USER_LIMIT_STATUS_STYLES[limit.status as UserLimitStatus] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {USER_LIMIT_STATUS_LABELS[limit.status as UserLimitStatus]?.(t) ?? limit.status}
                  </span>
                }
              />
              <Field label={t('post_payment_limit.detail_dialog.created_at', 'Created At')} value={limit.created_at} />
            </div>

            <Separator />

            <div className='space-y-3'>
              <p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                {t('post_payment_limit.detail_dialog.section_user', 'User Info')}
              </p>
              <Field label={t('post_payment_limit.detail_dialog.name', 'Name')} value={customer?.name} />
              <Field label={t('post_payment_limit.detail_dialog.username', 'Username')} value={customer?.username} />
              <Field label={t('post_payment_limit.detail_dialog.email', 'Email')} value={customer?.email} />
              <Field label={t('post_payment_limit.detail_dialog.phone', 'Phone')} value={customer?.phone ?? customer?.mobile} />
              <Field label={t('post_payment_limit.detail_dialog.headquarters', 'Headquarters')} value={customer?.headquarters} />
              <Field label={t('post_payment_limit.detail_dialog.business_office', 'Business Office')} value={customer?.business_office} />
              <Field label={t('post_payment_limit.detail_dialog.team', 'Team')} value={customer?.team} />
              <Field label={t('post_payment_limit.detail_dialog.position', 'Position')} value={customer?.position} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
