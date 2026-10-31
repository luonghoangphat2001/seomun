import { AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppRadioGroupFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import { PaymentExportExcelType } from '../enums';

type PaymentExportDialogProps = {
  isOpen: boolean;
  totalCount: number;
  currentPageCount: number;
  selectedCount: number;
  isExporting: boolean;
  onClose: () => void;
  onExport: (type: PaymentExportExcelType) => void;
};

type ExportForm = {
  exportType: PaymentExportExcelType;
};

export function PaymentExportDialog({
  isOpen,
  totalCount,
  currentPageCount,
  selectedCount,
  isExporting,
  onClose,
  onExport,
}: PaymentExportDialogProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const { control, handleSubmit } = useForm<ExportForm>({
    defaultValues: { exportType: PaymentExportExcelType.CURRENT_PAGE },
  });

  const options = [
    {
      value: PaymentExportExcelType.ALL,
      label: (
        <span>
          {t('payments.list.export_dialog.all_items', 'All records')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({totalCount} {t('payments.list.export_dialog.items', 'items')})
          </span>
        </span>
      ),
      description: t('payments.list.export_dialog.all_items_desc', 'Export all payments matching the current filters.'),
    },
    {
      value: PaymentExportExcelType.CURRENT_PAGE,
      label: (
        <span>
          {t('payments.list.export_dialog.current_page', 'Current page')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({currentPageCount} {t('payments.list.export_dialog.items', 'items')})
          </span>
        </span>
      ),
      description: t('payments.list.export_dialog.current_page_desc', 'Export only the records on the current page.'),
    },
    {
      value: PaymentExportExcelType.SELECTED,
      label: (
        <span>
          {t('payments.list.export_dialog.selected_items', 'Selected records')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({selectedCount} {t('payments.list.export_dialog.items', 'items')})
          </span>
        </span>
      ),
      description: t('payments.list.export_dialog.selected_items_desc', 'Export only the rows you have selected.'),
      disabled: selectedCount === 0,
    },
  ];

  const handleExport = handleSubmit(({ exportType }) => {
    onExport(exportType);
  });

  const footer = (
    <div className='flex justify-end gap-2'>
      <Button variant='outline' onClick={onClose} disabled={isExporting}>
        {t('payments.list.export_dialog.cancel', 'Cancel')}
      </Button>
      <Button onClick={() => void handleExport()} disabled={isExporting}>
        {isExporting && <Loader2 className='mr-2 size-4 animate-spin' />}
        {t('payments.list.export_dialog.confirm', 'Export')}
      </Button>
    </div>
  );

  return (
    <AppDialogModal isOpen={isOpen} setIsOpen={onClose} title={tCommon('export.title')} width={520} footer={footer}>
      <div className='space-y-4'>
        <p className='text-muted-foreground text-sm'>
          {t('payments.list.export_dialog.description', 'Choose which payments to export as an Excel file.')}
        </p>

        <AppRadioGroupFormField
          control={control}
          name='exportType'
          label={t('payments.list.export_dialog.type_label', 'Export Range')}
          options={options}
        />

        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
          <div className='flex gap-2'>
            <AlertCircle className='mt-0.5 size-4 shrink-0 text-yellow-600' />
            <div>
              <p className='text-sm font-medium text-yellow-900'>{t('payments.list.export_dialog.privacy_notice', 'Note')}</p>
              <p className='text-sm text-yellow-700'>
                {t('payments.list.export_dialog.privacy_notice_desc', 'The exported file may contain personal data. Handle it with care.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppDialogModal>
  );
}
