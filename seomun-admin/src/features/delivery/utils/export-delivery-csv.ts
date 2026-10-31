import { downloadCsv, escapeCsv } from '@/utils/format-csv';

export function exportDeliveryCsv(headers: string[], rows: Array<Array<string | number | boolean>>, fileName: string) {
  const csvContent = [headers, ...rows].map((row) => row.map((value) => escapeCsv(value)).join(',')).join('\n');

  downloadCsv(csvContent, fileName);
}
