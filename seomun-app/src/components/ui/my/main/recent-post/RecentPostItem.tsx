'use client';

import { useTranslations } from 'next-intl';

type RecentPostItemProps = {
  title: string;
  answeredNumber?: number;
  preparingNumber?: number;
};

const RecentPostItem = ({ title, answeredNumber = 0, preparingNumber = 0 }: RecentPostItemProps) => {
  const t = useTranslations();

  return (
    <div className='border-border-soft min-w-75 flex-1 overflow-hidden rounded-2xl border'>
      <div className='bg-border-light title-16 border-border-soft border-b p-3 text-center md:p-5'>{title}</div>
      <div className='flex'>
        <div className='flex flex-1 flex-col items-center justify-center gap-1.5 p-5'>
          <p className='body-16'>{t('my.answered')}</p>
          <div className='flex items-center gap-1'>
            <p className='title-20 text-text-brand'>{answeredNumber}</p>
            <p className='body-16'>건</p>
          </div>
        </div>
        <div className='bg-border-soft h-auto w-px'></div>
        <div className='flex flex-1 flex-col items-center justify-center gap-1.5 p-5'>
          <p className='body-16'>{t('my.preparing')}</p>
          <div className='flex items-center gap-1'>
            <p className='title-20 text-text-brand'>{preparingNumber}</p>
            <p className='body-16'>건</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentPostItem;
