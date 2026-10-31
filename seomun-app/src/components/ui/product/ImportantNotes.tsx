'use client';

import { useShoppingSettingListQuery } from '@/apis/shopping-setting/shopping-setting.query';
import { RichText } from '@/components/common';
import { IMPORTANT_NOTES_TABS } from '@/constants/product';
import { ShoppingSettingType } from '@/enums/shopping-setting';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ImportantNotesTabs } from './ImportantNotesTabs';
import { ReviewList } from './ReviewList';

const shoppingSettingTypeByTabId: Partial<Record<(typeof IMPORTANT_NOTES_TABS)[number]['id'], ShoppingSettingType>> = {
  production_guide: ShoppingSettingType.General_Production_Guide,
  general_precautions: ShoppingSettingType.General_Precautions,
  shipment_delivery: ShoppingSettingType.Shipment_Delivery_Information,
  user_guide: ShoppingSettingType.User_Guide,
};

interface ImportantNotesProps {
  productSlug: string;
}

export const ImportantNotes = ({ productSlug }: ImportantNotesProps) => {
  const tCommon = useTranslations('common');
  const [activeTab, setActiveTab] = useState('production_guide');
  const { data } = useShoppingSettingListQuery({ product_slug: productSlug });

  const renderContent = () => {
    if (activeTab === 'review') {
      return <ReviewList productSlug={productSlug} />;
    }

    const shoppingSettingType = shoppingSettingTypeByTabId[activeTab as keyof typeof shoppingSettingTypeByTabId];
    const shoppingSetting = data?.data.shopping_settings.find((item) => item.type === shoppingSettingType);

    if (!shoppingSetting?.content?.trim()) {
      return <p className='body-14 text-text-secondary py-10 text-center'>{tCommon('no_data')}</p>;
    }

    return <RichText content={shoppingSetting.content} className='body-14 md:body-16 p-4 md:p-6' />;
  };

  return (
    <div className='global-padding flex w-full flex-col bg-white'>
      <div className='max-w-307'>
        <ImportantNotesTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className=''>{renderContent()}</div>
      </div>
    </div>
  );
};
