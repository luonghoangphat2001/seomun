import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { PaymentExportExcelType } from '../enums';

export const useExportMessages = () => {
  const { t: tCommon } = useTranslation('common');

  const getSuccessMessage = useCallback(
    (type: PaymentExportExcelType, count: number): string => {
      const messageKeys = {
        [PaymentExportExcelType.ALL]: 'export.success_all',
        [PaymentExportExcelType.CURRENT_PAGE]: 'export.success_current',
        [PaymentExportExcelType.SELECTED]: 'export.success_selected',
      } as const;

      const key = messageKeys[type];

      return key ? tCommon(key, { count }) : tCommon('export.success_default');
    },
    [tCommon],
  );

  const messages = {
    processing: tCommon('export.processing'),
    error: tCommon('export.error'),
    default: tCommon('export.success_default'),
  };

  return {
    getSuccessMessage,
    messages,
  };
};
