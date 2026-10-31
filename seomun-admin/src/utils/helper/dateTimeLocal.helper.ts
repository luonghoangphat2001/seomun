export const toDateTimeLocal = (date?: string | null): string | undefined => {
  if (!date) return undefined;
  if (date.length <= 10) return `${date}T00:00`;
  return date.slice(0, 16);
};
