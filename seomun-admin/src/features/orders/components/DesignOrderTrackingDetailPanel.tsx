import { AlertCircle, Download, ExternalLink, FileIcon, Loader2, Send, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getApiErrorMessage } from '@/utils/api-error';
import { useAssignedDesignDetailQuery, useSendDesignReviewMutation, useUploadDratfDesignFileMutation } from '../api';
import type { AssignedDesignDetailItem } from '../api/order.response';
import { ORDER_STATUS_LABELS } from '../constants';
import { AssignedDesignStatus, CustomerReviewStatus, type OrderStatus } from '../enums';
import { OrderInfoCard, OrderInfoRow } from './OrderInfoCard';

type DesignOrderTrackingDetailPanelProps = {
  orderNumber: string;
};

function getLatestVersionId(item: AssignedDesignDetailItem) {
  return item.versions.reduce<AssignedDesignDetailItem['versions'][number] | null>(
    (latest, version) => (!latest || new Date(version.submitted_at).getTime() > new Date(latest.submitted_at).getTime() ? version : latest),
    null,
  )?.id;
}

function sortVersionsByNewest(item: AssignedDesignDetailItem) {
  return [...item.versions].sort((first, second) => {
    const submittedAtDifference = new Date(second.submitted_at).getTime() - new Date(first.submitted_at).getTime();

    return Number.isNaN(submittedAtDifference) || submittedAtDifference === 0 ? second.version - first.version : submittedAtDifference;
  });
}

const DESIGN_STATUS_CLASSES: Record<AssignedDesignStatus, string> = {
  [AssignedDesignStatus.PENDING_ASSIGNMENT]: 'border-slate-200 bg-slate-100 text-slate-700',
  [AssignedDesignStatus.ASSIGNED]: 'border-blue-200 bg-blue-50 text-blue-700',
  [AssignedDesignStatus.IN_PROGRESS]: 'border-violet-200 bg-violet-50 text-violet-700',
  [AssignedDesignStatus.CUSTOMER_REVIEW]: 'border-amber-200 bg-amber-50 text-amber-700',
  [AssignedDesignStatus.REVISION_REQUESTED]: 'border-rose-200 bg-rose-50 text-rose-700',
  [AssignedDesignStatus.CUSTOMER_APPROVED]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const CUSTOMER_RESPONSE_CLASSES: Record<CustomerReviewStatus, string> = {
  [CustomerReviewStatus.PENDING]: 'border-slate-200 bg-slate-100 text-slate-700',
  [CustomerReviewStatus.APPROVED]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  [CustomerReviewStatus.REJECTED]: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function DesignOrderTrackingDetailPanel({ orderNumber }: DesignOrderTrackingDetailPanelProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { data: response, isLoading, isError, isFetching, refetch } = useAssignedDesignDetailQuery(orderNumber);
  const uploadDraftMutation = useUploadDratfDesignFileMutation();
  const sendReviewMutation = useSendDesignReviewMutation();
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const detail = response?.data;
  const latestVersionIds = detail?.items.map(getLatestVersionId).filter((id): id is number => id !== undefined) ?? [];
  const hasDraftForEveryItem = Boolean(detail?.items.length) && latestVersionIds.length === detail?.items.length;
  const isUploadDisabled = isFetching || uploadDraftMutation.isPending || sendReviewMutation.isPending;
  const relatedOrderStatus = detail ? (ORDER_STATUS_LABELS[detail.order_status as OrderStatus]?.(t) ?? detail.order_status) : '';

  const handleUpload = (item: AssignedDesignDetailItem, file?: File) => {
    if (!file || isUploadDisabled) return;

    uploadDraftMutation.mutate(
      { orderNumber, orderItemId: item.order_item_id, file, note: '' },
      {
        onSuccess: () => toast.success(t('orders.design_workflow.detail.upload_success')),
        onError: (error) => toast.error(getApiErrorMessage(error, t('orders.design_workflow.detail.upload_error'))),
      },
    );
  };

  const handleSendReview = () => {
    if (!hasDraftForEveryItem || uploadDraftMutation.isPending) return;

    sendReviewMutation.mutate(
      { orderNumber, version_ids: latestVersionIds },
      {
        onSuccess: () => toast.success(t('orders.design_workflow.detail.send_review_success')),
        onError: (error) => toast.error(getApiErrorMessage(error, t('orders.design_workflow.detail.send_review_error'))),
      },
    );
  };

  if (isLoading) {
    return (
      <div className='flex min-h-64 items-center justify-center'>
        <Loader2 className='text-primary size-8 animate-spin' aria-hidden='true' />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className='flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center'>
        <AlertCircle className='text-destructive size-7' aria-hidden='true' />
        <p className='text-sm font-medium'>{t('orders.design_workflow.detail.load_error')}</p>
        <Button type='button' variant='outline' onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? <Loader2 className='mr-1 size-4 animate-spin' aria-hidden='true' /> : null}
          {tCommon('action.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-lg font-semibold'>{detail.order_number}</h2>
        <div className='flex items-center gap-2'>
          <Button size='sm' className='gap-1.5' onClick={handleSendReview} disabled={!hasDraftForEveryItem || isUploadDisabled}>
            {sendReviewMutation.isPending ? (
              <Loader2 className='size-4 animate-spin' aria-hidden='true' />
            ) : (
              <Send className='size-4' aria-hidden='true' />
            )}
            {t('orders.design_workflow.detail.send_review')}
          </Button>
        </div>
      </div>

      {!hasDraftForEveryItem ? <p className='text-muted-foreground text-xs'>{t('orders.design_workflow.detail.review_requires_drafts')}</p> : null}

      <OrderInfoCard title={t('orders.design_workflow.detail.summary')}>
        <OrderInfoRow label={t('orders.design_workflow.detail.order_status')}>
          <span>{relatedOrderStatus}</span>
        </OrderInfoRow>
        <OrderInfoRow label={t('orders.design_workflow.detail.items_count')}>{detail.items.length}</OrderInfoRow>
      </OrderInfoCard>

      <section className='space-y-3'>
        <h3 className='text-base font-semibold'>{t('orders.design_workflow.detail.items')}</h3>

        {detail.items.map((item) => {
          const thumbnailUrl = item.product.images[0] ?? item.configuration.product_snapshot.images[0] ?? null;
          const designFile = item.configuration.design.file_design;
          const versions = sortVersionsByNewest(item);
          const isUploading = uploadDraftMutation.isPending && uploadDraftMutation.variables?.orderItemId === item.order_item_id;

          return (
            <article key={item.order_item_id} className='bg-card @container overflow-hidden rounded-xl border shadow-sm'>
              <div className='flex flex-col gap-4 p-4 @2xl:flex-row @2xl:items-start @2xl:justify-between'>
                <div className='flex min-w-0 flex-1 gap-4'>
                  <div className='bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md'>
                    {thumbnailUrl ? (
                      <button
                        type='button'
                        onClick={() => setPreviewImage({ url: thumbnailUrl, title: item.item_title })}
                        className='size-full cursor-zoom-in'
                        title={item.item_title}
                      >
                        <img src={thumbnailUrl} alt={item.item_title} className='size-full object-cover' />
                      </button>
                    ) : (
                      <FileIcon className='text-muted-foreground size-5' aria-hidden='true' />
                    )}
                  </div>

                  <div className='min-w-0 flex-1 space-y-3'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h4 className='font-semibold'>{item.item_title}</h4>
                      <Badge variant='outline'>{t(`orders.detail.product_info.source_type.${item.design_mode_code}`)}</Badge>
                      <Badge className={DESIGN_STATUS_CLASSES[item.status]}>{t(`orders.design_workflow.detail.item_status.${item.status}`)}</Badge>
                    </div>

                    <p className='text-muted-foreground text-xs'>
                      {t('orders.design_workflow.detail.designer')}: {item.assigned_designer?.name ?? '-'}
                    </p>

                    <dl className='grid gap-x-6 gap-y-3 text-sm @md:grid-cols-2 @xl:grid-cols-3'>
                      <div>
                        <dt className='text-muted-foreground'>{t('orders.detail.product_info.quantity')}</dt>
                        <dd>{`${item.quantity} × ${item.multiplier}`}</dd>
                      </div>
                      <div className='min-w-0'>
                        <dt className='text-muted-foreground'>{t('orders.detail.product_info.design_file')}</dt>
                        <dd>
                          {designFile ? (
                            <a
                              href={designFile.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              title={designFile.name}
                              className='text-primary inline-flex max-w-full items-center gap-1.5 hover:underline'
                            >
                              <FileIcon className='size-4 shrink-0' aria-hidden='true' />
                              <span className='truncate'>{designFile.name}</span>
                              <Download className='size-4 shrink-0' aria-hidden='true' />
                            </a>
                          ) : (
                            tCommon('none')
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className='text-muted-foreground'>{t('orders.design_workflow.detail.order_item_id')}</dt>
                        <dd>{item.order_item_id}</dd>
                      </div>
                    </dl>

                    <div>
                      <p className='text-muted-foreground mb-1.5 text-sm'>{t('orders.detail.product_info.options')}</p>
                      {item.configuration.options.length ? (
                        <dl className='grid grid-cols-[minmax(0,max-content)_minmax(7rem,1fr)] gap-x-4 gap-y-1 border-l-2 pl-3 text-sm'>
                          {item.configuration.options.map(({ group, option }) => (
                            <div key={group.code || group.id} className='contents'>
                              <dt className='text-muted-foreground'>
                                {group.code === 'paper' ? t('orders.detail.product_info.option_group.paper') : group.name}
                              </dt>
                              <dd className='wrap-break-word'>{option.label}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : (
                        <p className='text-muted-foreground text-sm'>{tCommon('none')}</p>
                      )}
                    </div>
                  </div>
                </div>

                {item.status !== AssignedDesignStatus.CUSTOMER_APPROVED ? (
                  <>
                    <Button
                      type='button'
                      className='shrink-0 gap-2'
                      disabled={isUploadDisabled}
                      onClick={() => fileInputRefs.current[item.order_item_id]?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className='size-4 animate-spin' aria-hidden='true' />
                      ) : (
                        <UploadCloud className='size-4' aria-hidden='true' />
                      )}
                      {t('orders.design_workflow.detail.upload_file')}
                    </Button>
                    <input
                      ref={(element) => {
                        fileInputRefs.current[item.order_item_id] = element;
                      }}
                      type='file'
                      className='sr-only'
                      disabled={isUploadDisabled}
                      onChange={(event) => {
                        handleUpload(item, event.target.files?.[0]);
                        event.target.value = '';
                      }}
                    />
                  </>
                ) : null}
              </div>

              <div className='bg-muted/40 space-y-4 border-t p-4'>
                <div>
                  <h5 className='mb-3 text-sm font-medium'>
                    {t('orders.design_workflow.detail.versions')} <span className='text-muted-foreground font-normal'>({versions.length})</span>
                  </h5>
                  {versions.length ? (
                    <div className='space-y-2'>
                      {versions.map((version) => (
                        <div
                          key={version.id}
                          className='bg-background flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3 text-sm shadow-sm'
                        >
                          <div className='min-w-0 space-y-2'>
                            <p className='font-medium wrap-break-word'>
                              {t('orders.design_workflow.detail.version', { version: version.version })}: {version.file_name}
                            </p>

                            <div className='flex flex-wrap items-center gap-2'>
                              <span className='text-muted-foreground text-xs'>{t('orders.design_workflow.detail.customer_response')}</span>
                              <Badge className={CUSTOMER_RESPONSE_CLASSES[version.customer_response]}>
                                {t(`orders.design_workflow.detail.customer_response_status.${version.customer_response}`)}
                              </Badge>
                            </div>

                            {version.designer_note ? <p className='text-muted-foreground text-xs'>{version.designer_note}</p> : null}

                            {version.customer_response === CustomerReviewStatus.REJECTED ? (
                              <p className='text-muted-foreground text-xs'>
                                <span className='text-foreground font-medium'>{t('orders.design_workflow.detail.customer_note')}:</span>{' '}
                                {version.customer_note ?? tCommon('none')}
                              </p>
                            ) : null}
                          </div>
                          <a
                            href={version.file_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline'
                          >
                            {t('orders.design_workflow.detail.open_file')}
                            <ExternalLink className='size-3' aria-hidden='true' />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-sm'>{t('orders.design_workflow.detail.no_versions')}</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

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
