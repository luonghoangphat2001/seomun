import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { Category } from '../../api/category.response';
import type { CATEGORY_STATUS } from '../../enums';
import { CategoryFormSection, CategoryInfoField, INFO_PANEL_CLASS } from './CategoryFormSection';

type CategoryChildrenSectionProps = {
  childrenCategories: Category[];
  statusLabelByValue: Map<CATEGORY_STATUS, ReactNode>;
};

export function CategoryChildrenSection({ childrenCategories, statusLabelByValue }: CategoryChildrenSectionProps) {
  const { t } = useTranslation('form');

  if (!childrenCategories.length) return null;

  return (
    <CategoryFormSection title={t('categories.sections.children', { count: childrenCategories.length })}>
      <div className={INFO_PANEL_CLASS}>
        <div className='space-y-2'>
          {childrenCategories.map((child, index) => (
            <div
              key={child.id}
              className='rounded-md border border-gray-300 bg-white p-3 [contain-intrinsic-size:auto_120px] [content-visibility:auto]'
            >
              <div className='grid grid-cols-1 gap-2 text-sm md:grid-cols-2'>
                <CategoryInfoField label={t('categories.fields.order')} value={index + 1} />
                <CategoryInfoField label={t('categories.fields.id')} value={child.id} />
                <CategoryInfoField label={t('categories.fields.name')} value={child.name} />
                <CategoryInfoField label={t('categories.fields.name_en')} value={child.name_en || '-'} />
                <CategoryInfoField label={t('categories.fields.slug')} value={child.slug} />
                <CategoryInfoField label={t('categories.fields.code')} value={child.code || '-'} />
                <CategoryInfoField label={t('categories.fields.sort_order')} value={child.sort_order} />
                <CategoryInfoField
                  label={t('categories.fields.status')}
                  value={statusLabelByValue.get(child.status.value) ?? child.status.label}
                  className='flex items-center gap-2'
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CategoryFormSection>
  );
}
