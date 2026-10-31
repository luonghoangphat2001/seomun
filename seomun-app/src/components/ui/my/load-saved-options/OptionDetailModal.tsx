'use client';

import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Modal, ModalHandle } from '@/components/common';
import { Careright } from '@/icons';
import { SavedOptionRESP } from '@/apis/my/saved-options/saved-options.response';
import { PostProcessingCode, ProductCommonOption } from '@/enums/product';
import { getSavedOptionInfo } from '@/apis/my/saved-options/saved-options.service';
import {
  createProductOptionGroupNameTranslator,
  findProductOptionByCode,
  getBookOptionDisplayItems,
  getProductOptionItems,
  isBookOptionConfiguration,
} from '@/lib/product-option-labels';

type OptionDetailModalProps = {
  onClose: () => void;
  detail: SavedOptionRESP | null;
};

export const OptionDetailModal = forwardRef<ModalHandle, OptionDetailModalProps>(({ onClose, detail }, ref) => {
  const t = useTranslations();
  const translateGroupName = createProductOptionGroupNameTranslator(t);
  const productOptionInfo = getSavedOptionInfo(detail || undefined, translateGroupName);
  const optionLabels = productOptionInfo?.optionLabels || [];

  const getSelectedProductOption = () => {
    if (!detail) return [];

    const selectedProductOptions = getProductOptionItems(detail.options);
    const postProcessingCodes = Object.values(PostProcessingCode);
    const isBookProduct = isBookOptionConfiguration(selectedProductOptions);
    const size = findProductOptionByCode(selectedProductOptions, ProductCommonOption.SIZE);
    const subjectMatter = findProductOptionByCode(selectedProductOptions, ProductCommonOption.SUBJECT_MATTER);
    const paper = findProductOptionByCode(selectedProductOptions, ProductCommonOption.PAPER);
    const printedSide = findProductOptionByCode(selectedProductOptions, ProductCommonOption.PRINTED_SIDE);
    const printedFSide = findProductOptionByCode(selectedProductOptions, ProductCommonOption.PRINTED_COLOR_FSIDE);
    const printedBSide = findProductOptionByCode(selectedProductOptions, ProductCommonOption.PRINTED_COLOR_BSIDE);
    const postProcessing = selectedProductOptions
      .filter((item) => postProcessingCodes.includes(item?.group?.code as PostProcessingCode) && item?.option?.label)
      .map((item) => `${translateGroupName(item?.group?.code, item?.group?.name)} ${item?.option?.label}`);

    if (isBookProduct) {
      return [
        { label: t('product.standard'), value: <p>{size?.option?.label}</p> },
        ...getBookOptionDisplayItems(selectedProductOptions).map((item) => ({
          label: translateGroupName(item?.group?.code, item?.group?.name),
          value: <p>{item?.option?.label}</p>,
        })),
        {
          label: t('product.quantity_count'),
          value: (
            <p>{`${t('product.quantity', { quantity: detail.quantity })} ${t('product.count', { count: detail.number_of_cases })}`}</p>
          ),
        },
        {
          label: t('product.post_processing'),
          value: postProcessing.length > 0 ? postProcessing.map((item, index) => <p key={index}>{item || '-'}</p>) : '-',
        },
      ];
    }

    return [
      { label: t('product.standard'), value: <p>{size?.option?.label}</p> },
      ...(subjectMatter?.option?.label
        ? [{ label: t('product.subject_matter'), value: <p>{subjectMatter.option.label}</p> }]
        : []),
      { label: t('product.paper'), value: <p>{paper?.option?.label}</p> },
      {
        label: t('product.printed_color'),
        value: (
          <p>
            {printedSide?.option?.label} {printedFSide?.option?.label} {printedBSide?.option?.label}
          </p>
        ),
      },
      {
        label: t('product.quantity_count'),
        value: (
          <p>{`${t('product.quantity', { quantity: detail.quantity })} ${t('product.count', { count: detail.number_of_cases })}`}</p>
        ),
      },
      {
        label: t('product.post_processing'),
        value: postProcessing.length > 0 ? postProcessing.map((item, index) => <p key={index}>{item || '-'}</p>) : '-',
      },
    ];
  };

  return (
    <Modal
      ref={ref}
      position='bottom'
      title={t('my.detail')}
      titleClassName='pt-0'
      className='rounded-t-2xl'
      footer={
        <div className='flex justify-end gap-4'>
          <Button size='sm' variant='ghost' onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button size='sm'>{t('common.apply')}</Button>
        </div>
      }>
      <div className='px-4 py-6'>
        <div className='bg-border-light space-y-2 rounded-[10px] p-4'>
          <p className='title-16'>{detail?.product_name}</p>
          <p className='body-14'>{optionLabels.join(' / ')}</p>
        </div>
        <div className='mt-5 space-y-3'>
          {getSelectedProductOption().map((info) => (
            <div key={info.label} className='flex items-start gap-4'>
              <div className='flex w-28 shrink-0 items-start gap-2'>
                <Careright className='text-border-soft mt-0.5 size-4 shrink-0' />
                <p className='title-14 text-text-secondary'>{info.label}</p>
              </div>
              <div className='body-14'>{info.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
});

OptionDetailModal.displayName = 'OptionDetailModal';
