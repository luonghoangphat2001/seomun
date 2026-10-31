'use client';

import type { ProfileUser } from '@/apis/my/profile/profile.response';
import { Description, DescriptionContent } from '@/components/common';
import { UserMemberType } from '@/enums/user';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

//display only for business member

type CompanyInfoProps = {
  memberType?: UserMemberType;
  customer?: ProfileUser['customer'];
};

const CompanyInfo = ({ memberType, customer }: CompanyInfoProps) => {
  const t = useTranslations();
  const businessAddress = [customer?.postcode ? `[${customer.postcode}]` : '', customer?.address, customer?.detailed_address]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn(memberType === UserMemberType.BUSINESS ? 'block' : 'hidden')}>
      <Description isCollapse={false} title={t('auth.company_information')} titleClassName='title-18'>
        <DescriptionContent
          rows={[
            {
              items: [{ label: t('my.business_registration_number'), value: customer?.business_registration_number ?? '' }],
            },
            {
              items: [
                { label: t('auth.company_name'), value: customer?.company_name ?? '' },
                { label: t('auth.representative_name'), value: customer?.representative_name ?? '' },
              ],
            },
            {
              items: [
                { label: t('auth.industry'), value: customer?.industry_type ?? '' },
                { label: t('auth.business_type'), value: customer?.business_type ?? '' },
              ],
            },
            {
              items: [{ label: t('common.address'), value: businessAddress }],
            },
            {
              items: [
                {
                  label: (
                    <span>
                      {t('auth.email_tax')}
                      <span className='caption-12 block'>({t('auth.for_tax')})</span>
                    </span>
                  ),
                  value: customer?.tax_invoice_email ?? '',
                },
              ],
            },
            {
              items: [{ label: t('my.website_address'), value: customer?.homepage_url ?? '' }],
            },
          ]}
        />
      </Description>
    </div>
  );
};

export default CompanyInfo;
