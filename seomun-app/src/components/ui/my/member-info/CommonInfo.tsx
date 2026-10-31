'use client';

import { Description, DescriptionContent, Radio, RadioGroup } from '@/components/common';
import { useTranslations } from 'next-intl';

type CommonInfoProps = {
  agreeSms?: boolean;
  agreeEmail?: boolean;
};

const CommonInfo = ({ agreeSms = false, agreeEmail = false }: CommonInfoProps) => {
  const t = useTranslations();

  return (
    <div>
      <Description isCollapse={false} title={t('my.commonness')} titleClassName='title-18'>
        <DescriptionContent
          labelClassName='md:w-[180px] body-16'
          rows={[
            {
              items: [
                {
                  label: t('my.sms_receive_consent'),
                  value: (
                    <div className='flex w-full flex-col flex-wrap justify-between gap-3 py-1 md:flex-row md:items-center md:gap-1 md:py-2'>
                      <div>
                        <p className='body-16 w-full'>{t('my.benefit_info_note')}</p>
                        <p className='body-14 text-text-secondary mt-2 md:mt-1.5'>{t('my.promotion_benefit_note_2')}</p>
                      </div>
                      <div className='flex w-fit'>
                        <RadioGroup className='flex items-center gap-8 md:mr-16 md:justify-end' value={Number(agreeSms)}>
                          <Radio value={1} label={t('my.reception')} labelClassName='input-15' />
                          <Radio value={0} label={t('my.reject')} labelClassName='input-15' />
                        </RadioGroup>
                      </div>
                    </div>
                  ),
                },
              ],
            },
            {
              items: [
                {
                  label: t('my.email_reception_consent'),
                  value: (
                    <div className='flex w-full flex-col flex-wrap justify-between gap-3 py-1 md:flex-row md:items-center md:gap-1 md:py-2'>
                      <p className='body-16'>{t('my.promotion_benefit_note')}</p>
                      <div className='flex w-fit'>
                        <RadioGroup className='flex items-center gap-8 md:mr-16 md:justify-end' value={Number(agreeEmail)}>
                          <Radio value={1} label={t('my.reception')} labelClassName='input-15' />
                          <Radio value={0} label={t('my.reject')} labelClassName='input-15' />
                        </RadioGroup>
                      </div>
                    </div>
                  ),
                },
              ],
            },
          ]}
        />
      </Description>
    </div>
  );
};

export default CommonInfo;
