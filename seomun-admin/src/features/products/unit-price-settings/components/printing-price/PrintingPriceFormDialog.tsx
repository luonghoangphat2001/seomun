import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField, AppSelectFormField, AppSwitchFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/utils/api-error';

import type { PrintingPrice } from '../../api';
import { useCreatePrintingPriceMutation, usePrintingPriceItemsQuery, useUpdatePrintingPriceMutation } from '../../api';
import {
  getBookPrintingSizeTypeOptions,
  getBookPrintingTypeOptions,
  getPaperSizeDivisionCodeOptions,
  getPrintingMachineTypeOptions,
  getPrintSideTypeOptions,
} from '../../constants';
import type { PaperSizeDivisionCode } from '../../enums';
import {
  createPrintingPriceFormSchema,
  getEmptyPrintingPriceItem,
  getPrintingPriceFormDefaults,
  type PrintingPriceFormValues,
} from '../../schemas/printing-price-form.schema';

const BLOCKED_NUMBER_KEYS = ['e', 'E', '+', '-'];
const ITEMS_PAGE_SIZE = 10;

function blockInvalidNumberKeys(event: KeyboardEvent<HTMLInputElement>) {
  if (BLOCKED_NUMBER_KEYS.includes(event.key)) {
    event.preventDefault();
  }
}

type PrintingPriceFormDialogProps = {
  isOpen: boolean;
  editPrintingPrice?: PrintingPrice;
  onClose: () => void;
};

export function PrintingPriceFormDialog({ isOpen, editPrintingPrice, onClose }: PrintingPriceFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = editPrintingPrice !== undefined;

  const schema = useMemo(() => createPrintingPriceFormSchema(t), [t]);

  const { control, handleSubmit, reset } = useForm<PrintingPriceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getPrintingPriceFormDefaults(),
  });
  const itemsFieldArray = useFieldArray({ control, name: 'items' });

  const [visibleItemCount, setVisibleItemCount] = useState(ITEMS_PAGE_SIZE);
  const itemsScrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: itemsData, isLoading: isItemsLoading } = usePrintingPriceItemsQuery(isOpen && editPrintingPrice ? editPrintingPrice.id : null);

  const machineTypeOptions = useMemo(() => getPrintingMachineTypeOptions(t), [t]);
  const sizeTypeOptions = useMemo(() => getBookPrintingSizeTypeOptions(t), [t]);
  const paperSizeDivisionOptions = useMemo(() => getPaperSizeDivisionCodeOptions(t), [t]);
  const sideTypeOptions = useMemo(() => getPrintSideTypeOptions(t), [t]);
  const printingTypeOptions = useMemo(() => getBookPrintingTypeOptions(t), [t]);

  const createMutation = useCreatePrintingPriceMutation({
    onSuccess: () => {
      toast.success(t('page.products.unit_price_settings.printing_price.dialog.create_success', 'Printing price created successfully.'));
      onClose();
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, t('page.products.unit_price_settings.printing_price.dialog.create_error', 'Failed to create printing price.')),
      ),
  });

  const updateMutation = useUpdatePrintingPriceMutation({
    onSuccess: () => {
      toast.success(t('page.products.unit_price_settings.printing_price.dialog.update_success', 'Printing price updated successfully.'));
      onClose();
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, t('page.products.unit_price_settings.printing_price.dialog.update_error', 'Failed to update printing price.')),
      ),
  });

  useEffect(() => {
    if (!isOpen) return;

    setVisibleItemCount(ITEMS_PAGE_SIZE);

    if (editPrintingPrice) {
      reset({
        name: editPrintingPrice.name,
        machine_type: editPrintingPrice.machine_type,
        book_printing_size_type: editPrintingPrice.book_printing_size_type,
        paper_size_division_code: editPrintingPrice.paper_size_division_code,
        side_type: editPrintingPrice.side_type ?? '',
        book_printing_type: editPrintingPrice.book_printing_type ?? '',
        is_hot_deal: editPrintingPrice.is_hot_deal,
        items: [getEmptyPrintingPriceItem()],
      });
    } else {
      reset(getPrintingPriceFormDefaults());
    }
  }, [isOpen, editPrintingPrice, reset]);

  useEffect(() => {
    if (!itemsData) return;

    // Sort once on load only — sorting live would reshuffle rows while the user types.
    const items = [...itemsData.data.items].sort((a, b) => a.quantity - b.quantity);
    itemsFieldArray.replace(
      items.length
        ? items.map((item) => ({
            id: item.id,
            quantity: String(item.quantity),
            supply_price: String(item.supply_price),
            cost: String(item.cost),
          }))
        : [getEmptyPrintingPriceItem()],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsData]);

  useEffect(() => {
    const scrollRoot = itemsScrollRef.current;
    const sentinel = sentinelRef.current;
    if (!scrollRoot || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleItemCount((count) => Math.min(count + ITEMS_PAGE_SIZE, itemsFieldArray.fields.length));
        }
      },
      { root: scrollRoot, rootMargin: '80px', threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [itemsFieldArray.fields.length]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: PrintingPriceFormValues) => {
    const payload = {
      name: values.name,
      machine_type: values.machine_type,
      book_printing_size_type: values.book_printing_size_type,
      paper_size_division_code: values.paper_size_division_code as PaperSizeDivisionCode,
      side_type: values.side_type || null,
      book_printing_type: values.book_printing_type || null,
      is_hot_deal: values.is_hot_deal,
      items: values.items.map((item) => ({
        id: item.id,
        quantity: Number(item.quantity),
        supply_price: Number(item.supply_price),
        cost: Number(item.cost),
      })),
    };

    if (isEdit) {
      updateMutation.mutate({ id: editPrintingPrice.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('page.products.unit_price_settings.printing_price.dialog.edit_title', 'Edit printing price')
              : t('page.products.unit_price_settings.printing_price.dialog.create_title', 'Add printing price')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
          <AppInputFormField
            name='name'
            control={control}
            label={t('page.products.unit_price_settings.printing_price.dialog.name', 'Name')}
            placeholder={t('page.products.unit_price_settings.printing_price.dialog.name_placeholder', 'Standard Printing Price')}
            required
          />

          <div className='grid grid-cols-2 gap-4'>
            <AppSelectFormField
              name='machine_type'
              control={control}
              label={t('page.products.unit_price_settings.printing_price.dialog.machine_type', 'Machine type')}
              placeholder={t('page.products.unit_price_settings.printing_price.dialog.machine_type_placeholder', 'Select machine type')}
              options={machineTypeOptions}
              required
            />

            <AppSelectFormField
              name='book_printing_size_type'
              control={control}
              label={t('page.products.unit_price_settings.printing_price.dialog.size_type', 'Size type')}
              placeholder={t('page.products.unit_price_settings.printing_price.dialog.size_type_placeholder', 'Select size type')}
              options={sizeTypeOptions}
              required
            />

            <AppSelectFormField
              name='paper_size_division_code'
              control={control}
              label={t('page.products.unit_price_settings.paper_price.dialog.paper_size', 'Paper size')}
              placeholder={t('page.products.unit_price_settings.paper_price.dialog.paper_size_select_placeholder', 'Select paper size')}
              options={paperSizeDivisionOptions}
              required
            />

            <AppSelectFormField
              name='side_type'
              control={control}
              label={t('page.products.unit_price_settings.printing_price.dialog.side_type', 'Side type')}
              placeholder={t('page.products.unit_price_settings.printing_price.dialog.side_type_placeholder', 'Select side type')}
              options={sideTypeOptions}
              clearable
            />

            <AppSelectFormField
              name='book_printing_type'
              control={control}
              label={t('page.products.unit_price_settings.printing_price.dialog.printing_type', 'Printing type')}
              placeholder={t('page.products.unit_price_settings.printing_price.dialog.printing_type_placeholder', 'Select printing type')}
              options={printingTypeOptions}
              clearable
            />
          </div>

          <AppSwitchFormField
            name='is_hot_deal'
            control={control}
            label={t('page.products.unit_price_settings.printing_price.dialog.is_hot_deal', 'Hot deal')}
            description={t(
              'page.products.unit_price_settings.printing_price.dialog.is_hot_deal_description',
              'Highlight this printing price as a promotional deal.',
            )}
          />

          <Separator />

          <div className='space-y-3'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>{t('page.products.unit_price_settings.printing_price.dialog.items_title', 'Quantity tiers')}</p>
              <p className='text-muted-foreground text-xs'>
                {t(
                  'page.products.unit_price_settings.printing_price.dialog.items_description',
                  'Add at least one quantity tier with its supply price and cost.',
                )}
              </p>
            </div>

            {isEdit && isItemsLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className='h-24 rounded-lg' />
                ))}
              </div>
            ) : (
              <div ref={itemsScrollRef} className='max-h-64 space-y-3 overflow-y-auto pr-1'>
                {itemsFieldArray.fields.slice(0, visibleItemCount).map((field, index) => (
                  <div key={field.id} className='grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1fr_auto]'>
                    <AppInputFormField
                      name={`items.${index}.quantity`}
                      control={control}
                      label={t('page.products.unit_price_settings.printing_price.dialog.item_quantity', 'Quantity')}
                      type='number'
                      min={0}
                      onKeyDown={blockInvalidNumberKeys}
                      required
                    />
                    <AppInputFormField
                      name={`items.${index}.supply_price`}
                      control={control}
                      label={t('page.products.unit_price_settings.printing_price.dialog.item_supply_price', 'Supply price')}
                      type='number'
                      min={0}
                      suffix='원'
                      onKeyDown={blockInvalidNumberKeys}
                      required
                    />
                    <AppInputFormField
                      name={`items.${index}.cost`}
                      control={control}
                      label={t('page.products.unit_price_settings.printing_price.dialog.item_cost', 'Cost')}
                      type='number'
                      min={0}
                      suffix='원'
                      onKeyDown={blockInvalidNumberKeys}
                      required
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='mt-6'
                      onClick={() => itemsFieldArray.remove(index)}
                      disabled={itemsFieldArray.fields.length <= 1}
                      aria-label={t('page.products.unit_price_settings.printing_price.dialog.remove_item', 'Remove')}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                ))}

                {visibleItemCount < itemsFieldArray.fields.length ? <div ref={sentinelRef} className='h-1' /> : null}
              </div>
            )}

            <Button
              type='button'
              variant='outline'
              size='sm'
              className='gap-1.5'
              onClick={() => {
                itemsFieldArray.prepend(getEmptyPrintingPriceItem());
                setVisibleItemCount((count) => count + 1);
              }}
            >
              <Plus className='size-4' />
              {t('page.products.unit_price_settings.printing_price.dialog.add_item', 'Add tier')}
            </Button>
          </div>

          <div className='flex justify-end gap-2 border-t pt-4'>
            <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
              {t('common.action.cancel')}
            </Button>
            <AppButton type='submit' isLoading={isPending}>
              {t('common.action.save')}
            </AppButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
