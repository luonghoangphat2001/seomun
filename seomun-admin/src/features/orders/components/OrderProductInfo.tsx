import { Download, FileIcon, UploadCloud } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatKrw } from '@/utils/format-currency';
import { formatLocalDateTime } from '@/utils/format-date';
import { SOURCE_TYPE } from '@/enums';

import type { OrderItem, ProductInformationItem } from '../api/order.response';
import { OrderStatus } from '../enums';
import { ResubmitFileModal } from './ResubmitFileModal';

const RESUBMITTABLE_ORDER_STATUSES = new Set<string>([
  OrderStatus.DRAFT,
  OrderStatus.PENDING,
  OrderStatus.AWAITING_PAYMENT,
  OrderStatus.CONFIRMED,
  OrderStatus.PURCHASE_CONFIRMED,
  OrderStatus.PENDING_RECEPTION,
  OrderStatus.FILE_ERROR,
  OrderStatus.PENDING_CORRECTION,
]);

interface OrderProductInfoProps {
  items: ProductInformationItem[];
  orderItems?: OrderItem[];
  orderNumber?: string;
  orderStatus?: string;
  productImage?: string | null;
}

function getDesignFile(item: ProductInformationItem) {
  const design = item.configuration?.design;
  const designGroup = design?.design_group;

  if (!design || !designGroup) return null;

  if (designGroup.source_type === SOURCE_TYPE.UPLOAD_FILE) {
    const fileDesign = design.file_design;
    return fileDesign?.url ? { name: fileDesign.name, url: fileDesign.url } : null;
  }

  if (designGroup.source_type === SOURCE_TYPE.WEB_EDITOR) {
    return designGroup.preview_pdf_url ? { name: designGroup.title, url: designGroup.preview_pdf_url } : null;
  }

  return null;
}

function getDesignPreview(item: ProductInformationItem, orderItem?: OrderItem, productImage?: string | null) {
  const design = item.configuration?.design;
  const sourceType = design?.design_group?.source_type;

  if (sourceType === SOURCE_TYPE.UPLOAD_FILE) {
    return { imageUrl: orderItem?.product_snapshot.first_image ?? productImage ?? null, sourceType };
  }
  if (sourceType === SOURCE_TYPE.WEB_EDITOR) return { imageUrl: design?.editor_design.front?.preview_image_path ?? null, sourceType };

  return { imageUrl: null, sourceType: null };
}

function getOrderItem(item: ProductInformationItem, index: number, orderItems: OrderItem[]) {
  const orderItemId = item.order_item_id ?? item.id;
  return orderItems.find((orderItem) => orderItem.id === orderItemId) ?? orderItems[index];
}

export function OrderProductInfo({ items, orderItems = [], orderNumber, orderStatus, productImage }: OrderProductInfoProps) {
  const { t } = useTranslation('page');
  const { t: tc } = useTranslation('common');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [resubmitItem, setResubmitItem] = useState<OrderItem | null>(null);
  const canResubmit = Boolean(orderNumber && orderStatus && RESUBMITTABLE_ORDER_STATUSES.has(orderStatus));

  const getOptionGroupLabel = (groupName: string) =>
    groupName.toLowerCase() === 'paper' ? t('orders.detail.product_info.option_group.paper') : groupName;

  return (
    <div className='bg-card @container overflow-hidden rounded-xl border p-4 shadow-sm'>
      <h3 className='mb-4 text-lg font-semibold'>{t('orders.detail.product_info.title')}</h3>

      {items.length === 0 ? (
        <p className='text-muted-foreground py-6 text-center'>{t('orders.detail.product_info.empty')}</p>
      ) : (
        <div className='space-y-4'>
          {items.map((item, index) => {
            const designFile = getDesignFile(item);
            const orderItem = getOrderItem(item, index, orderItems);
            const { imageUrl, sourceType } = getDesignPreview(item, orderItem, productImage);
            const proofStatus = orderItem?.metadata?.proof_status;
            const confirmedFile = orderItem?.design.confirmed_file;
            const isResubmitDisabled = !canResubmit || !orderItem || proofStatus === 'confirmed';
            const resubmissions = [...(orderItem?.metadata?.file_resubmissions ?? [])].sort(
              (first, second) => new Date(second.submitted_at).getTime() - new Date(first.submitted_at).getTime(),
            );

            return (
              <article key={item.order_item_id ?? item.id} className='overflow-hidden rounded-lg border'>
                <div className='flex flex-col gap-4 p-4 @2xl:flex-row @2xl:items-start @2xl:justify-between'>
                  <div className='flex min-w-0 flex-1 gap-4'>
                    <div className='bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md'>
                      {imageUrl ? (
                        <button
                          type='button'
                          onClick={() => setPreviewImage({ url: imageUrl, title: item.title })}
                          className='size-full cursor-zoom-in'
                          title={item.title}
                        >
                          <img src={imageUrl} alt={item.title} className='size-full object-cover' />
                        </button>
                      ) : (
                        <FileIcon className='text-muted-foreground size-5' />
                      )}
                    </div>

                    <div className='@container min-w-0 flex-1 space-y-2'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h4 className='font-semibold'>{item.title}</h4>
                        <Badge variant='outline'>{sourceType ? t(`orders.detail.product_info.source_type.${sourceType}`) : tc('none')}</Badge>
                        {proofStatus ? (
                          <Badge
                            variant='secondary'
                            className={
                              proofStatus === 'confirmed'
                                ? 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                : undefined
                            }
                          >
                            {t('orders.detail.product_info.proof_status')}: {t(`orders.detail.product_info.proof_status_value.${proofStatus}`)}
                          </Badge>
                        ) : null}
                      </div>
                      <div className='space-y-3 text-sm'>
                        <dl className='grid gap-x-6 gap-y-2 @xs:grid-cols-2 @md:grid-cols-3'>
                          <div>
                            <dt className='text-muted-foreground'>{t('orders.detail.product_info.quantity')}</dt>
                            <dd>{`${item.quantity}매 x ${item.multiplier}건`}</dd>
                          </div>
                          <div className='min-w-0'>
                            <dt className='text-muted-foreground'>{t('orders.detail.product_info.design_file')}</dt>
                            <dd>
                              {designFile ? (
                                <Button variant='link' size='sm' className='h-auto max-w-full gap-2 p-0' asChild>
                                  <a href={designFile.url} download={designFile.name} target='_blank' rel='noreferrer' title={designFile.name}>
                                    <FileIcon className='size-4 shrink-0' />
                                    <span className='truncate'>{designFile.name}</span>
                                    <Download className='size-4 shrink-0' />
                                  </a>
                                </Button>
                              ) : (
                                tc('none')
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className='text-muted-foreground'>{t('orders.detail.product_info.subtotal')}</dt>
                            <dd className='font-semibold'>{formatKrw(Math.round(Number(item.total_price) + Number(item.total_price) * 0.1))}</dd>
                          </div>
                        </dl>

                        <div>
                          <p className='text-muted-foreground mb-1.5'>{t('orders.detail.product_info.options')}</p>

                          {item.options?.options?.length ? (
                            <dl className='grid grid-cols-[minmax(0,max-content)_minmax(7rem,1fr)] gap-x-4 gap-y-1 border-l-2 pl-3'>
                              {item.options.options.map(({ group, option }) => (
                                <Fragment key={group.code || group.id}>
                                  <dt className='text-muted-foreground'>{getOptionGroupLabel(group.name)}</dt>
                                  <dd className='wrap-break-word'>{option.label}</dd>
                                </Fragment>
                              ))}
                            </dl>
                          ) : (
                            <p className='text-muted-foreground'>{tc('none')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {orderNumber ? (
                    <Button className='shrink-0 gap-2' onClick={() => orderItem && setResubmitItem(orderItem)} disabled={isResubmitDisabled}>
                      <UploadCloud className='size-4' />
                      {t('orders.detail.design.resubmit.button')}
                    </Button>
                  ) : null}
                </div>

                {confirmedFile ? (
                  <div className='border-t bg-emerald-50/50 p-4 dark:bg-emerald-950/20'>
                    <h5 className='mb-3 text-sm font-medium'>{t('orders.detail.product_info.confirmed_file')}</h5>
                    <div className='flex flex-col gap-2 text-sm @xl:flex-row @xl:items-center @xl:justify-between'>
                      <a
                        href={confirmedFile.url}
                        download={confirmedFile.name}
                        target='_blank'
                        rel='noreferrer'
                        className='text-primary inline-flex min-w-0 items-center gap-2 font-medium hover:underline'
                        title={confirmedFile.name}
                      >
                        <FileIcon className='size-4 shrink-0' />
                        <span className='truncate'>{confirmedFile.name}</span>
                        <Download className='size-4 shrink-0' />
                      </a>
                      <time className='text-muted-foreground shrink-0 text-xs'>
                        {t('orders.detail.product_info.confirmed_at')}: {formatLocalDateTime(confirmedFile.confirmed_at)}
                      </time>
                    </div>
                  </div>
                ) : null}

                <div className='bg-muted/20 border-t p-4'>
                  <h5 className='mb-3 text-sm font-medium'>{t('orders.detail.product_info.resubmission_history')}</h5>
                  {resubmissions.length === 0 ? (
                    <p className='text-muted-foreground text-sm'>{t('orders.detail.product_info.resubmission_empty')}</p>
                  ) : (
                    <ul className='space-y-2'>
                      {resubmissions.map((resubmission) => (
                        <li
                          key={`${resubmission.file_url}-${resubmission.submitted_at}`}
                          className='bg-background flex flex-col gap-2 rounded-md border p-3 text-sm @xl:flex-row @xl:items-center @xl:justify-between'
                        >
                          <div className='min-w-0'>
                            <a
                              href={resubmission.file_url}
                              download={resubmission.file_name}
                              target='_blank'
                              rel='noreferrer'
                              className='text-primary inline-flex max-w-full items-center gap-2 font-medium hover:underline'
                              title={resubmission.file_name}
                            >
                              <FileIcon className='size-4 shrink-0' />
                              <span className='truncate'>{resubmission.file_name}</span>
                              <Download className='size-4 shrink-0' />
                            </a>
                            {resubmission.note ? <p className='text-muted-foreground mt-1 whitespace-pre-wrap'>{resubmission.note}</p> : null}
                          </div>
                          <time className='text-muted-foreground shrink-0 text-xs'>{formatLocalDateTime(resubmission.submitted_at)}</time>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ResubmitFileModal
        open={Boolean(resubmitItem)}
        onOpenChange={(open) => !open && setResubmitItem(null)}
        orderNumber={orderNumber ?? ''}
        orderItemId={resubmitItem?.id ?? 0}
      />

      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className='w-fit max-w-[calc(100vw-2rem)] bg-white p-3 sm:max-w-[90vw]' overlayClassName='bg-black/50 backdrop-blur-none'>
          <DialogTitle className='sr-only'>{previewImage?.title}</DialogTitle>
          {previewImage ? (
            <div className='h-[min(calc(90vh-4rem),36rem)] w-[min(calc(100vw-3.5rem),45rem)]'>
              <img src={previewImage.url} alt={previewImage.title} className='size-full rounded-lg object-contain' />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
