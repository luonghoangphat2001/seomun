// Offset pagination can hand back the same row on two pages — duplicate values break both the React key and cmdk's selection.
export function dedupeByValue<TOption extends { value: string }>(options: TOption[]) {
  return [...new Map(options.map((option) => [option.value, option])).values()];
}
