'use client';

import type { OrderHistoryDesignFileRESP, OrderHistoryOrderItemRESP } from '@/apis/my/order/order.response';
import { useProofConfirmMutation } from '@/apis/my/order/order.query';
import { Button, Description, DescriptionContent, ModalHandle, SafeImage } from '@/components/common';
import { EDITABLE_ORDER_HISTORY_STATUSES } from '@/constants/order';
import { OrderHistoryStatus, OrderProofStatus } from '@/enums/order';
import { PostProcessingCode, ProductCommonOption } from '@/enums/product';
import { Eyes, File2 } from '@/icons';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckModal } from './CheckModal';
import { ModifyFileModal } from './modify-file-modal/ModifyFileModal';
import { PreviewModal } from './preview-modal/PreviewModal';

type ProductInfoProps = {
  orderNumber?: string;
  status?: OrderHistoryStatus;
  totalPrice?: string | number;
  items: OrderHistoryOrderItemRESP[];
  productThumbnail?: string | null;
};

type ProductFile = Pick<OrderHistoryDesignFileRESP, 'url' | 'name'> & Partial<Pick<OrderHistoryDesignFileRESP, 'mime' | 'size'>>;

const getOptionLabel = (item: OrderHistoryOrderItemRESP, code: string) =>
  (Array.isArray(item.options) ? item.options : []).find((option) => option?.group?.code === code)?.option?.label;

const getOptionLabelByCodes = (item: OrderHistoryOrderItemRESP, codes: string[]) =>
  codes.map((code) => getOptionLabel(item, code)).find(Boolean);

const BOOK_PAPER_SECTIONS = [
  { code: ProductCommonOption.COVER_PAPER, countField: 'cover_page_count' },
  { code: ProductCommonOption.INNER_PAPER, countField: 'inner_page_count' },
  { code: ProductCommonOption.ADDITIONAL_PAPER, countField: 'additional_page_count' },
  { code: ProductCommonOption.COLORED_PAPER_1, countField: 'colored_page_count_1' },
  { code: ProductCommonOption.COLORED_PAPER_2, countField: 'colored_page_count_2' },
  { code: ProductCommonOption.FLYLEAF_PAPER, countField: 'flyleaf_count' },
] as const;

const MINIMUM_PROOFREADING_CONFIRM_PRICE = 100_000;

const ProductInfo = ({ orderNumber, status, totalPrice, items, productThumbnail }: ProductInfoProps) => {
  const t = useTranslations();
  const previewModalRef = useRef<ModalHandle>(null);
  const modifyFileModalRef = useRef<ModalHandle>(null);
  const checkModalRef = useRef<ModalHandle>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedUploadedFile, setSelectedUploadedFile] = useState<ProductFile | null>(null);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number>();
  const [selectedFilePreviewImages, setSelectedFilePreviewImages] = useState<string[]>([]);
  const [shouldCloseModifyFileModal, setShouldCloseModifyFileModal] = useState(false);
  const { mutate: proofConfirm, isPending: isProofConfirming } = useProofConfirmMutation();
  const canEditOrder = status ? EDITABLE_ORDER_HISTORY_STATUSES.includes(status) : false;
  const canConfirmProofreading = Number(String(totalPrice ?? '').replace(/,/g, '')) >= MINIMUM_PROOFREADING_CONFIRM_PRICE;

  const openPreviewModal = (images: string[]) => {
    setPreviewImages(images);
    previewModalRef.current?.open();
  };

  const openModifyFileModal = (file: ProductFile | null, images: string[], orderItemId: number) => {
    setSelectedUploadedFile(file);
    setSelectedFilePreviewImages(images);
    setSelectedOrderItemId(orderItemId);
    modifyFileModalRef.current?.open();
  };

  const closeCheckModal = () => {
    checkModalRef.current?.close();
  };

  const openCheckModal = (orderItemId: number, closeModifyFileModal = false) => {
    if (!orderNumber || !canEditOrder || !canConfirmProofreading || isProofConfirming) return;

    setSelectedOrderItemId(orderItemId);
    setShouldCloseModifyFileModal(closeModifyFileModal);
    checkModalRef.current?.open();
  };

  const confirmProof = () => {
    if (!orderNumber || !selectedOrderItemId || !canEditOrder || !canConfirmProofreading || isProofConfirming) return;

    proofConfirm(
      { orderNumber, confirm: true, order_item_id: selectedOrderItemId },
      {
        onSuccess: () => {
          toast.success(t('common.success_update'));
          closeCheckModal();
          if (shouldCloseModifyFileModal) {
            modifyFileModalRef.current?.close();
          }
        },
        onError: (error) => {
          toast.error(error.response?.data.message ?? t('common.fail_update'));
        },
      },
    );
  };

  return (
    <div className='space-y-12'>
      {items.map((item, index) => {
        const itemOptions = Array.isArray(item.options) ? item.options : [];
        const designGroup = item.configuration.design.design_group;
        const originalFile = item.design.file ?? item.configuration.design.file_design ?? designGroup?.upload_artworks[0] ?? null;
        const isWebEditor = designGroup?.source_type === 'web_editor';
        const isFileUpload = designGroup?.source_type === 'upload_file' || Boolean(originalFile);
        const canResubmitFile = isFileUpload && !isWebEditor;
        const isProofConfirmed = item.metadata?.proof_status === OrderProofStatus.CONFIRMED;
        const resubmittedFiles = item.metadata?.file_resubmissions ?? [];
        const confirmedFile = item.design.confirmed_file;
        const file: ProductFile | null = originalFile;
        const previewPdfUrl = item.configuration.design.design_group?.preview_pdf_url;
        const designFile = file
          ? { url: file.url, name: file.name }
          : previewPdfUrl
            ? { url: previewPdfUrl, name: designGroup?.title || `칼선_${item.product_snapshot.name || 'design'}` }
            : null;
        const thumbnailUrl = isWebEditor
          ? item.design.front?.preview_image_path
          : item.product_snapshot?.first_image || productThumbnail || item.design.front?.preview_image_path;
        const previewImages = [item.design.front?.preview_image_path, item.design.back?.preview_image_path].filter(
          (image): image is string => Boolean(image),
        );
        const isBookProduct = itemOptions.some((option) => option?.group?.code === ProductCommonOption.COVER_PAPER);
        const paperOptions = isBookProduct
          ? BOOK_PAPER_SECTIONS.flatMap(({ code, countField }) => {
              const paperLabel = getOptionLabel(item, code);
              if (!paperLabel) return [];

              const pageCount = item.input_options?.[countField];
              return [
                {
                  label: t(`product.${code}`),
                  value: `${paperLabel}${pageCount ? ` (${pageCount}p)` : ''}`,
                },
              ];
            })
          : [
              {
                label: t('common.paper'),
                value: getOptionLabel(item, ProductCommonOption.PAPER) || item.configuration.paper || '-',
              },
            ];
        const printingOptions = isBookProduct
          ? [
              {
                label: t('product.cover'),
                value: [
                  getOptionLabel(item, ProductCommonOption.PRINTED_COVER_SIDE),
                  getOptionLabel(item, ProductCommonOption.PRINTED_COLOR_COVER_FSIDE),
                  getOptionLabel(item, ProductCommonOption.PRINTED_COLOR_COVER_BSIDE),
                ]
                  .filter(Boolean)
                  .join(' - '),
              },
              {
                label: t('product.inner_paper'),
                value: [
                  getOptionLabel(item, ProductCommonOption.PRINTED_INNER_SIDE),
                  getOptionLabel(item, ProductCommonOption.PRINTED_COLOR_INNER_FSIDE),
                  getOptionLabel(item, ProductCommonOption.PRINTED_COLOR_INNER_BSIDE),
                ]
                  .filter(Boolean)
                  .join(' - '),
              },
            ].filter((option) => option.value)
          : [
              {
                label: undefined,
                value: [
                  getOptionLabel(item, ProductCommonOption.PRINTED_SIDE),
                  getOptionLabelByCodes(item, ['front_printing', ProductCommonOption.PRINTED_COLOR_FSIDE]),
                  getOptionLabelByCodes(item, ['back_printing', ProductCommonOption.PRINTED_COLOR_BSIDE]),
                ]
                  .filter(Boolean)
                  .join(' - '),
              },
            ].filter((option) => option.value);
        const postProcessingOptions = itemOptions
          .filter(
            (option) =>
              option?.group?.code &&
              Object.values(PostProcessingCode).includes(option.group.code as PostProcessingCode) &&
              option.option?.label,
          )
          .map((option) => ({
            code: option?.group?.code ?? '',
            groupName: option?.group?.name ?? '',
            optionLabel: option?.option?.label ?? '',
          }));
        const specification = item.input_options
          ? `${item.input_options.width}mm x ${item.input_options.height}mm`
          : item.configuration.size || '-';

        return (
          <Description
            key={item.id}
            title={`${t('order.order_product_info')} ${index + 1}`}
            contentKey={`order-product-${item.id}`}
            defaultOpen>
            <DescriptionContent
              rows={[
                { items: [{ label: t('common.product_name'), value: item.title }] },
                {
                  items: [
                    {
                      label: t('common.specification'),
                      value: specification,
                    },
                  ],
                },
                {
                  items: [
                    {
                      label: t('common.paper'),
                      value:
                        paperOptions.length > 0 ? (
                          <div className='flex flex-wrap items-center gap-3 md:gap-6'>
                            {paperOptions.map((option, optionIndex) => (
                              <div key={`${option.label}-${optionIndex}`} className='flex items-center gap-3 md:gap-6'>
                                {optionIndex > 0 && <div className='vertical-seperator' />}
                                <p>
                                  {isBookProduct && <span className='font-medium'>{option.label}: </span>}
                                  {option.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          '-'
                        ),
                    },
                  ],
                },
                {
                  items: [
                    {
                      label: t('common.printing_count'),
                      value:
                        printingOptions.length > 0 ? (
                          <div className='flex flex-wrap items-center gap-3 md:gap-6'>
                            {printingOptions.map((option, optionIndex) => (
                              <div
                                key={`${option.label ?? option.value}-${optionIndex}`}
                                className='flex items-center gap-3 md:gap-6'>
                                {optionIndex > 0 && <div className='vertical-seperator' />}
                                <p>
                                  {option.label && <span className='font-medium'>{option.label}: </span>}
                                  {option.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          '-'
                        ),
                    },
                  ],
                },
                {
                  items: [
                    {
                      label: t('common.copy_quantity'),
                      value: `${item.quantity}매  x  ${item.number_of_cases}건`,
                    },
                  ],
                },
                {
                  items: [
                    {
                      label: t('common.post_processing'),
                      value:
                        postProcessingOptions.length > 0 ? (
                          <div className='flex flex-wrap items-center gap-3 md:gap-6'>
                            {postProcessingOptions.map((option, optionIndex) => (
                              <div key={`${option.code}-${optionIndex}`} className='flex items-center gap-3 md:gap-6'>
                                {optionIndex > 0 && <div className='vertical-seperator' />}
                                <p>
                                  {option.groupName} <span className='body-14'>{option.optionLabel}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          '-'
                        ),
                    },
                  ],
                },
                { items: [{ label: t('common.accessories'), value: '-' }] },
                {
                  items: [
                    {
                      label: t('common.upload_file'),
                      value: (
                        <div className='flex w-full flex-col gap-3'>
                          <div className='flex flex-wrap items-center gap-3 md:gap-6'>
                            {designFile ? (
                              <div className='flex items-center gap-1.5'>
                                {thumbnailUrl ? (
                                  <div className='border-border-soft relative size-6 shrink-0 overflow-hidden border'>
                                    <SafeImage src={thumbnailUrl} alt={item.title} fill className='object-cover' />
                                  </div>
                                ) : (
                                  <File2 className='size-6 shrink-0' />
                                )}
                                <a
                                  href={designFile.url}
                                  target='_blank'
                                  rel='noreferrer'
                                  className='title-14 md:title-16 text-[#B0580D] underline underline-offset-4'>
                                  {designFile.name}
                                </a>
                              </div>
                            ) : thumbnailUrl ? (
                              <div className='border-border-soft relative size-6 shrink-0 overflow-hidden border'>
                                <SafeImage src={thumbnailUrl} alt={item.title} fill className='object-cover' />
                              </div>
                            ) : (
                              <p>-</p>
                            )}
                            <div className='flex flex-wrap items-center gap-2'>
                              {previewImages.length > 0 && (
                                <Button size='sm' variant='outline' onClick={() => openPreviewModal(previewImages)}>
                                  <div className='flex items-center gap-2'>
                                    {t('common.design_preview')}
                                    <Eyes className='size-5' />
                                  </div>
                                </Button>
                              )}
                              {canEditOrder && !isWebEditor && (
                                <>
                                  <Button
                                    size='sm'
                                    variant='outline-primary'
                                    disabled={!canResubmitFile || isProofConfirmed}
                                    onClick={() => openModifyFileModal(file, previewImages, item.id)}>
                                    {t('order.resubmit_file')}
                                  </Button>
                                  <Button
                                    size='sm'
                                    onClick={() => openCheckModal(item.id)}
                                    loading={isProofConfirming}
                                    disabled={!orderNumber || !canConfirmProofreading || isProofConfirmed}>
                                    {t('order.proofreading_confirm')}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {resubmittedFiles.length > 0 && (
                            <div className='border-border-soft space-y-3 border-t pt-2'>
                              {resubmittedFiles.map((resubmittedFile, resubmissionIndex) => (
                                <div
                                  key={`${resubmittedFile.file_url}-${resubmittedFile.submitted_at}-${resubmissionIndex}`}
                                  className='space-y-1'>
                                  <a
                                    href={resubmittedFile.file_url}
                                    target='_blank'
                                    rel='noreferrer'
                                    className='title-14 md:title-16 text-[#B0580D] underline underline-offset-4'>
                                    {resubmittedFile.file_name}
                                  </a>
                                  <p className='body-14 text-text-secondary whitespace-pre-line'>
                                    {t('common.revision_request')}: {resubmittedFile.note || '-'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ),
                    },
                  ],
                },
                ...(confirmedFile
                  ? [
                      {
                        items: [
                          {
                            label: t('common.confirmed_file'),
                            value: (
                              <div className='flex items-center'>
                                <a
                                  href={confirmedFile.url}
                                  target='_blank'
                                  rel='noreferrer'
                                  className='title-14 md:title-16 text-[#B0580D] underline underline-offset-4'>
                                  {confirmedFile.name}
                                </a>
                              </div>
                            ),
                          },
                        ],
                      },
                    ]
                  : []),
              ]}
            />
          </Description>
        );
      })}

      <PreviewModal ref={previewModalRef} images={previewImages} />
      <ModifyFileModal
        ref={modifyFileModalRef}
        orderNumber={orderNumber}
        orderItemId={selectedOrderItemId}
        file={selectedUploadedFile}
        previewImages={selectedFilePreviewImages}
        openCheckModal={() => selectedOrderItemId && openCheckModal(selectedOrderItemId, true)}
        isProofConfirming={isProofConfirming}
        canConfirmProofreading={true}
      />
      <CheckModal ref={checkModalRef} onConfirm={confirmProof} onCancel={closeCheckModal} isLoading={isProofConfirming} />
    </div>
  );
};

export default ProductInfo;
