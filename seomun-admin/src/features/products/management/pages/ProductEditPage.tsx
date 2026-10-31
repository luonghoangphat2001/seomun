import { getRouteApi } from '@tanstack/react-router';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { mapProductDetailToFormValues, mapProductFormToRequest, useProductDetailQuery, useUpdateProductMutation, type ErpOptionGroup } from '../api';
import { ProductForm } from '../components/ProductForm';
import type { ProductFormValues } from '../schemas';

const routeApi = getRouteApi('/products/$productId_/edit');

export function ProductEditPage() {
  const { t } = useTranslation('page');
  const { productId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();
  const detailQuery = useProductDetailQuery(productId);
  const updateMutation = useUpdateProductMutation(productId);

  const defaultValues = useMemo(() => {
    const product = detailQuery.data?.data.product;
    return product ? mapProductDetailToFormValues(product) : undefined;
  }, [detailQuery.data?.data.product]);

  const handleCancel = () => {
    void navigate({ to: '/products', search: (previous) => previous });
  };

  const handleSubmit = (values: ProductFormValues, erpOptionGroups: ErpOptionGroup[], isBookProduct: boolean) => {
    updateMutation.mutate(mapProductFormToRequest(values, erpOptionGroups, isBookProduct), {
      onSuccess: () => {
        toast.success(t('products.management.edit.messages.success'));
        // void navigate({ to: '/products', search: (previous) => previous });
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('products.management.edit.messages.error'));
      },
    });
  };

  const renderContent = () => {
    if (detailQuery.isLoading) {
      return (
        <div className='bg-card flex min-h-64 items-center justify-center gap-2 rounded-xl border text-sm'>
          <Loader2 className='size-4 animate-spin' />
          {t('products.management.edit.loading')}
        </div>
      );
    }

    if (detailQuery.isError || !defaultValues) {
      return (
        <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
          <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
            <AlertCircle className='size-6' />
          </div>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>{t('products.management.edit.messages.load_error_title')}</h2>
            <p className='text-muted-foreground text-sm'>{t('products.management.edit.messages.load_error_description')}</p>
          </div>
          <Button type='button' variant='outline' onClick={() => void detailQuery.refetch()} disabled={detailQuery.isFetching}>
            {t('products.management.edit.retry')}
          </Button>
        </div>
      );
    }

    return (
      <ProductForm mode='edit' defaultValues={defaultValues} isPending={updateMutation.isPending} onCancel={handleCancel} onSubmit={handleSubmit} />
    );
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('products.management.edit.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('products.management.edit.description')}</p> */}
        </div>
      </div>

      <Separator />

      {renderContent()}
    </PageContainer>
  );
}
