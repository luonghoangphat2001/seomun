'use client';

import { Description, DescriptionContent } from '@/components/common';
import { UserMemberType } from '@/enums/user';
import { useTranslations } from 'next-intl';
import type { ProfileUser } from '@/apis/my/profile/profile.response';

type LoginInfoProps = {
  user?: ProfileUser;
};

const LoginInfo = ({ user }: LoginInfoProps) => {
  const t = useTranslations();
  const memberTypeLabel =
    user?.member_type === UserMemberType.BUSINESS ? t('auth.corporate_member') : t('auth.individual_member');

  return (
    <div className='scrollbar-hide overflow-auto'>
      <Description isCollapse={false} title={t('my.login_info')} titleClassName='title-18'>
        <DescriptionContent
          rows={[
            {
              items: [{ label: t('my.membership_classification'), value: memberTypeLabel }],
            },
            {
              items: [
                { label: t('auth.id'), value: user?.username ?? '' },
                { label: t('auth.password'), value: '*********' },
              ],
            },
          ]}
        />
      </Description>
    </div>
  );
};

export default LoginInfo;
