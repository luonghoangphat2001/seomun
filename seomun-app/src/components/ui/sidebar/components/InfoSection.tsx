'use client';

import { useAuthStore } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/routes';
import Image from 'next/image';

type InfoSectionProps = {
  fullName?: string;
  description?: string;
};

const InfoSection = ({ fullName, description }: InfoSectionProps) => {
  const router = useRouter();
  const { user } = useAuthStore();

  const backToMainMyPage = () => {
    router.push(ROUTES.MY_PAGE.MAIN);
  };

  return (
    <div
      className='from-primary-100 hover:from-primary-200 flex w-full cursor-pointer flex-col items-center rounded-xl bg-linear-to-b to-white pt-8 pb-4'
      onClick={backToMainMyPage}>
      <Image src='/images/user-profile.png' alt='user-profile' width={64} height={64} />
      <div className='mt-3 space-y-0.5 text-center'>
        <p className='title-16 font-semibold'>{user?.name || '홍길동'}</p>
        <p className='body-14'>{user?.username || '서문'}</p>
      </div>
    </div>
  );
};

export default InfoSection;
