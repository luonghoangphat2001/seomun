import { AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppRadioGroupFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import { DirectShippingExportExcelType } from '../enums';

// === Type definitions ===

type DirectShippingExportDialogProps = {
  isOpen: boolean;
  totalCount: number;
  currentPageCount: number;
  selectedCount: number;
  isExporting: boolean;
  onClose: () => void;
  onExport: (type: DirectShippingExportExcelType) => void;
};

type ExportForm = {
  exportType: DirectShippingExportExcelType;
};

// === Component ===

export function DirectShippingExportDialog({
  isOpen,
  totalCount,
  currentPageCount,
  selectedCount,
  isExporting,
  onClose,
  onExport,
}: DirectShippingExportDialogProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const { control, handleSubmit } = useForm<ExportForm>({
    defaultValues: { exportType: DirectShippingExportExcelType.CURRENT_PAGE },
  });

  const renderLabel = (label: string, count: number) => (
    <span>
      {label}{' '}
      <span className='text-muted-foreground font-normal'>
        ({count} {t('delivery.direct_shipping.export_dialog.items')})
      </span>
    </span>
  );

  const options = [
    {
      value: DirectShippingExportExcelType.ALL,
      label: renderLabel(t('delivery.direct_shipping.export_dialog.all_items'), totalCount),
      description: t('delivery.direct_shipping.export_dialog.all_items_desc'),
    },
    {
      value: DirectShippingExportExcelType.CURRENT_PAGE,
      label: renderLabel(t('delivery.direct_shipping.export_dialog.current_page'), currentPageCount),
      description: t('delivery.direct_shipping.export_dialog.current_page_desc'),
    },
    {
      value: DirectShippingExportExcelType.SELECTED,
      label: renderLabel(t('delivery.direct_shipping.export_dialog.selected_items'), selectedCount),
      description: t('delivery.direct_shipping.export_dialog.selected_items_desc'),
      disabled: selectedCount === 0,
    },
  ];

  const handleExport = handleSubmit(({ exportType }) => {
    onExport(exportType);
  });

  const footer = (
    <div className='flex justify-end gap-2'>
      <Button variant='outline' onClick={onClose} disabled={isExporting}>
        {t('delivery.direct_shipping.export_dialog.cancel')}
      </Button>
      <Button onClick={() => void handleExport()} disabled={isExporting}>
        {isExporting && <Loader2 className='mr-2 size-4 animate-spin' />}
        {t('delivery.direct_shipping.export_dialog.confirm')}
      </Button>
    </div>
  );

  return (
    <AppDialogModal isOpen={isOpen} setIsOpen={onClose} title={tCommon('export.title')} width={520} footer={footer}>
      <div className='space-y-4'>
        <p className='text-muted-foreground text-sm'>{t('delivery.direct_shipping.export_dialog.description')}</p>

        <AppRadioGroupFormField
          control={control}
          name='exportType'
          label={t('delivery.direct_shipping.export_dialog.type_label')}
          options={options}
        />

        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
          <div className='flex gap-2'>
            <AlertCircle className='mt-0.5 size-4 shrink-0 text-yellow-600' />
            <div>
              <p className='text-sm font-medium text-yellow-900'>{t('delivery.direct_shipping.export_dialog.privacy_notice')}</p>
              <p className='text-sm text-yellow-700'>{t('delivery.direct_shipping.export_dialog.privacy_notice_desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </AppDialogModal>
  );
}
