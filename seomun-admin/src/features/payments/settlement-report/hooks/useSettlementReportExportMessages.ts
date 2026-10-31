import { useTranslation } from 'react-i18next';

export function useSettlementReportExportMessages() {
  const { t } = useTranslation('page');

  return {
    processing: t('payments.settlement_report.export.processing', 'Preparing export…'),
    success: t('payments.settlement_report.export.success', 'Export complete.'),
    error: t('payments.settlement_report.export.error', 'Export failed. Please try again.'),
  };
}
