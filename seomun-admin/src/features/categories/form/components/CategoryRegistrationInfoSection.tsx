import { useTranslation } from 'react-i18next';

import type { Category } from '../../api/category.response';
import { CategoryFormSection, INFO_PANEL_CLASS } from './CategoryFormSection';

type CategoryRegistrationInfoSectionProps = {
  category: Category;
};

export function CategoryRegistrationInfoSection({ category }: CategoryRegistrationInfoSectionProps) {
  const { t } = useTranslation('form');

  return (
    <CategoryFormSection title={t('categories.sections.registration_info')}>
      <div className={`grid grid-cols-1 gap-4 ${INFO_PANEL_CLASS} md:grid-cols-2`}>
        <div>
          <p className='text-sm font-medium text-gray-900'>{t('categories.fields.registrant')}</p>
          <p className='text-sm text-gray-700'>{category.registrant?.name ?? category.registrant?.username ?? '-'}</p>
        </div>
        <div>
          <p className='text-sm font-medium text-gray-900'>{t('categories.fields.created_at')}</p>
          <p className='text-sm text-gray-700'>{category.created_at ? new Date(category.created_at).toLocaleString() : '-'}</p>
        </div>
        <div>
          <p className='text-sm font-medium text-gray-900'>{t('categories.fields.parent_category')}</p>
          <p className='text-sm text-gray-700'>
            {category.parent ? `${category.parent.name} (ID: ${category.parent.id})` : t('categories.fields.none_parent')}
          </p>
        </div>
        <div>
          <p className='text-sm font-medium text-gray-900'>{t('categories.fields.updated_at')}</p>
          <p className='text-sm text-gray-700'>{category.updated_at ? new Date(category.updated_at).toLocaleString() : '-'}</p>
        </div>
      </div>
    </CategoryFormSection>
  );
}
