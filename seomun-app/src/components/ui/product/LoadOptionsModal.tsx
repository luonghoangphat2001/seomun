'use client';

import { useSavedOptionListQuery } from '@/apis/my/saved-options/saved-options.query';
import { SavedOptionRESP } from '@/apis/my/saved-options/saved-options.response';
import { getSavedOptionInfo } from '@/apis/my/saved-options/saved-options.service';
import { Button, Modal, ModalHandle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/common';
import { useAuthStore, useMediaQuery } from '@/hooks';
import { createProductOptionGroupNameTranslator } from '@/lib/product-option-labels';
import { useTranslations } from 'next-intl';
import React, { forwardRef } from 'react';

type LoadOptionsModalProps = {
  onApply?: (item: SavedOptionRESP) => void;
  productId?: number;
};

export const LoadOptionsModal = forwardRef<ModalHandle, LoadOptionsModalProps>(({ onApply, productId }, ref) => {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const translateGroupName = createProductOptionGroupNameTranslator((key) => t(key.replace('product.', '')));
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { isAuthenticated } = useAuthStore();

  //api saved option list
  const { data, isLoading } = useSavedOptionListQuery({ page: 1, per_page: 100, product_id: productId }, isAuthenticated);
  const savedOptions = data?.list ?? [];

  const onClose = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
  };

  const handleApply = (item: SavedOptionRESP) => {
    onApply?.(item);
    onClose();
  };

  return (
    <Modal
      ref={ref}
      position={isDesktop ? 'center' : 'bottom'}
      size='lg'
      title={t('load_options')}
      titleClassName='title-18 md:title-24 md:px-6'
      closeOnOverlayClick={false}
      footer={
        <div className='flex justify-end md:px-6'>
          <Button variant='outline' size='md' onClick={onClose} className='h-10 md:h-11'>
            {tCommon('close')}
          </Button>
        </div>
      }>
      <div className='border-border-soft flex flex-col gap-6 border-t border-b p-4 max-md:border-none'>
        <div className='border-text-brand caption-12 border-l-4 bg-[#FEFBEC] px-4 py-3 md:hidden'>
          <ul className='space-y-1'>
            <li className='body-14 text-text-secondary flex gap-2'>
              <span className='shrink-0'>•</span>
              <span>
                {t.rich('instruction_save_options_1', {
                  span: (chunks: React.ReactNode) => <span className='title-14 text-text-brand font-semibold'>{chunks}</span>,
                })}
              </span>
            </li>
            <li className='body-14 text-text-secondary flex gap-2'>
              <span className='shrink-0'>•</span>
              <span>{t('instruction_save_options_2')}</span>
            </li>
          </ul>
        </div>

        <div className='overflow-x-auto'>
          <Table className='table-fixed'>
            <TableHeader>
              <TableRow className='bg-fill-light border-border-soft border-b'>
                <TableHead className='body-14 text-text-main w-16 px-4 py-3 font-semibold'>{t('no')}</TableHead>
                <TableHead className='body-14 text-text-main px-4 py-3 font-semibold'>{t('product_name_option_name')}</TableHead>
                <TableHead className='body-14 text-text-main w-24 px-4 py-3 text-center font-semibold'>{t('apply')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className='py-20 text-center'>
                    <p className='body-16'>{tCommon('loading')}...</p>
                  </TableCell>
                </TableRow>
              ) : savedOptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className='py-20 text-center'>
                    <p className='body-16'>{t('no_save_options')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                savedOptions.map((item, index) => {
                  const optionInfo = getSavedOptionInfo(item, translateGroupName);
                  const optionLabels = optionInfo?.optionLabels || [];

                  return (
                    <TableRow key={item.id} className='border-border-soft border-b'>
                      <TableCell className='text-text-secondary px-4 py-3'>{index + 1}</TableCell>
                      <TableCell className='min-w-0 px-4 py-3'>
                        <div className='flex min-w-0 flex-wrap items-center gap-x-1.5'>
                          <p className='title-16 break-words'>[{item.product_name}]</p>
                          <p className='title-16 text-text-brand break-words'>{item.order_name}</p>
                        </div>
                        <p className='body-14 truncate'>{optionLabels.join(' / ')}</p>
                        {item.notes && (
                          <p className='body-14 text-text-secondary cursor-pointer truncate' title={item.notes}>
                            {t('memo')}: {item.notes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className='px-4 py-3 text-center'>
                        <Button type='button' variant='outline' size='sm' className='h-8 px-3' onClick={() => handleApply(item)}>
                          {t('apply')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className='border-border-soft hidden border-t px-4 py-4 md:block md:px-6'>
          <ul className='space-y-1'>
            <li className='body-14 text-text-secondary flex gap-2'>
              <span className='shrink-0'>•</span>
              <span>
                {t.rich('instruction_save_options_1', {
                  span: (chunks: React.ReactNode) => <span className='title-14 text-text-brand font-semibold'>{chunks}</span>,
                })}
              </span>
            </li>
            <li className='body-14 text-text-secondary flex gap-2'>
              <span className='shrink-0'>•</span>
              <span>{t('instruction_save_options_2')}</span>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
});

LoadOptionsModal.displayName = 'LoadOptionsModal';
