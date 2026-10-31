// import type * as React from 'react';

// import type { AppSelectOption, AppSelectProps } from './types';

// type AppSelectMode = NonNullable<AppSelectProps['mode']>;

// export function isMultipleMode(mode: AppSelectMode) {
//   return mode === 'multiple';
// }

// export function normalizeSingleValue<TValue extends string>(value: TValue | TValue[] | undefined) {
//   if (Array.isArray(value)) {
//     return value[0];
//   }

//   return value;
// }

// export function normalizeMultipleValue<TValue extends string>(value: TValue | TValue[] | undefined) {
//   if (Array.isArray(value)) {
//     return value;
//   }

//   return value ? [value] : [];
// }

// export function getOptionSearchText(option: AppSelectOption) {
//   const labelText =
//     typeof option.label === 'string' || typeof option.label === 'number'
//       ? String(option.label)
//       : Array.isArray(option.keywords)
//         ? option.keywords.join(' ')
//         : (option.keywords ?? '');

//   const keywordText = Array.isArray(option.keywords) ? option.keywords.join(' ') : (option.keywords ?? '');

//   return `${labelText} ${keywordText}`.trim().toLowerCase();
// }

// export function filterOptions(options: AppSelectOption[], query: string) {
//   const normalizedQuery = query.trim().toLowerCase();

//   if (!normalizedQuery) return options;

//   return options.filter((option) => getOptionSearchText(option).includes(normalizedQuery));
// }

// export function getSelectedOptions(options: AppSelectOption[], selectedValues: string[]) {
//   if (selectedValues.length === 0) return [];

//   const selectedSet = new Set(selectedValues);
//   return options.filter((option) => selectedSet.has(option.value));
// }

// export function getSingleSelectedOption(options: AppSelectOption[], selectedValue?: string) {
//   if (!selectedValue) return undefined;
//   return options.find((option) => option.value === selectedValue);
// }

// export function renderChipLabel(label: React.ReactNode) {
//   return typeof label === 'string' || typeof label === 'number' ? label : 'Selected';
// }
