import { Link, getRouteApi } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { CategoryForm } from '../form';

const routeApi = getRouteApi('/categories/$categoryId');

export function CategoryDetailPage() {
  const { t } = useTranslation();
  const { categoryId } = routeApi.useParams();
  const resolvedCategoryId = Number(categoryId);

  const handleFormSubmit = () => {
    // No-op for view mode.
  };

  const handleCancel = () => {
    // No-op for view mode.
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.category.detail.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.category.detail.description')}</p> */}
        </div>

        <Button size='sm' className='h-10 gap-1.5' asChild>
          <Link to='/categories/$categoryId/edit' params={{ categoryId }}>
            <Pencil className='size-4' />
            {t('page.category.detail.edit_button')}
          </Link>
        </Button>
      </div>

      <Separator />

      <CategoryForm mode='view' categoryId={resolvedCategoryId} onSubmit={handleFormSubmit} onCancel={handleCancel} />
    </PageContainer>
  );
}
