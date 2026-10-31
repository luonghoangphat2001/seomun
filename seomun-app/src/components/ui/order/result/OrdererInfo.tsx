'use client';

import { OrderCreateRESP } from '@/apis/order/order.response';
import { Description, DescriptionContent } from '@/components/common';
import { formatKoreanPhone } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type OrdererInfoProps = {
  order?: OrderCreateRESP;
};

const OrdererInfo = ({ order }: OrdererInfoProps) => {
  const t = useTranslations();

  return (
    <div>
      <Description isCollapse={false} title={t('order.orderer_info')}>
        <DescriptionContent
          rows={[
            {
              items: [{ label: t('order.orderer_name'), value: order?.contact.name || '-' }],
            },
            {
              items: [
                { label: t('common.mobile_phone'), value: order?.contact.phone ? formatKoreanPhone(order.contact.phone) : '-' },
              ],
            },
          ]}
        />
      </Description>
    </div>
  );
};

export default OrdererInfo;
