import { getRouteApi } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';

import { mapCategoryFormToRequest, useUpdateCategoryMutation } from '../api';
import { CategoryForm } from '../form';
import type { CategoryFormData } from '../schemas';
import { getCategoryApiErrorMessage, getCategoryFormApiErrors, type CategoryFormApiErrors } from '../utils';

const routeApi = getRouteApi('/categories/$categoryId_/edit');

export function CategoryEditPage() {
  const { t } = useTranslation();
  const { categoryId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();
  const resolvedCategoryId = Number(categoryId);
  const updateMutation = useUpdateCategoryMutation(resolvedCategoryId);
  const [submissionErrors, setSubmissionErrors] = useState<CategoryFormApiErrors>();

  const handleCancel = () => {
    void navigate({ to: '/categories/$categoryId', params: { categoryId } });
  };

  const handleSubmit = (data: CategoryFormData) => {
    setSubmissionErrors(undefined);
    updateMutation.mutate(mapCategoryFormToRequest(data), {
      onSuccess: () => {
        toast.success(t('page.category.edit.success'));
        void navigate({ to: '/categories/$categoryId', params: { categoryId } });
      },
      onError: (error) => {
        setSubmissionErrors(getCategoryFormApiErrors(error));
        toast.error(getCategoryApiErrorMessage(error, t('page.category.edit.error')));
      },
    });
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.category.edit.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.category.edit.description')}</p> */}
        </div>
      </div>

      <Separator />

      <CategoryForm
        mode='edit'
        categoryId={resolvedCategoryId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateMutation.isPending}
        submissionErrors={submissionErrors}
      />
    </PageContainer>
  );
}
