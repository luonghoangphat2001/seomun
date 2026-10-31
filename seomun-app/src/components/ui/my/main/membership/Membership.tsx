'use client';

import { Button } from '@/components/common';
import { Megaphone, Phone2, Present } from '@/icons';
import MembershipLevelProgress from './MembershipLevelProgress';
import { useTranslations } from 'next-intl';
import { getCurrentMembershipLevel } from '@/lib/utils/helper';
import Image from 'next/image';
import { DashboardRESP } from '@/apis/my/dashboard/dashboard.response';
import { useAuthStore } from '@/hooks';
import { formatCurrency, formatKoreanPhone } from '@/lib/utils';
import { useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/routes';

type MemberShipProps = {
  dataDashboard?: DashboardRESP;
};

const MemberShip = ({ dataDashboard }: MemberShipProps) => {
  const tMy = useTranslations('my');
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const memberInfo = dataDashboard?.member_summary;
  const { currentLevel } = getCurrentMembershipLevel(memberInfo?.current_quarter_spent || 0);
  //console.log('profile', profile);

  const toMyNoticePage = () => {
    router.push(ROUTES.MY_PAGE.NOTICE);
  };

  const myInfo = [
    // {
    //   label: tMy('point_accumulation_rate'),
    //   value: (
    //     <>
    //       {currentLevel.pointPercent}
    //       <span className='title-14 md:title-18'>%</span>
    //     </>
    //   ),
    // },
    {
      label: tMy('point'),
      value: `${memberInfo?.point_balance || 0} P`,
    },
    {
      label: '쿠폰 개수',
      value: '0',
    },
    {
      label: tMy('prepaid_balance'),
      value: formatCurrency(profile?.balance?.balance || 0),
    },
    {
      label: '계좌번호',
      value: profile?.virtual_account?.account_number || '-',
    },
  ];

  return (
    <section className='text-text-main'>
      {/**Top Section on Mobile*/}
      <div className='mb-4 flex items-center gap-3 md:hidden'>
        <Image src='/images/user-profile.png' alt='user-profile' width={56} height={56} />
        <div className='space-y-1.5'>
          <div className='flex items-center gap-1'>
            <p className='title-16 font-semibold'>{user?.name || '홍길동'}</p>
            {/* <Image src={currentLevel.activeIcon} alt={currentLevel.name} width={30} height={30} unoptimized /> */}
          </div>
          <p className='body-14'>서문</p>
        </div>
      </div>
      {/**Top Section */}
      <div className='border-border-soft bg-border-light flex items-center justify-between rounded-t-xl border p-4 md:flex-wrap md:gap-y-1 md:rounded-t-2xl md:border-b-0 md:bg-transparent md:p-6 md:pb-0'>
        <div className='hidden items-center gap-2 md:flex'>
          {/* <Image src={currentLevel.activeIcon} alt={currentLevel.name} width={60} height={60} unoptimized /> */}
          <p className='title-40'>{user?.name}</p>
        </div>
        <div className='border-border-soft bg-border-light flex w-full items-center justify-between rounded-full md:w-auto md:flex-wrap md:justify-start md:border md:px-3 md:py-2'>
          <div className='flex items-start gap-2 md:items-center md:gap-3'>
            <div className='bg-primary-600 text-primary-50 flex size-6 items-center justify-center rounded-full md:size-12.5'>
              <Phone2 className='size-4 md:size-7.5' />
            </div>
            <div>
              {/* <p className='title-16 font-semibold'>{currentLevel?.name} 전용 상담 안내</p> */}
              <p className='body-16 mt-0.5'>{formatKoreanPhone(user?.phone || '') || '010-0000-0000'}</p>
            </div>
          </div>
          <Button
            variant='outline-primary'
            size='lg'
            className='ml-6 w-12 rounded-full bg-white px-0 md:w-auto md:px-4'
            onClick={toMyNoticePage}>
            <div className='flex items-center gap-2'>
              <Megaphone width={24} height={24} />
              <p className='body-16 hidden font-normal lg:block'>{tMy('membership_notice')}</p>
            </div>
          </Button>
        </div>
      </div>
      {/**Bottom Section */}
      <div className='md:border-border-soft rounded-b-xl md:rounded-b-2xl md:border md:border-t-0 md:pb-6'>
        <div className='border-border-soft rounded-b-xl border border-t-0 px-4 py-6 md:rounded-b-2xl md:border-none md:px-6 md:py-0 md:pt-2'>
          {/* <p className='body-16'>
            {tMy.rich('current_level_notice', {
              level: currentLevel?.name || 'Bronze',
              leftPoint: '100',
              span: (chunks) => <span className='text-text-brand title-16'>{chunks}</span>,
            })}
          </p> */}
          {/**Progress Level Bar */}
          {/* <div className='mt-6 md:mt-8'>
            <MembershipLevelProgress money={memberInfo?.current_quarter_spent || 0} />
          </div> */}
        </div>
        <div className='mt-3 flex flex-col-reverse gap-4 md:mt-8 md:flex-col md:gap-8 md:px-6'>
          {/**Button */}
          {/* <div className='text-center'>
            <Button
              className='title-16! h-11 rounded-full px-4 text-white shadow-lg'
              leftIcon={<Present width={24} height={24} />}>
              {tMy('button_earn_point', { pointPercent: currentLevel?.pointPercent || '0' })}
            </Button>
          </div> */}
          {/** point card info */}
          <div className='body-16 grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]'>
            {myInfo.map((item, index) => (
              <div key={index} className='border-border-soft bg-border-light rounded-lg border px-3 py-4 md:px-6'>
                <p className='body-16'>{item.label}</p>
                <p className='text-text-brand title-20 md:title-24 mt-4 font-semibold wrap-break-word'>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MemberShip;
