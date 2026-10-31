import { AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppRadioGroupFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import { TemplateExportExcelType } from '../enums';

type TemplateExportDialogProps = {
  isOpen: boolean;
  totalCount: number;
  currentPageCount: number;
  selectedCount: number;
  isExporting: boolean;
  onClose: () => void;
  onExport: (type: TemplateExportExcelType) => void;
};

type ExportForm = {
  exportType: TemplateExportExcelType;
};

export function TemplateExportDialog({
  isOpen,
  totalCount,
  currentPageCount,
  selectedCount,
  isExporting,
  onClose,
  onExport,
}: TemplateExportDialogProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const { control, handleSubmit } = useForm<ExportForm>({
    defaultValues: { exportType: TemplateExportExcelType.CURRENT_PAGE },
  });

  const options = [
    {
      value: TemplateExportExcelType.ALL,
      label: (
        <span>
          {t('products.templates.list.export_dialog.all_items', 'All records')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({totalCount} {t('products.templates.list.export_dialog.items', 'items')})
          </span>
        </span>
      ),
      description: t('products.templates.list.export_dialog.all_items_desc', 'Export all templates matching the current filters.'),
    },
    {
      value: TemplateExportExcelType.CURRENT_PAGE,
      label: (
        <span>
          {t('products.templates.list.export_dialog.current_page', 'Current page')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({currentPageCount} {t('products.templates.list.export_dialog.items', 'items')})
          </span>
        </span>
      ),
      description: t('products.templates.list.export_dialog.current_page_desc', 'Export only the templates on the current page.'),
    },
    {
      value: TemplateExportExcelType.SELECTED,
      label: (
        <span>
          {t('products.templates.list.export_dialog.selected_items', 'Selected records')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({selectedCount} {t('products.templates.list.export_dialog.items', 'items')})
          </span>
        </span>
      ),
      description: t('products.templates.list.export_dialog.selected_items_desc', 'Export only the rows you have selected.'),
      disabled: selectedCount === 0,
    },
  ];

  const handleExport = handleSubmit(({ exportType }) => {
    onExport(exportType);
  });

  const footer = (
    <div className='flex justify-end gap-2'>
      <Button variant='outline' onClick={onClose} disabled={isExporting}>
        {t('products.templates.list.export_dialog.cancel', 'Cancel')}
      </Button>
      <Button onClick={() => void handleExport()} disabled={isExporting}>
        {isExporting && <Loader2 className='mr-2 size-4 animate-spin' />}
        {t('products.templates.list.export_dialog.confirm', 'Export')}
      </Button>
    </div>
  );

  return (
    <AppDialogModal isOpen={isOpen} setIsOpen={onClose} title={tCommon('export.title')} width={520} footer={footer}>
      <div className='space-y-4'>
        <p className='text-muted-foreground text-sm'>
          {t('products.templates.list.export_dialog.description', 'Choose which templates to export as an Excel file.')}
        </p>

        <AppRadioGroupFormField
          control={control}
          name='exportType'
          label={t('products.templates.list.export_dialog.type_label', 'Export Range')}
          options={options}
        />

        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
          <div className='flex gap-2'>
            <AlertCircle className='mt-0.5 size-4 shrink-0 text-yellow-600' />
            <div>
              <p className='text-sm font-medium text-yellow-900'>{t('products.templates.list.export_dialog.privacy_notice', 'Note')}</p>
              <p className='text-sm text-yellow-700'>
                {t(
                  'products.templates.list.export_dialog.privacy_notice_desc',
                  'The exported file may contain linked product and customer data. Handle it with care.',
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppDialogModal>
  );
}
