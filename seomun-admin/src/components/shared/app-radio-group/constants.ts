export const APP_RADIO_GROUP_ORIENTATION_CLASSES = {
  vertical: 'grid gap-2',
  horizontal: 'flex flex-wrap gap-4',
} as const;

export const APP_RADIO_GROUP_ITEM_SIZE_CLASSES = {
  sm: 'gap-2',
  md: 'gap-2.5',
  lg: 'gap-3',
} as const;

export const APP_RADIO_GROUP_CONTROL_SIZE_CLASSES = {
  sm: 'size-3.5 [&_[data-slot=radio-group-indicator]]:size-3.5 [&_[data-slot=radio-group-indicator]>span]:size-1.5',
  md: 'size-4 [&_[data-slot=radio-group-indicator]]:size-4 [&_[data-slot=radio-group-indicator]>span]:size-2',
  lg: 'size-5 [&_[data-slot=radio-group-indicator]]:size-5 [&_[data-slot=radio-group-indicator]>span]:size-2.5',
} as const;

export const APP_RADIO_GROUP_LABEL_SIZE_CLASSES = {
  sm: 'text-[0.8rem]',
  md: 'text-sm',
  lg: 'text-sm',
} as const;

export const APP_RADIO_GROUP_DESCRIPTION_SIZE_CLASSES = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
} as const;
