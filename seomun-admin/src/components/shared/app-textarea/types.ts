import type { ComponentProps } from 'react';

export type AppTextareaSize = 'sm' | 'md' | 'lg';

export type AppTextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export type AppTextareaProps = Omit<ComponentProps<'textarea'>, 'value' | 'defaultValue' | 'onChange' | 'aria-invalid'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  size?: AppTextareaSize;
  isInvalid?: boolean;
  resize?: AppTextareaResize;
  minRows?: number;
  maxRows?: number;
};
