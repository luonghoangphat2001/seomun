'use client';

import { Headset } from '@/icons';
import { useTranslations } from 'next-intl';

const ContactSection = () => {
  const t = useTranslations();
  const isManager = false;

  return (
    <div className='mt-8 space-y-3'>
      <Headset width={32} height={32} />
      <div className='space-y-1'>
        <p className='caption-12 text-text-secondary'>{t('home.customer_service')}</p>
        <p className='title-20'>1600-5499</p>
      </div>
      {isManager && (
        <div className='mt-3 space-y-1'>
          <p className='caption-12 text-text-secondary'>{t('common.person_incharge')}</p>
          <div>
            <p className='title-20'>070-7007-6708</p>
            <p className='title-16'>김효선</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSection;
