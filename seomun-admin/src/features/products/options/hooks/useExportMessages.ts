import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ErpExportType } from '../enums';

export function useExportMessages() {
  const { t } = useTranslation('common');

  const getSuccessMessage = useCallback(
    (type: ErpExportType, count: number): string => {
      const messageKeys = {
        [ErpExportType.ALL]: 'export.success_all',
        [ErpExportType.CURRENT_PAGE]: 'export.success_current',
        [ErpExportType.SELECTED]: 'export.success_selected',
      } as const;

      const key = messageKeys[type];

      return key ? t(key, { count }) : t('export.success_default');
    },
    [t],
  );

  const messages = useMemo(
    () => ({
      processing: t('export.processing'),
      error: t('export.error'),
      default: t('export.success_default'),
    }),
    [t],
  );

  return { getSuccessMessage, messages };
}
