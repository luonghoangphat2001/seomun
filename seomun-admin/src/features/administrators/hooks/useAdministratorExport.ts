import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { getApiErrorMessage } from '@/utils/api-error';
import { downloadFileFromUrl } from '@/utils/download-file';
import { formatDateOnly } from '@/utils/format-date';

import { checkAdministratorExportStatusAPI, exportAdministratorsExcelAPI, type AdministratorExportFilters } from '../api';
import { AdministratorExportExcelType } from '../enums';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'administrator-export';

const SUCCESS_KEYS = {
  [AdministratorExportExcelType.ALL]: 'export.success_all',
  [AdministratorExportExcelType.CURRENT_PAGE]: 'export.success_current',
  [AdministratorExportExcelType.SELECTED]: 'export.success_selected',
} as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type UseAdministratorExportOptions = {
  filters: AdministratorExportFilters;
  page: number;
  perPage: number;
  totalCount: number;
  currentPageCount: number;
  selectedIds: number[];
};

export function useAdministratorExport({ filters, page, perPage, totalCount, currentPageCount, selectedIds }: UseAdministratorExportOptions) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const [isExporting, setIsExporting] = useState(false);

  /** Resolves true once the file is downloaded, false on failure (the error toast is already shown). */
  const startExport = async (type: AdministratorExportExcelType) => {
    const errorMessage = tCommon('export.error');
    const count = {
      [AdministratorExportExcelType.ALL]: totalCount,
      [AdministratorExportExcelType.CURRENT_PAGE]: currentPageCount,
      [AdministratorExportExcelType.SELECTED]: selectedIds.length,
    }[type];
    setIsExporting(true);
    toast.loading(tCommon('export.processing'), { id: TOAST_ID });

    try {
      const { history } = (
        await exportAdministratorsExcelAPI({
          ...filters,
          export_type: type,
          ...(type === AdministratorExportExcelType.CURRENT_PAGE && { current_page: page, per_page: perPage }),
          ...(type === AdministratorExportExcelType.SELECTED && { selected_ids: selectedIds }),
        })
      ).data;
      const deadline = Date.now() + POLL_TIMEOUT_MS;
      let status = '';
      let filePath: string | null = null;

      while (status !== 'completed') {
        if (status === 'failed' || Date.now() > deadline) {
          throw new Error(errorMessage);
        }

        await wait(POLL_INTERVAL_MS);
        const progress = (await checkAdministratorExportStatusAPI(history.id)).data.history;
        status = progress.status.toLowerCase();
        filePath = progress.file_path;
      }

      if (!filePath) {
        throw new Error(errorMessage);
      }

      await downloadFileFromUrl(filePath, `${t('administrators.export_dialog.file_name_prefix')}_${formatDateOnly(new Date())}.xlsx`);
      toast.success(tCommon(SUCCESS_KEYS[type], { count }), { id: TOAST_ID });
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, errorMessage), { id: TOAST_ID });
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, startExport };
}
