import type { ReactNode } from 'react';

export type AppSelectSize = 'sm' | 'md' | 'lg';

export type AppSelectOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  group?: string;
  disabled?: boolean;
  description?: ReactNode;
  keywords?: string[];
};

type AppSelectBaseProps<T extends string = string> = {
  options: AppSelectOption<T>[];
  placeholder?: ReactNode;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  size?: AppSelectSize;
  disabled?: boolean;
  isInvalid?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  onSearchValueChange?: (value: string) => void;
  /** Called when the option list is scrolled near the bottom — pair with a paginated/infinite query. */
  onReachEnd?: () => void;
  /** Shows a loading row at the end of the list while the next page loads. */
  isFetchingNextPage?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  commandClassName?: string;
};

export type AppSingleSelectProps<T extends string = string> = AppSelectBaseProps<T> & {
  mode?: 'single';
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T | undefined) => void;
};

export type AppMultipleSelectProps<T extends string = string> = AppSelectBaseProps<T> & {
  mode: 'multiple';
  value?: T[];
  defaultValue?: T[];
  onValueChange?: (value: T[]) => void;
  maxSelectedDisplay?: number;
};

export type AppSelectProps<T extends string = string> = AppSingleSelectProps<T> | AppMultipleSelectProps<T>;
