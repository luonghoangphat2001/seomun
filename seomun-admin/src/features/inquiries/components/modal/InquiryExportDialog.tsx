import { AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppRadioGroupFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import { InquiryExportType } from '../../enums';

type InquiryExportDialogProps = {
  isOpen: boolean;
  totalCount: number;
  currentPageCount: number;
  selectedCount: number;
  isExporting: boolean;
  onClose: () => void;
  onExport: (type: InquiryExportType) => void;
};

type ExportForm = {
  exportType: InquiryExportType;
};

export function InquiryExportDialog({
  isOpen,
  totalCount,
  currentPageCount,
  selectedCount,
  isExporting,
  onClose,
  onExport,
}: InquiryExportDialogProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const { control, handleSubmit } = useForm<ExportForm>({
    defaultValues: { exportType: InquiryExportType.CURRENT_PAGE },
  });

  const options = [
    {
      value: InquiryExportType.ALL,
      label: (
        <span>
          {t('inquiries.export_dialog.all_items')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({totalCount} {t('inquiries.export_dialog.items')})
          </span>
        </span>
      ),
      description: t('inquiries.export_dialog.all_items_desc'),
    },
    {
      value: InquiryExportType.CURRENT_PAGE,
      label: (
        <span>
          {t('inquiries.export_dialog.current_page')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({currentPageCount} {t('inquiries.export_dialog.items')})
          </span>
        </span>
      ),
      description: t('inquiries.export_dialog.current_page_desc'),
    },
    {
      value: InquiryExportType.SELECTED,
      label: (
        <span>
          {t('inquiries.export_dialog.selected_items')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({selectedCount} {t('inquiries.export_dialog.items')})
          </span>
        </span>
      ),
      description: t('inquiries.export_dialog.selected_items_desc'),
      disabled: selectedCount === 0,
    },
  ];

  const handleExport = handleSubmit(({ exportType }) => {
    onExport(exportType);
  });

  const footer = (
    <div className='flex justify-end gap-2'>
      <Button variant='outline' onClick={onClose} disabled={isExporting}>
        {t('inquiries.export_dialog.cancel')}
      </Button>
      <Button onClick={() => void handleExport()} disabled={isExporting}>
        {isExporting && <Loader2 className='mr-2 size-4 animate-spin' />}
        {t('inquiries.export_dialog.confirm')}
      </Button>
    </div>
  );

  return (
    <AppDialogModal isOpen={isOpen} setIsOpen={onClose} title={tCommon('export.title')} width={520} footer={footer}>
      <div className='space-y-4'>
        <p className='text-muted-foreground text-sm'>{t('inquiries.export_dialog.description')}</p>

        <AppRadioGroupFormField control={control} name='exportType' label={t('inquiries.export_dialog.type_label')} options={options} />

        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
          <div className='flex gap-2'>
            <AlertCircle className='mt-0.5 size-4 shrink-0 text-yellow-600' />
            <div>
              <p className='text-sm font-medium text-yellow-900'>{t('inquiries.export_dialog.privacy_notice')}</p>
              <p className='text-sm text-yellow-700'>{t('inquiries.export_dialog.privacy_notice_desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </AppDialogModal>
  );
}
