'use client';

import type { OrderHistoryItemRESP } from '@/apis/my/order/order.response';
import { Description, DescriptionContent } from '@/components/common';
import { formatKoreanPhone } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type OrdererInfoProps = {
  order?: OrderHistoryItemRESP;
};

const OrdererInfo = ({ order }: OrdererInfoProps) => {
  const t = useTranslations();
  const ordererPhone = order?.contact.phone || order?.user.mobile || order?.user.phone;
  const rows = [
    {
      items: [{ label: t('common.orderer'), value: order?.contact.name || order?.user.name }],
    },
    {
      items: [{ label: t('common.contact_info'), value: ordererPhone ? formatKoreanPhone(ordererPhone) : '-' }],
    },
    // {
    //   items: [
    //     { label: t('common.customer_manager'), value: getManagerName(order?.customer_manager) },
    //     {
    //       label: t('common.designated_date'),
    //       value: order?.metadata.requested_delivery_date
    //         ? formatDate(order.metadata.requested_delivery_date, DATE_FORMAT.DATE_WITH_DOT)
    //         : '-',
    //     },
    //   ],
    // },
  ];

  return (
    <Description isCollapse={false} title={t('order.orderer_info')}>
      <div className='md:hidden'>
        <DescriptionContent mobileInRow rows={rows} />
      </div>
      <div className='hidden md:block'>
        <DescriptionContent rows={rows} />
      </div>
    </Description>
  );
};

export default OrdererInfo;
