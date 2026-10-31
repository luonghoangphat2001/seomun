import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useShoppingSettingItemListQuery } from '@/features/products/shopping-settings/api';
import type { ShoppingSetting } from '@/features/products/shopping-settings/types';

type ShoppingSettingItemSelectorProps = {
  setting: ShoppingSetting;
  selectedItemIds: number[];
  disabled: boolean;
  onSelect: (itemId: number | null, settingItemIds: number[]) => void;
};

const NO_SHOPPING_SETTING_ITEM_VALUE = '__none__';

export function ShoppingSettingItemSelector({ setting, selectedItemIds, disabled, onSelect }: ShoppingSettingItemSelectorProps) {
  const { t } = useTranslation('page');
  const { data: items = [], isLoading, isError } = useShoppingSettingItemListQuery({ shopping_setting_id: setting.id });
  const selectedItem = items.find((item) => selectedItemIds.includes(item.id));
  const selectedItemId = selectedItem?.id;

  if (isLoading) {
    return (
      <div className='flex min-h-16 items-center justify-center rounded-lg border'>
        <Loader2 className='text-muted-foreground size-4 animate-spin' />
      </div>
    );
  }

  if (isError) {
    return <p className='text-destructive text-sm'>{t('products.management.form.messages.load_shopping_setting_items_error')}</p>;
  }

  if (items.length === 0) {
    return <p className='text-muted-foreground text-sm'>{t('products.management.form.no_shopping_setting_items')}</p>;
  }

  return (
    <RadioGroup
      value={selectedItemId?.toString() ?? NO_SHOPPING_SETTING_ITEM_VALUE}
      disabled={disabled}
      onValueChange={(value) =>
        onSelect(
          value === NO_SHOPPING_SETTING_ITEM_VALUE ? null : Number(value),
          items.map(({ id }) => id),
        )
      }
      className='space-y-2'
    >
      <label className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm'>
        <RadioGroupItem value={NO_SHOPPING_SETTING_ITEM_VALUE} />
        <span className='text-muted-foreground'>{t('products.management.form.no_shopping_setting_selection')}</span>
      </label>
      {items.map((item) => {
        const inputId = `shopping-setting-${setting.id}-item-${item.id}`;
        const isSelected = selectedItemId === item.id;

        return (
          <div key={item.id}>
            <label htmlFor={inputId} className='hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm'>
              <RadioGroupItem id={inputId} value={String(item.id)} />
              <span>{item.title}</span>
            </label>
            {isSelected && item.content ? (
              <div className='app-rich-text-editor__content bg-muted/20 mt-2 rounded-md border text-sm'>
                <div className='tiptap' dangerouslySetInnerHTML={{ __html: item.content }} />
              </div>
            ) : null}
          </div>
        );
      })}
    </RadioGroup>
  );
}
