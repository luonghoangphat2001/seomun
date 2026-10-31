'use client';

import { DashboardRESP } from '@/apis/my/dashboard/dashboard.response';
import { CameraYellow, PencilYellow, PointLogo } from '@/icons';
import RecentPostItem from './RecentPostItem';
import { useTranslations } from 'next-intl';

type RecentPostProps = {
  dataDashboard?: DashboardRESP;
};

const RecentPost = ({ dataDashboard }: RecentPostProps) => {
  const t = useTranslations();
  const inquirySummary = dataDashboard?.inquiry_summary ?? [];
  const reviewSummary = dataDashboard?.review_summary;
  const reviewPointInfo = [
    {
      title: t('my.photo_review'),
      point: 300, //reviewSummary?.photo_review_points ?? 0,
      icon: <CameraYellow className='size-6 md:size-12' />,
    },
    {
      title: t('my.general_review'),
      point: reviewSummary?.normal_review_points ?? 0,
      icon: <PencilYellow className='size-6 md:size-12' />,
    },
  ];

  return (
    <section className='grid grid-cols-1'>
      <h2 className='title-20'>{t('my.recent_post')}</h2>
      <div className='mt-4 flex flex-col flex-wrap gap-4 md:flex-row'>
        {inquirySummary.map((inquiry) => (
          <RecentPostItem
            key={inquiry.category}
            title={inquiry.label}
            answeredNumber={inquiry.answered}
            preparingNumber={inquiry.pending}
          />
        ))}
      </div>
      <div className='border-border-soft mt-8 space-y-6 rounded-2xl border p-4 md:p-8'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='space-y-1.5'>
            <p className='title-16 md:title-20'>{t('my.available_review')}</p>
            <p className='caption-12 md:body-14 text-text-secondary'>{t('my.available_review_note')}</p>
          </div>
          <p>
            <span className='text-text-brand title-20 md:title-32 underline'>{reviewSummary?.reviewable_count ?? 0}</span>
            <span className='md:title-16 ml-2'>건</span>
          </p>
        </div>
        <div className='grid grid-cols-2 gap-2 md:gap-4'>
          {reviewPointInfo.map((item) => (
            <div key={item.title} className='border-border-soft flex items-end justify-between rounded-[10px] border p-4 md:p-6'>
              <div className='space-y-3'>
                <p className='title-16'>{item.title}</p>
                <div className='flex items-center gap-1 md:gap-2'>
                  <p className='title-20 md:title-32 text-text-brand'>{item.point}</p>
                  <PointLogo className='size-8' />
                </div>
              </div>
              {item.icon}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentPost;
