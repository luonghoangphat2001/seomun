import { Calculator, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect, type AppSelectOption } from '@/components/shared/app-select';
import { AppFieldLabel } from '@/components/shared/form-fields';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminProductRESP, ProductListItemRESP } from '@/features/products/management';

import type { PriceSimulationFormValues } from '../types';
import { BOOK_PAGE_COUNT_BY_GROUP_CODE, getOptionGroupId, getOptionId, isBookProduct, isOptionalGroup, isPostProcessingGroup } from '../utils';

interface PriceSimulationFormProps {
  products: ProductListItemRESP[];
  productDetail?: AdminProductRESP;
  previewDetail?: AdminProductRESP;
  isDetailLoading: boolean;
  values: PriceSimulationFormValues;
  onChange: (patch: Partial<PriceSimulationFormValues>) => void;
  onReset: () => void;
}

function FieldSkeletons({ count }: { count: number }) {
  return Array.from({ length: count }).map((_, index) => (
    <div className='space-y-2' key={index}>
      <Skeleton className='h-4 w-24' />
      <Skeleton className='h-9 w-full' />
    </div>
  ));
}

export function PriceSimulationForm({
  products,
  productDetail,
  previewDetail,
  isDetailLoading,
  values,
  onChange,
  onReset,
}: PriceSimulationFormProps) {
  const { t } = useTranslation('page');

  const groupLabel = (code: string, fallback: string) => t(`products.price_simulation.setup.groups.${code}`, { defaultValue: fallback });

  const productOptions: AppSelectOption[] = products.map((product) => {
    const nameEn = product.product_name_en !== product.product_name ? product.product_name_en : null;

    return {
      value: product.id,
      label: nameEn ? `${product.product_name} - ${nameEn}` : product.product_name,
      description: product.product_code !== '-' ? product.product_code : undefined,
    };
  });

  const selectedProduct = products.find((product) => product.id === values.product_id);
  const hasProduct = Boolean(productDetail) && !isDetailLoading;

  // Render field skeletons from the preview product when nothing is selected yet, instead of hiding the fields entirely.
  const displayDetail = productDetail ?? previewDetail;
  const optionGroups = displayDetail?.option_groups ?? [];
  const requiredGroups = [...optionGroups].filter((group) => !isPostProcessingGroup(group)).sort((a, b) => a.sort_order - b.sort_order);
  const postProcessingGroups = [...optionGroups].filter(isPostProcessingGroup).sort((a, b) => a.sort_order - b.sort_order);
  const quantityPrices = displayDetail?.quantity_prices ?? [];
  const productSets = displayDetail?.product_sets;
  const isBook = isBookProduct(displayDetail);

  const updateOptionSelections = (groupId: number, optionIds: number[]) => {
    onChange({ option_selections: { ...values.option_selections, [groupId]: optionIds } });
  };

  const selectAProductFirst = t('products.price_simulation.setup.select_a_product_first');

  const selectedPostProcessingCount = postProcessingGroups.reduce((count, group) => {
    if (!hasProduct) return count;
    return count + (values.option_selections[getOptionGroupId(group)]?.length ?? 0);
  }, 0);

  return (
    <Card>
      <CardHeader className='flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-1'>
          <CardTitle>{t('products.price_simulation.setup.title')}</CardTitle>
          <p className='text-muted-foreground text-sm'>{t('products.price_simulation.setup.description')}</p>
        </div>

        <AppButton type='button' variant='ghost' className='gap-2 self-start' leftIcon={<RotateCcw className='size-4' />} onClick={onReset}>
          {t('products.price_simulation.setup.reset')}
        </AppButton>
      </CardHeader>

      <CardContent className='space-y-6'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <AppFieldLabel htmlFor='price-simulation-product' label={t('products.price_simulation.setup.fields.product')} />
              <AppSelect
                id='price-simulation-product'
                value={values.product_id || undefined}
                onValueChange={(productId) => productId && onChange({ product_id: productId })}
                options={productOptions}
                placeholder={t('products.price_simulation.setup.placeholders.select_product')}
                searchable
              />
            </div>

            {isDetailLoading ? (
              <FieldSkeletons count={Math.max(requiredGroups.length + 1, 4)} />
            ) : (
              <>
                {requiredGroups.map((group) => {
                  const groupId = getOptionGroupId(group);
                  const selectedOptionId = hasProduct ? values.option_selections[groupId]?.[0] : undefined;
                  const label = groupLabel(group.code, group.name);
                  const pageCountField = isBook ? BOOK_PAGE_COUNT_BY_GROUP_CODE[group.code] : undefined;

                  const groupSelect = (
                    <AppSelect
                      id={`price-simulation-group-${groupId}`}
                      className={pageCountField ? 'flex-1' : undefined}
                      value={selectedOptionId !== undefined ? String(selectedOptionId) : undefined}
                      onValueChange={(optionIdStr) => updateOptionSelections(groupId, optionIdStr ? [Number(optionIdStr)] : [])}
                      options={group.options.map((option) => ({
                        value: String(getOptionId(option)),
                        label: option.label,
                      }))}
                      placeholder={
                        hasProduct ? t('products.price_simulation.setup.placeholders.select_group', { group: label }) : selectAProductFirst
                      }
                      disabled={!hasProduct}
                      searchable
                      clearable={isOptionalGroup(group)}
                    />
                  );

                  return (
                    <div className='space-y-2' key={groupId}>
                      <AppFieldLabel htmlFor={`price-simulation-group-${groupId}`} label={label} />

                      {pageCountField ? (
                        <div className='flex gap-2'>
                          {groupSelect}
                          <AppInput
                            id={`price-simulation-${pageCountField}`}
                            type='number'
                            className='w-28'
                            min={0}
                            value={hasProduct ? String(values.book_page_counts[pageCountField]) : ''}
                            onValueChange={(value) =>
                              onChange({ book_page_counts: { ...values.book_page_counts, [pageCountField]: Number(value) || 0 } })
                            }
                            suffix={t('products.price_simulation.setup.page_unit')}
                            disabled={!hasProduct}
                          />
                        </div>
                      ) : (
                        groupSelect
                      )}
                    </div>
                  );
                })}

                <div className='space-y-2'>
                  <AppFieldLabel htmlFor='price-simulation-quantity' label={t('products.price_simulation.setup.fields.quantity_cases')} />
                  <div className='flex gap-2'>
                    <AppSelect
                      id='price-simulation-quantity'
                      className='flex-1'
                      value={hasProduct && values.quantity ? String(values.quantity) : undefined}
                      onValueChange={(quantity) => quantity && onChange({ quantity: Number(quantity) })}
                      options={quantityPrices.map((quantityPrice) => ({
                        value: String(quantityPrice.quantity),
                        label: t('products.price_simulation.setup.quantity_sheets', { quantity: quantityPrice.quantity }),
                      }))}
                      placeholder={hasProduct ? t('products.price_simulation.setup.placeholders.select_quantity') : selectAProductFirst}
                      disabled={!hasProduct}
                    />
                    <AppInput
                      id='price-simulation-multiplier'
                      type='number'
                      className='w-28'
                      value={hasProduct ? String(values.multiplier) : ''}
                      min={Number(productSets?.min_set ?? 1)}
                      max={productSets?.max_set != null ? Number(productSets.max_set) : undefined}
                      step={Number(productSets?.step_set ?? 1)}
                      onValueChange={(value) => onChange({ multiplier: Number(value) || 0 })}
                      suffix={t('products.price_simulation.setup.case_unit')}
                      disabled={!hasProduct}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className='bg-muted/30 flex min-h-64 items-center justify-center rounded-xl border p-4'>
            {selectedProduct ? (
              <div className='space-y-3 text-center'>
                <div className='bg-background mx-auto flex size-44 items-center justify-center overflow-hidden rounded-lg border'>
                  {selectedProduct.thumbnail_url ? (
                    <img src={selectedProduct.thumbnail_url} alt={selectedProduct.product_name} className='size-full object-contain p-3' />
                  ) : null}
                </div>
                <p className='text-sm font-medium'>{selectedProduct.product_name}</p>
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>{t('products.price_simulation.setup.no_product_selected')}</p>
            )}
          </div>
        </div>

        <Separator />

        <div className='space-y-3'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
                <Calculator className='size-4' />
              </div>
              <h3 className='text-sm font-semibold'>{t('products.price_simulation.setup.post_processing.title')}</h3>
            </div>

            {selectedPostProcessingCount > 0 ? (
              <Badge variant='secondary'>
                {t('products.price_simulation.setup.post_processing.selected_count', { count: selectedPostProcessingCount })}
              </Badge>
            ) : null}
          </div>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {isDetailLoading ? <FieldSkeletons count={Math.max(postProcessingGroups.length, 3)} /> : null}

            {isDetailLoading
              ? null
              : postProcessingGroups.map((group) => {
                  const groupId = getOptionGroupId(group);
                  const selectedOptionId = hasProduct ? values.option_selections[groupId]?.[0] : undefined;
                  const label = groupLabel(group.code, group.name);

                  return (
                    <div className='space-y-2' key={groupId}>
                      <AppFieldLabel htmlFor={`price-simulation-post-processing-${groupId}`} label={label} />
                      <AppSelect
                        id={`price-simulation-post-processing-${groupId}`}
                        value={selectedOptionId !== undefined ? String(selectedOptionId) : undefined}
                        onValueChange={(optionIdStr) => updateOptionSelections(groupId, optionIdStr ? [Number(optionIdStr)] : [])}
                        options={group.options.map((option) => ({
                          value: String(getOptionId(option)),
                          label: option.label,
                        }))}
                        placeholder={
                          hasProduct ? t('products.price_simulation.setup.placeholders.select_group', { group: label }) : selectAProductFirst
                        }
                        disabled={!hasProduct}
                        searchable
                        clearable
                      />
                    </div>
                  );
                })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
