'use client';

import { useMyProfileQuery } from '@/apis/my/profile/profile.query';
import { Button } from '@/components/common';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Megaphone, Phone2, Present } from '@/icons';
import { getCurrentMembershipLevel } from '@/lib/utils/helper';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import MembershipLevelProgress from '../my/main/membership/MembershipLevelProgress';
import { HomeMembershipSkeleton } from './HomeMembershipSkeleton';
import { formatKoreanPhone } from '@/lib/utils';

export const HomeMembership = () => {
  const tMy = useTranslations('my');
  const { user: authUser, isAuthenticated, isHydrated } = useAuthStore();

  const { data: profile, isLoading } = useMyProfileQuery({
    enabled: isHydrated && isAuthenticated,
  });

  if (!isHydrated || !isAuthenticated) return null;

  if (isLoading) return <HomeMembershipSkeleton />;

  const user = profile?.profile || authUser;
  const money = profile?.membership?.current?.accumulation_rate ?? 0;
  const { currentLevel } = getCurrentMembershipLevel(money);

  return (
    <>
      <div className='mobile-seperator mx-0'></div>
      <section className='global-padding space-y-3 py-6 md:hidden'>
        <div className='border-border-soft rounded-[12px] border bg-white'>
          <div className='border-border-soft bg-border-light flex items-center justify-between rounded-t-[12px] border-b p-4'>
            <div className='flex items-center gap-3'>
              <div className='title-24 bg-text-brand flex size-12 items-center justify-center rounded-full font-bold text-black'>
                {user?.name ? user.name.charAt(0) : '고'}
              </div>
              <div className='space-y-1'>
                <div className='flex items-center gap-1'>
                  <p className='title-16 font-semibold'>{user?.name || '홍길동'}</p>
                  <div className='flex size-7 items-center justify-center'>
                    <Image src={currentLevel.activeIcon} alt={currentLevel.name} width={28} height={28} unoptimized />
                  </div>
                </div>
                <p className='body-14'>서문</p>
              </div>
            </div>
            <button className='border-text-brand text-text-brand flex size-10 items-center justify-center rounded-full border'>
              <Megaphone className='size-6' />
            </button>
          </div>

          <div className='flex flex-col items-center gap-3 px-6 py-3'>
            <MembershipLevelProgress money={money} showText={false} />
            <div className='flex flex-col items-center gap-0.5'>
              <div className='flex items-center gap-1.5'>
                <p className='title-16'>{currentLevel?.name} 전용 상담 안내</p>
                <div className='rounded-full bg-[#E65100] p-1 text-white'>
                  <Phone2 className='size-4' />
                </div>
              </div>
              <p className='body-16'>
                {user?.name} 과장 · {formatKoreanPhone(user?.mobile ?? '')}
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div className='border-border-soft flex flex-col gap-4 rounded-[12px] border bg-white px-3 py-4'>
            <p className='body-16 font-normal'>{tMy('point')}</p>
            <p className='title-20 text-text-brand'>{(profile?.point.balance ?? 0).toLocaleString()} P</p>
          </div>
          <div className='border-border-soft flex flex-col gap-4 rounded-[12px] border bg-white px-3 py-4'>
            <p className='body-16 font-normal'>{tMy('prepaid_balance')}</p>
            <p className='title-20 text-text-brand'>{(profile?.point.balance ?? 0).toLocaleString()} 원</p>
          </div>
        </div>

        <div className='flex justify-center pt-1'>
          <Button
            variant='primary'
            size='lg'
            className='title-14 h-11 w-[240px] rounded-full px-4 font-semibold text-white'
            leftIcon={<Present width={24} height={24} strokeWidth={2.5} />}>
            {tMy('button_earn_point', { pointPercent: currentLevel?.pointPercent || '0' })}
          </Button>
        </div>
      </section>
      <div className='mobile-seperator mx-0'></div>
    </>
  );
};
