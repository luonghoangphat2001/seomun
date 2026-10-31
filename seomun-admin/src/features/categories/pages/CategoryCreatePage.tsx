import { getRouteApi } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { FileType } from '@/enums';
import { useUploadFileMutation } from '@/features/system-content/images';

import { mapCategoryFormToRequest, useCreateCategoryMutation } from '../api';
import { CategoryForm } from '../form';
import type { CategoryFormData } from '../schemas';
import { getCategoryApiErrorMessage, getCategoryFormApiErrors, type CategoryFormApiErrors } from '../utils';

const routeApi = getRouteApi('/categories/create');

export function CategoryCreatePage() {
  const { t } = useTranslation();
  const navigate = routeApi.useNavigate();
  const createMutation = useCreateCategoryMutation();
  const uploadImageMutation = useUploadFileMutation(FileType.CATEGORY_EXPOSURE);
  const [submissionErrors, setSubmissionErrors] = useState<CategoryFormApiErrors>();

  const handleCancel = () => {
    void navigate({ to: '/categories' });
  };

  const handleUploadImage = async (file: File) => {
    const uploadedFile = await uploadImageMutation.mutateAsync(file);
    return uploadedFile.url;
  };

  const handleSubmit = (data: CategoryFormData) => {
    setSubmissionErrors(undefined);
    createMutation.mutate(mapCategoryFormToRequest(data), {
      onSuccess: () => {
        toast.success(t('page.category.create.success'));
        void navigate({ to: '/categories' });
      },
      onError: (error) => {
        setSubmissionErrors(getCategoryFormApiErrors(error));
        toast.error(getCategoryApiErrorMessage(error, t('page.category.create.error')));
      },
    });
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.category.create.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.category.create.description')}</p> */}
        </div>
      </div>

      <Separator />

      <CategoryForm
        mode='create'
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createMutation.isPending || uploadImageMutation.isPending}
        isImageUploading={uploadImageMutation.isPending}
        onUploadImage={handleUploadImage}
        submissionErrors={submissionErrors}
      />
    </PageContainer>
  );
}
