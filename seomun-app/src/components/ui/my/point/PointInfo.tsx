'use client';

import { usePointBalanceQuery, usePointSummaryQuery } from '@/apis/points/points.query';
import { Button } from '@/components/common';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useMediaQuery } from '@/hooks';
import { ChevronRight, Point } from '@/icons';
import { formatCurrency } from '@/lib/utils';
import { getCurrentMembershipLevel } from '@/lib/utils/helper';
import { useMyProfileQuery } from '@/apis/my/profile/profile.query';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { format } from 'date-fns';
import { ROUTES } from '@/routes';

const PointInfo = () => {
  const tOrder = useTranslations('order');
  const tMy = useTranslations('my');
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { isAuthenticated, isHydrated } = useAuthStore();

  const { data: profileResp } = useMyProfileQuery({
    enabled: isHydrated && isAuthenticated,
  });
  const { data: summaryResp } = usePointSummaryQuery({
    enabled: isHydrated && isAuthenticated,
  });

  const currentLevel = getCurrentMembershipLevel(profileResp?.membership?.current?.accumulation_rate ?? 0).currentLevel;
  const currentBalance = summaryResp?.balance ?? 0;
  const totalEarned = summaryResp?.total_earned ?? 0;

  return (
    <section className='flex flex-col flex-wrap gap-3 md:flex-row'>
      <section className='border-border-soft bg-border-light flex-1 rounded-xl border p-4 md:min-w-100 md:p-6'>
        <div className='flex justify-between md:flex-col md:gap-3'>
          <div className='relative flex items-center gap-2'>
            <p className='title-24'>{profileResp?.profile?.name}</p>
            <Image src={currentLevel.activeIcon} alt={currentLevel.name} width={32} height={32} unoptimized />
            <Point className='absolute -top-12 right-0 hidden size-41.75 md:block' />
          </div>
          <p>
            <span className='text-text-brand title-32 md:title-40'>{formatCurrency(currentBalance, false)}</span>{' '}
            <span className='title-32 md:title-20 text-text-brand md:text-text-secondary md:ml-1'>P</span>
          </p>
        </div>
        <div className='bg-border-soft my-4 h-px md:my-6'></div>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex items-center gap-1.5'>
            <p className='body-14 md:body-16'>{tMy('accumulation_rate')}:</p>
            <p className='title-14 md:title-20 text-text-main md:text-text-brand'>
              {profileResp?.membership.current?.accumulation_rate || 0}%
            </p>
          </div>
          <Button
            size='xs'
            variant={isDesktop ? 'outline' : 'primary'}
            rightIcon={<ChevronRight className='size-4' />}
            className='body-14'
            onClick={() => router.push(ROUTES.MY_PAGE.MEMBER_INFO)}>
            {tMy('membership_info')}
          </Button>
        </div>
      </section>
      <section className='flex flex-1 gap-3 min-[1150px]:max-w-115 md:flex-col'>
        <section className='border-border-soft bg-border-light flex flex-1 flex-col justify-between rounded-lg border p-4 md:min-w-90 md:flex-row md:p-6'>
          <p className='title-16 md:title-18'>{tOrder('point_earned')}</p>
          <p className='mt-3 md:mt-0'>
            <span className='text-text-brand title-24 md:title-40'>{formatCurrency(totalEarned, false)}</span>{' '}
            <span className='title-24 md:title-20 text-text-brand md:text-text-secondary md:ml-1'>P</span>
          </p>
        </section>
        <section className='border-border-soft bg-border-light flex flex-1 flex-col justify-between rounded-lg border p-4 md:min-w-90 md:flex-row md:p-6'>
          <div className='space-y-1'>
            <p className='title-16 md:title-18'>{tMy('point_schedule_expiration')}</p>
            <p className='caption-12 md:body-16 text-text-secondary'>
              {summaryResp?.expiring_soon_date
                ? tOrder('point_standard_date', {
                    date: format(new Date(summaryResp.expiring_soon_date), 'yyyy.MM.dd'),
                  })
                : ''}
            </p>
          </div>
          <p className='mt-3 md:mt-0'>
            <span className='text-text-brand title-24 md:title-40'>
              {formatCurrency(summaryResp?.expiring_soon_points || 0, false)}
            </span>{' '}
            <span className='title-24 md:title-20 text-text-brand md:text-text-secondary md:ml-1'>P</span>
          </p>
        </section>
      </section>
    </section>
  );
};

export default PointInfo;
