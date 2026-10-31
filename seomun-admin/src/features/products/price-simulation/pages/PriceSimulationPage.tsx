import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useProductDetailQuery, useProductsQuery } from '@/features/products/management';

import { usePriceSimulationResultQuery, type PriceSimulationREQ } from '../api';
import { PriceSimulationForm } from '../components/PriceSimulationForm';
import { PriceSimulationResults } from '../components/PriceSimulationResults';
import type { PriceSimulationFormValues } from '../types';
import {
  buildSelectedOptionsPayload,
  DEFAULT_BOOK_PAGE_COUNTS,
  findSizeInputOptions,
  getDefaultOptionSelections,
  getOptionGroupId,
  isBookProduct,
  isOptionalGroup,
} from '../utils';

const EMPTY_VALUES: PriceSimulationFormValues = {
  product_id: '',
  option_selections: {},
  quantity: 0,
  multiplier: 0,
  book_page_counts: DEFAULT_BOOK_PAGE_COUNTS,
};

export function PriceSimulationPage() {
  const { t } = useTranslation('page');
  const [values, setValues] = useState<PriceSimulationFormValues>(EMPTY_VALUES);
  const [syncedProductId, setSyncedProductId] = useState<number | undefined>(undefined);

  const {
    data: productsResp,
    isError: isProductsError,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    refetch: refetchProducts,
  } = useProductsQuery({ page: 1, per_page: 100 }, 'ko');

  const products = productsResp?.data.products ?? [];

  // isLoading, not isFetching: a background refetch keeps the cached fields on screen instead of flashing skeletons.
  const { data: productDetailResp, isLoading: isDetailLoading } = useProductDetailQuery(values.product_id, {
    enabled: Boolean(values.product_id),
  });
  const productDetail = productDetailResp?.data.product;

  // Preview the first product's option structure so the setup fields render (disabled) before a product is picked, instead of being hidden.
  const previewProductId = products[0]?.id ?? '';
  const { data: previewDetailResp } = useProductDetailQuery(previewProductId, {
    enabled: Boolean(previewProductId) && !values.product_id,
  });
  const previewDetail = previewDetailResp?.data.product;

  // Reset option selections whenever the resolved product changes (adjusting state while rendering, see https://react.dev/learn/you-might-not-need-an-effect).
  if (productDetail && productDetail.id !== syncedProductId) {
    setSyncedProductId(productDetail.id);
    setValues((prev) => ({
      ...prev,
      option_selections: getDefaultOptionSelections(productDetail.option_groups ?? []),
      quantity: Number(productDetail.quantity_prices?.[0]?.quantity ?? 0),
      multiplier: Number(productDetail.product_sets?.min_set ?? 1),
      book_page_counts: DEFAULT_BOOK_PAGE_COUNTS,
    }));
  }

  const handleChange = (patch: Partial<PriceSimulationFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  };

  const handleReset = () => {
    if (!productDetail) return;

    setValues((prev) => ({
      ...prev,
      option_selections: getDefaultOptionSelections(productDetail.option_groups ?? []),
      quantity: Number(productDetail.quantity_prices?.[0]?.quantity ?? 0),
      multiplier: Number(productDetail.product_sets?.min_set ?? 1),
      book_page_counts: DEFAULT_BOOK_PAGE_COUNTS,
    }));
  };

  const optionGroups = productDetail?.option_groups ?? [];
  const requiredGroupIds = optionGroups.filter((group) => !isOptionalGroup(group)).map(getOptionGroupId);
  const hasAllRequiredSelections = requiredGroupIds.every((groupId) => (values.option_selections[groupId]?.length ?? 0) > 0);
  const canSimulate = Boolean(productDetail) && values.quantity > 0 && values.multiplier > 0 && hasAllRequiredSelections;

  const simulationRequest: PriceSimulationREQ = {
    product_id: Number(values.product_id) || 0,
    quantity_sets: { quantity: values.quantity, multiplier: values.multiplier },
    selected_options: buildSelectedOptionsPayload(values.option_selections),
    input_options: {
      ...findSizeInputOptions(optionGroups, values.option_selections),
      ...(isBookProduct(productDetail) ? values.book_page_counts : {}),
    },
  };

  const { data: result, isFetching: isSimulationLoading } = usePriceSimulationResultQuery(simulationRequest, canSimulate);

  return (
    <PageContainer>
      <div className='flex flex-col gap-2'>
        <h1 className='text-xl font-semibold'>{t('products.price_simulation.title')}</h1>
        {/* <p className='text-muted-foreground text-sm'>{t('products.price_simulation.description')}</p> */}
      </div>

      <Separator />

      {isProductsLoading ? (
        <div className='bg-card flex min-h-64 items-center justify-center gap-3 rounded-xl border text-sm shadow-sm'>
          <Loader2 className='size-5 animate-spin' />
          {t('products.price_simulation.loading_products')}
        </div>
      ) : isProductsError || products.length === 0 ? (
        <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
          <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
            <AlertCircle className='size-6' />
          </div>

          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>{t('products.price_simulation.load_error_title')}</h2>
            <p className='text-muted-foreground text-sm'>{t('products.price_simulation.load_error_description')}</p>
          </div>

          <Button type='button' variant='outline' onClick={() => void refetchProducts()} disabled={isProductsFetching} className='gap-2'>
            {isProductsFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
            {t('products.price_simulation.retry')}
          </Button>
        </div>
      ) : (
        <div className='space-y-4'>
          <PriceSimulationForm
            products={products}
            productDetail={productDetail}
            previewDetail={previewDetail}
            isDetailLoading={isDetailLoading}
            values={values}
            onChange={handleChange}
            onReset={handleReset}
          />
          <PriceSimulationResults result={result} isLoading={isSimulationLoading} />
        </div>
      )}
    </PageContainer>
  );
}
