import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'cursor-pointer inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 body-14',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-500 active:bg-primary-500/80',
        secondary: 'bg-border-light text-text-main hover:bg-border-soft active:bg-border-soft/80',
        'outline-primary': 'border border-text-brand text-text-brand hover:bg-primary-50 active:bg-primary-50/80',
        'outline-gray': 'border border-border-soft text-text-main hover:bg-border-light active:bg-border-light/80',
        outline: 'border border-border-soft text-text-main hover:bg-border-light active:bg-border-light/80',
        ghost: 'text-text-main hover:bg-gray-100 active:bg-gray-200',
      },
      size: {
        lg: 'h-12 px-6 py-3 rounded-[8px] gap-2',
        md: 'h-10 px-6 py-2 rounded-[8px] gap-2',
        sm: 'h-9 px-4 py-2 rounded-[8px] gap-2',
        xs: 'h-7 px-3 py-1 rounded-[6px] gap-1.5',
        icon: 'h-9 w-9 rounded-[8px]',
        default: 'h-10 px-6 py-2 rounded-[8px] gap-2',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, leftIcon, rightIcon, loading = false, disabled, children, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        type={type || 'button'}
        {...props}>
        {loading && <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />}
        {!loading && leftIcon && <span className='inline-flex'>{leftIcon}</span>}
        <span className='truncate'>{children}</span>
        {!loading && rightIcon && <span className='inline-flex'>{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
