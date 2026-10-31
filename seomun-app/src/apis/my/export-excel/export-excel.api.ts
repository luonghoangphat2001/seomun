import { api } from '@/config';
import { ExportExcelDownloadREQ, ExportExcelProgressStatusREQ } from './export-excel.request';
import { ExportExcelDownloadRESP, ExportExcelProgressStatusRESP } from './export-excel.response';

const ENDPOINT = {
  CHECK_PROGRESS_STATUS: (history: number) => `/mypage/export-excel/${history}/check-progress-status`,
  DOWNLOAD: (history: number) => `/mypage/export-excel/${history}/download`,
};

export const ExportExcelApi = {
  checkProgressStatus: ({ history }: ExportExcelProgressStatusREQ) =>
    api.get<ExportExcelProgressStatusRESP>(ENDPOINT.CHECK_PROGRESS_STATUS(history)),
  download: ({ history }: ExportExcelDownloadREQ) =>
    api.get<ExportExcelDownloadRESP>(ENDPOINT.DOWNLOAD(history), {
      responseType: 'blob',
    }),
};
