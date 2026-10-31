export const APP_SWITCH_PRIMITIVE_SIZE = {
  sm: 'sm',
  md: 'default',
  lg: 'default',
} as const;

export const APP_SWITCH_SIZE_CLASSES = {
  sm: '',
  md: '',
  lg: 'data-[size=default]:h-[22px] data-[size=default]:w-10 [&_[data-slot=switch-thumb]]:size-5',
} as const;
