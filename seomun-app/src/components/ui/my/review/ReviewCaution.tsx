'use client';

import { REVIEW_CAUTIONS } from '@/constants/review';
import { useTranslations } from 'next-intl';
import NoticeCollapse from '../components/NoticeCollapse';

const ReviewCaution = () => {
  const t = useTranslations();

  return (
    <NoticeCollapse title={t('product.caution')}>
      {REVIEW_CAUTIONS.map((policy, index) => (
        <div key={index} className='body-14 flex items-start gap-2'>
          <span className='min-w-4'>{index + 1}.</span>
          <div>
            <span>{t(policy.title)}</span>
            {policy.items && (
              <ul className='mt-1 ml-4 list-disc space-y-1'>
                {policy.items.map((item, i) => (
                  <li key={i}>{t(item)}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </NoticeCollapse>
  );
};

export default ReviewCaution;
