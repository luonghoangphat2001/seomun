import { getRouteApi } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { useCategoryListQuery } from '@/features/categories';
import { useDebounce } from '@/hooks/use-debounce';
import { getApiErrorMessage } from '@/utils/api-error';

import { useCustomerListInfiniteQuery } from '../../list';
import { usePromotionalProductsQuery, usePromotionalProductsUpdateMutation } from '../api/customer-exposure.query';
import { ExposureCustomerList } from '../components/ExposureCustomerList';
import { PromotionalProductTable } from '../components/PromotionalProductTable';
import type { CustomerExposureSearch } from '../schemas';

const customerExposureRouteApi = getRouteApi('/customers/exposure');

export function CustomerExposurePage() {
  const { t } = useTranslation();
  const search = customerExposureRouteApi.useSearch();
  const navigate = customerExposureRouteApi.useNavigate();
  const [draftSelectedProductIds, setDraftSelectedProductIds] = useState<number[] | null>(null);
  const selectedCustomerId = search.selected_customer_id ?? null;
  const customerSearchTerm = search.customer_search_term ?? '';
  const productSearchTerm = search.product_search_term ?? '';
  const categorySearchTerm = search.category_search_term ?? '';
  const debouncedCustomerSearchTerm = useDebounce(customerSearchTerm);
  const debouncedProductSearchTerm = useDebounce(productSearchTerm);
  const debouncedCategorySearchTerm = useDebounce(categorySearchTerm);
  const selectedCategoryId = search.selected_category_id;

  const customersQuery = useCustomerListInfiniteQuery({
    per_page: search.customer_per_page ?? 20,
    search_term: debouncedCustomerSearchTerm || undefined,
  });
  const customers = customersQuery.data?.pages.flatMap((page) => page.data.members) ?? [];
  const productsQuery = usePromotionalProductsQuery({
    customer_id: selectedCustomerId ?? 0,
    page: search.product_page ?? 1,
    per_page: search.product_per_page ?? 15,
    search: debouncedProductSearchTerm || undefined,
    category_id: selectedCategoryId,
  });
  const categoriesQuery = useCategoryListQuery({
    page: 1,
    per_page: 20,
    name: debouncedCategorySearchTerm || undefined,
  });
  const updateMutation = usePromotionalProductsUpdateMutation();

  const baseProductIds = useMemo(() => [...(productsQuery.data?.data.promotional_product_ids ?? [])].sort((a, b) => a - b), [productsQuery.data]);
  const selectedProductIds = draftSelectedProductIds ?? baseProductIds;
  const isDirty = JSON.stringify([...selectedProductIds].sort((a, b) => a - b)) !== JSON.stringify(baseProductIds);
  const selectedCustomerName = customers.find((customer) => customer.id === selectedCustomerId)?.name;

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('page.customers.exposure.title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('page.customers.exposure.description')}</p>
      </div>

      <Separator />

      <div className='grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]'>
        <ExposureCustomerList
          customers={customers}
          searchTerm={customerSearchTerm}
          selectedCustomerId={selectedCustomerId}
          isLoading={customersQuery.isLoading}
          isFetchingNextPage={customersQuery.isFetchingNextPage}
          onReachEnd={() => {
            if (customersQuery.hasNextPage && !customersQuery.isFetchingNextPage) void customersQuery.fetchNextPage();
          }}
          onSearchTermChange={(value) =>
            navigate({
              search: (prev: CustomerExposureSearch) => ({
                ...prev,
                customer_search_term: value || undefined,
                customer_page: 1,
              }),
            })
          }
          onSelectCustomer={(customerId) => {
            setDraftSelectedProductIds(null);
            navigate({
              search: (prev: CustomerExposureSearch) => ({
                ...prev,
                selected_customer_id: customerId,
                product_page: 1,
              }),
            });
          }}
        />

        <PromotionalProductTable
          customerName={selectedCustomerName}
          searchTerm={productSearchTerm}
          categorySearchTerm={categorySearchTerm}
          categories={categoriesQuery.data?.data.categories ?? []}
          selectedCategoryId={selectedCategoryId}
          products={productsQuery.data?.data.products ?? []}
          pagination={productsQuery.data?.data.pagination}
          selectedProductIds={selectedProductIds}
          isLoading={productsQuery.isLoading}
          isCategoryLoading={categoriesQuery.isLoading}
          isPending={updateMutation.isPending}
          isDirty={!!selectedCustomerId && isDirty}
          onSearchTermChange={(value) =>
            navigate({
              search: (prev: CustomerExposureSearch) => ({
                ...prev,
                product_search_term: value || undefined,
                product_page: 1,
              }),
            })
          }
          onCategorySearchTermChange={(value) =>
            navigate({
              search: (prev: CustomerExposureSearch) => ({
                ...prev,
                category_search_term: value || undefined,
              }),
            })
          }
          onSelectCategory={(categoryId) =>
            navigate({
              search: (prev: CustomerExposureSearch) => ({
                ...prev,
                selected_category_id: categoryId,
                product_page: 1,
              }),
            })
          }
          onClearCategory={() =>
            navigate({
              search: (prev: CustomerExposureSearch) => ({
                ...prev,
                selected_category_id: undefined,
                product_page: 1,
              }),
            })
          }
          onPageChange={(page) =>
            navigate({
              search: (prev: CustomerExposureSearch) => ({
                ...prev,
                product_page: page,
              }),
            })
          }
          onPerPageChange={(perPage) =>
            navigate({
              search: (prev: CustomerExposureSearch) => ({
                ...prev,
                product_page: 1,
                product_per_page: perPage,
              }),
            })
          }
          onToggleProduct={(productId, checked) =>
            setDraftSelectedProductIds((current) => {
              const source = current ?? baseProductIds;
              if (checked) {
                return source.includes(productId) ? source : [...source, productId];
              }

              return source.filter((id) => id !== productId);
            })
          }
          onSave={() => {
            if (!selectedCustomerId) return;
            updateMutation.mutate(
              {
                customer_id: selectedCustomerId,
                product_ids: selectedProductIds,
              },
              {
                onSuccess: () => {
                  toast.success(t('page.customers.exposure.messages.save_success'));
                  setDraftSelectedProductIds(null);
                },
                onError: (error) => toast.error(getApiErrorMessage(error, t('page.customers.exposure.messages.save_failed'))),
              },
            );
          }}
        />
      </div>
    </PageContainer>
  );
}
