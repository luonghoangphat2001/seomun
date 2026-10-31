import { AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppRadioGroupFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import { ErpExportType } from '../enums';

type ErpExportDialogProps = {
  isOpen: boolean;
  totalCount: number;
  currentPageCount: number;
  selectedCount: number;
  isExporting: boolean;
  showSelectedOption?: boolean;
  onClose: () => void;
  onExport: (type: ErpExportType) => void;
};

type ExportForm = {
  exportType: ErpExportType;
};

export function ErpExportDialog({
  isOpen,
  totalCount,
  currentPageCount,
  selectedCount,
  isExporting,
  showSelectedOption = true,
  onClose,
  onExport,
}: ErpExportDialogProps) {
  const { t } = useTranslation();

  const { control, handleSubmit } = useForm<ExportForm>({
    defaultValues: { exportType: ErpExportType.CURRENT_PAGE },
  });

  const options = [
    {
      value: ErpExportType.ALL,
      label: `${t('page.products.options.export_dialog.all_items')} (${totalCount})`,
      description: t('page.products.options.export_dialog.all_items_desc'),
    },
    {
      value: ErpExportType.CURRENT_PAGE,
      label: `${t('page.products.options.export_dialog.current_page')} (${currentPageCount})`,
      description: t('page.products.options.export_dialog.current_page_desc'),
    },
    ...(showSelectedOption
      ? [
          {
            value: ErpExportType.SELECTED,
            label: `${t('page.products.options.export_dialog.selected_items')} (${selectedCount})`,
            description: t('page.products.options.export_dialog.selected_items_desc'),
            disabled: selectedCount === 0,
          },
        ]
      : []),
  ];

  const handleExport = handleSubmit(({ exportType }) => {
    onExport(exportType);
  });

  const footer = (
    <div className='flex justify-end gap-2'>
      <Button variant='outline' onClick={onClose} disabled={isExporting}>
        {t('page.products.options.export_dialog.cancel')}
      </Button>
      <Button onClick={() => void handleExport()} disabled={isExporting}>
        {isExporting ? <Loader2 className='mr-2 size-4 animate-spin' /> : null}
        {t('page.products.options.export_dialog.confirm')}
      </Button>
    </div>
  );

  return (
    <AppDialogModal isOpen={isOpen} setIsOpen={onClose} title={t('common.export.title')} width={520} footer={footer}>
      <div className='space-y-4'>
        <p className='text-muted-foreground text-sm'>{t('page.products.options.export_dialog.description')}</p>

        <AppRadioGroupFormField control={control} name='exportType' label={t('page.products.options.export_dialog.type_label')} options={options} />

        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
          <div className='flex gap-2'>
            <AlertCircle className='mt-0.5 size-4 shrink-0 text-yellow-600' />
            <p className='text-sm text-yellow-700'>{t('page.products.options.export_dialog.notice')}</p>
          </div>
        </div>
      </div>
    </AppDialogModal>
  );
}
