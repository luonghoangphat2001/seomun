import { getRouteApi, Link } from '@tanstack/react-router';
import { functionalUpdate, type PaginationState, type SortingState } from '@tanstack/react-table';
import { ArrowLeft, Pencil, Send } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { AppSelect } from '@/components/shared/app-select';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { DEFAULT_PER_PAGE } from '@/constants/pagination';

import { useCouponDetailQuery, useCouponIssuancesQuery } from '../api/coupon.query';
import { CouponFormDialog } from '../components/CouponFormDialog';
import { getCouponIssuanceColumns } from '../components/CouponIssuanceColumns';
import { CouponIssueDialog } from '../components/CouponIssueDialog';
import {
  COUPON_DISCOUNT_TYPE_LABELS,
  COUPON_VALIDITY_BADGE_CLASSES,
  COUPON_VALIDITY_STATUS_LABELS,
  getCouponIssuanceStatusOptions,
} from '../constants';
import type { CouponIssuanceStatus } from '../enums';
import { formatCouponDate, formatCouponDateTime, formatCouponDiscount, formatCouponNumber, getCouponValidity } from '../utils/coupon-display';

const routeApi = getRouteApi('/orders/coupons/$couponId');

const NO_SORTING: SortingState = [];

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='min-w-0 space-y-0.5'>
      <dt className='text-muted-foreground text-xs'>{label}</dt>
      <dd className='text-sm break-words'>{children}</dd>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-muted/40 min-w-0 rounded-lg px-3 py-2'>
      <p className='text-muted-foreground text-xs'>{label}</p>
      <p className='truncate text-base font-semibold tabular-nums'>{value}</p>
    </div>
  );
}

export function CouponDetailPage() {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const couponId = Number(routeApi.useParams().couponId);

  const { data: coupon, isLoading } = useCouponDetailQuery(couponId);

  // ============================================================================
  // State
  // ============================================================================
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issuanceStatus, setIssuanceStatus] = useState<CouponIssuanceStatus | undefined>(undefined);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_PER_PAGE });

  // ============================================================================
  // Hooks (state-dependent)
  // ============================================================================
  const issuancesQuery = useCouponIssuancesQuery({
    couponId,
    status: issuanceStatus,
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  });

  const columns = useMemo(
    () => getCouponIssuanceColumns({ t, pageOffset: pagination.pageIndex * pagination.pageSize }),
    [t, pagination.pageIndex, pagination.pageSize],
  );

  // ============================================================================
  // Variables
  // ============================================================================
  const validity = coupon ? getCouponValidity(coupon) : undefined;
  const statistics = coupon?.statistics;

  const formatPeriod = (from: string | null, to: string | null) =>
    from || to ? `${formatCouponDate(from)} ~ ${formatCouponDate(to)}` : t('orders.coupons.detail.no_period_limit');

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <PageContainer>
      <div className='flex items-center justify-between gap-3'>
        <h1 className='text-xl font-semibold'>{t('orders.coupons.detail.title')}</h1>

        <div className='flex items-center gap-2'>
          <Button asChild variant='outline' size='sm' className='gap-1.5'>
            <Link to='/orders/coupons'>
              <ArrowLeft className='size-4' />
              {t('orders.coupons.detail.back_to_list')}
            </Link>
          </Button>

          {coupon ? (
            <>
              <Button type='button' variant='outline' size='sm' className='gap-1.5' onClick={() => setIsIssueOpen(true)}>
                <Send className='size-4' />
                {t('orders.coupons.actions.issue')}
              </Button>

              <Button type='button' size='sm' className='gap-1.5' onClick={() => setIsFormOpen(true)}>
                <Pencil className='size-4' />
                {t('orders.coupons.actions.edit')}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <Separator />

      {isLoading ? (
        <div className='space-y-3'>
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-40 w-full' />
        </div>
      ) : !coupon ? (
        <p className='text-muted-foreground text-sm'>{t('orders.coupons.detail.not_found')}</p>
      ) : (
        <div className='space-y-6'>
          <section className='space-y-5 rounded-xl border p-5'>
            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-base font-semibold'>{coupon.name}</h2>
                <Badge variant='outline'>{coupon.is_active ? tCommon('status.active') : tCommon('status.inactive')}</Badge>
                {validity ? (
                  <Badge variant='outline' className={COUPON_VALIDITY_BADGE_CLASSES[validity]}>
                    {COUPON_VALIDITY_STATUS_LABELS[validity](t)}
                  </Badge>
                ) : null}
                <Badge variant='outline'>
                  {coupon.is_claimable ? t('orders.coupons.detail.claimable') : t('orders.coupons.detail.not_claimable')}
                </Badge>
              </div>
              <p className='text-muted-foreground mt-0.5 font-mono text-xs'>{coupon.code}</p>
            </div>

            {statistics ? (
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                <StatTile label={t('orders.coupons.statistics.issued_total')} value={formatCouponNumber(statistics.issued_total)} />
                <StatTile label={t('orders.coupons.statistics.used_total')} value={formatCouponNumber(statistics.used_total)} />
                <StatTile label={t('orders.coupons.statistics.available_total')} value={formatCouponNumber(statistics.available_total)} />
                <StatTile label={t('orders.coupons.statistics.usage_rate')} value={`${statistics.usage_rate}%`} />
              </div>
            ) : null}

            <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <DetailRow label={t('orders.coupons.form.fields.discount_type')}>{COUPON_DISCOUNT_TYPE_LABELS[coupon.discount_type](t)}</DetailRow>
              <DetailRow label={t('orders.coupons.form.fields.discount_value')}>{formatCouponDiscount(coupon, t)}</DetailRow>
              <DetailRow label={t('orders.coupons.form.fields.min_order_amount')}>
                {coupon.min_order_amount === null
                  ? tCommon('none')
                  : t('orders.coupons.discount_value.fixed', { value: formatCouponNumber(coupon.min_order_amount) })}
              </DetailRow>
              <DetailRow label={t('orders.coupons.form.fields.max_discount_amount')}>
                {coupon.max_discount_amount === null
                  ? tCommon('none')
                  : t('orders.coupons.discount_value.fixed', { value: formatCouponNumber(coupon.max_discount_amount) })}
              </DetailRow>
              <DetailRow label={t('orders.coupons.form.fields.usage_limit')}>
                {coupon.usage_limit === null ? t('orders.coupons.detail.unlimited') : formatCouponNumber(coupon.usage_limit)}
              </DetailRow>
              <DetailRow label={t('orders.coupons.form.fields.claim_period')}>{formatPeriod(coupon.claim_starts_at, coupon.claim_ends_at)}</DetailRow>
              <DetailRow label={t('orders.coupons.form.fields.period')}>{formatPeriod(coupon.starts_at, coupon.expires_at)}</DetailRow>
              <DetailRow label={t('orders.coupons.columns.created_at')}>{formatCouponDateTime(coupon.created_at)}</DetailRow>
              <DetailRow label={t('orders.coupons.form.fields.description')}>{coupon.description || tCommon('none')}</DetailRow>
            </dl>
          </section>

          <section className='space-y-4'>
            <div className='flex flex-wrap items-end justify-between gap-3'>
              <h2 className='text-base font-semibold'>{t('orders.coupons.issuances.title')}</h2>

              <div className='w-full sm:w-48'>
                <AppSelect
                  value={issuanceStatus}
                  onValueChange={(value) => {
                    setIssuanceStatus(value);
                    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
                  }}
                  options={getCouponIssuanceStatusOptions(t)}
                  placeholder={t('orders.coupons.issuances.all_statuses')}
                  aria-label={t('orders.coupons.columns.status')}
                  clearable
                />
              </div>
            </div>

            <DataTable
              data={issuancesQuery.data?.data.issuances ?? []}
              columns={columns}
              state={{ pagination, sorting: NO_SORTING }}
              pageInfo={{
                pageCount: issuancesQuery.data?.pagination.total_page ?? 0,
                rowCount: issuancesQuery.data?.pagination.total_item ?? 0,
              }}
              onPaginationChange={(updater) => setPagination((previous) => functionalUpdate(updater, previous))}
              onSortingChange={() => undefined}
              isLoading={issuancesQuery.isLoading}
              enableRowSelection={false}
              getRowId={(row) => String(row.id)}
            />
          </section>
        </div>
      )}

      <CouponFormDialog isOpen={isFormOpen} editCoupon={coupon ?? undefined} onClose={() => setIsFormOpen(false)} />

      {isIssueOpen && coupon ? <CouponIssueDialog coupon={coupon} onClose={() => setIsIssueOpen(false)} /> : null}
    </PageContainer>
  );
}
