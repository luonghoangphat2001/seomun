import { ExportStatus } from '../enums';

export type CategoryExportResult = { fileUrl: string; fileName: string };

export function parseCategoryExportStatus(status: string): ExportStatus {
  const normalizedStatus = status.trim().toLowerCase();

  switch (normalizedStatus) {
    case ExportStatus.IDLE:
    case ExportStatus.PROCESSING:
    case ExportStatus.COMPLETED:
    case ExportStatus.FAILED:
      return normalizedStatus;
    default:
      throw new Error(`Unsupported export status: ${status}`);
  }
}

export function getCompletedExportResult(status: ExportStatus, filePath: string, fileName: string): CategoryExportResult | undefined {
  if (status !== 'completed') return undefined;
  if (!filePath) throw new Error('Export completed without a file');

  return { fileUrl: filePath, fileName };
}
