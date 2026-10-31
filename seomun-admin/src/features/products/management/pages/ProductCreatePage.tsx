import { getRouteApi } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';

import { mapProductFormToRequest, useCreateProductMutation, type ErpOptionGroup } from '../api';
import { ProductForm } from '../components/ProductForm';
import type { ProductFormValues } from '../schemas';

const routeApi = getRouteApi('/products/create');

export function ProductCreatePage() {
  const { t } = useTranslation('page');
  const navigate = routeApi.useNavigate();
  const createMutation = useCreateProductMutation();

  const handleCancel = () => {
    void navigate({ to: '/products', search: (previous) => previous });
  };

  const handleSubmit = (values: ProductFormValues, erpOptionGroups: ErpOptionGroup[], isBookProduct: boolean) => {
    createMutation.mutate(mapProductFormToRequest(values, erpOptionGroups, isBookProduct), {
      onSuccess: () => {
        toast.success(t('products.management.create.messages.success'));
        void navigate({ to: '/products', search: (previous) => previous });
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('products.management.create.messages.error'));
      },
    });
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('products.management.create.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('products.management.create.description')}</p> */}
        </div>
      </div>

      <Separator />

      <ProductForm isPending={createMutation.isPending} onCancel={handleCancel} onSubmit={handleSubmit} />
    </PageContainer>
  );
}
