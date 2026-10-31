import { AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppRadioGroupFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import { AccessLogExportType } from '../enums';

type AccessLogExportDialogProps = {
  isOpen: boolean;
  totalCount: number;
  currentPageCount: number;
  selectedCount: number;
  isExporting: boolean;
  onClose: () => void;
  onExport: (type: AccessLogExportType) => void;
};

type ExportForm = {
  exportType: AccessLogExportType;
};

export function AccessLogExportDialog({
  isOpen,
  totalCount,
  currentPageCount,
  selectedCount,
  isExporting,
  onClose,
  onExport,
}: AccessLogExportDialogProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const { control, handleSubmit } = useForm<ExportForm>({
    defaultValues: { exportType: AccessLogExportType.CURRENT_PAGE },
  });

  const options = [
    {
      value: AccessLogExportType.ALL,
      label: (
        <span>
          {t('system_logs.access.export.all')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({totalCount} {t('system_logs.access.export.items')})
          </span>
        </span>
      ),
      description: t('system_logs.access.export.all_desc'),
    },
    {
      value: AccessLogExportType.CURRENT_PAGE,
      label: (
        <span>
          {t('system_logs.access.export.current_page')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({currentPageCount} {t('system_logs.access.export.items')})
          </span>
        </span>
      ),
      description: t('system_logs.access.export.current_page_desc'),
    },
    {
      value: AccessLogExportType.SELECTED,
      label: (
        <span>
          {t('system_logs.access.export.selected')}{' '}
          <span className='text-muted-foreground font-normal'>
            ({selectedCount} {t('system_logs.access.export.items')})
          </span>
        </span>
      ),
      description: t('system_logs.access.export.selected_desc'),
      disabled: selectedCount === 0,
    },
  ];

  const handleExport = handleSubmit(({ exportType }) => {
    onExport(exportType);
  });

  const footer = (
    <div className='flex justify-end gap-2'>
      <Button variant='outline' onClick={onClose} disabled={isExporting}>
        {t('system_logs.access.export.cancel')}
      </Button>
      <Button onClick={() => void handleExport()} disabled={isExporting}>
        {isExporting && <Loader2 className='mr-2 size-4 animate-spin' />}
        {t('system_logs.access.export.confirm')}
      </Button>
    </div>
  );

  return (
    <AppDialogModal isOpen={isOpen} setIsOpen={onClose} title={tCommon('export.title')} width={520} footer={footer}>
      <div className='space-y-4'>
        <p className='text-muted-foreground text-sm'>{t('system_logs.access.export.description')}</p>

        <AppRadioGroupFormField control={control} name='exportType' label={t('system_logs.access.export.type_label')} options={options} />

        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
          <div className='flex gap-2'>
            <AlertCircle className='mt-0.5 size-4 shrink-0 text-yellow-600' />
            <div>
              <p className='text-sm font-medium text-yellow-900'>{t('system_logs.access.export.privacy_notice')}</p>
              <p className='text-sm text-yellow-700'>{t('system_logs.access.export.privacy_notice_desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </AppDialogModal>
  );
}
