'use client';

import { Description, DescriptionContent } from '@/components/common';
import { formatKoreanPhone } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { ProfileUser } from '@/apis/my/profile/profile.response';

type BasicInfoProps = {
  user?: ProfileUser;
};

const BasicInfo = ({ user }: BasicInfoProps) => {
  const t = useTranslations();
  const address = [user?.postcode ? `[${user.postcode}]` : '', user?.address, user?.detailed_address].filter(Boolean).join(' ');

  return (
    <div>
      <Description isCollapse={false} title={t('auth.basic_information')} titleClassName='title-18'>
        <DescriptionContent
          rows={[
            {
              items: [{ label: t('auth.name'), value: user?.name ?? '' }],
            },
            {
              items: [
                { label: t('common.mobile_phone'), value: formatKoreanPhone(user?.mobile ?? '') },
                { label: t('auth.phone_number'), value: formatKoreanPhone(user?.phone ?? '') },
              ],
            },
            {
              items: [{ label: t('common.address'), value: address }],
            },
            {
              items: [{ label: t('auth.email'), value: user?.email ?? '' }],
            },
          ]}
        />
      </Description>
    </div>
  );
};

export default BasicInfo;
