import { formatDateTime } from '@/utils/format-date';

import type { TaskLogRESP } from '../api/task-log.response';
import { formatJsonValueLines, linePartsToText } from './format-json-value';

function formatValuesDict(values: Record<string, any> | unknown[] | undefined, lang = 'ko'): string {
  if (!values) return '-';
  if (Array.isArray(values)) {
    if (values.length === 0) return '-';
    return JSON.stringify(values);
  }
  return Object.entries(values)
    .map(([key, item]) => {
      const label = item.label?.[lang] || item.label?.ko || item.label?.en || key;
      const jsonText =
        typeof item.value === 'object' && item.value !== null ? formatJsonValueLines(item.value).map((line) => linePartsToText(line)) : [];
      const val = item.value === null ? 'NULL' : typeof item.value === 'object' ? jsonText.join(' / ') || '-' : String(item.value);
      return `${label}: ${val}`;
    })
    .join('; ');
}

export function getTaskLogExportRows(items: TaskLogRESP[]) {
  return items.map((item) => ({
    no: item.no ?? 0,
    menu: item.target_menu,
    operator: item.worker?.name ? `${item.worker.name} (${item.worker.email})` : '-',
    task_type: item.task_type,
    target_id: `${item.target_menu} (#${item.data_identifier})`,
    before_value: formatValuesDict(item.before_values),
    after_value: formatValuesDict(item.after_values),
    changed_at: formatDateTime(item.created_at),
  }));
}
