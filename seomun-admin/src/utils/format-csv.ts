export function escapeCsv(value: string | number | boolean) {
  const escaped = String(value).replace(/"/g, '""');
  return `"${escaped}"`;
}

export function downloadCsv(content: string, fileName: string) {
  // BOM so Excel opens UTF-8 (Korean) text correctly
  const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
