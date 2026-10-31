import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none shadow-sm',
  {
    variants: {
      variant: {
        solid: '',
        outline: 'border bg-transparent',
      },
      color: {
        primary: 'bg-primary text-text-foreground',
        secondary: 'bg-gray-100 text-text-main',
        error: 'bg-error text-text-foreground',
        blue: 'bg-[#2176EF] text-text-foreground',
        yellow: 'bg-[#FBBF24] text-text-foreground',
        red: 'bg-[#EE5F5F] text-text-foreground',
        brown: 'bg-gray-400 text-text-foreground',
        'dark-brown': 'bg-text-secondary text-text-foreground',
        white: 'border-border-soft border bg-white text-text-main',
        black: 'bg-black text-white',
      },
    },
    compoundVariants: [
      {
        variant: 'outline',
        color: 'primary',
        className: 'border-primary bg-primary/5 text-text-brand',
      },
      {
        variant: 'outline',
        color: 'secondary',
        className: 'border-gray-100 bg-gray-100/5 text-text-secondary',
      },
      {
        variant: 'outline',
        color: 'error',
        className: 'border-error bg-error/5 text-error',
      },
      {
        variant: 'outline',
        color: 'blue',
        className: 'border-[#2176EF] bg-[#2176EF]/5 text-[#2176EF]',
      },
      {
        variant: 'outline',
        color: 'yellow',
        className: 'border-[#FBBF24] bg-[#FBBF24]/5 text-[#FBBF24]',
      },
      {
        variant: 'outline',
        color: 'red',
        className: 'border-[#EE5F5F] bg-[#EE5F5F]/5 text-[#EE5F5F]',
      },
      {
        variant: 'outline',
        color: 'brown',
        className: 'border-gray-400 bg-gray-400/5 text-gray-400',
      },
      {
        variant: 'outline',
        color: 'dark-brown',
        className: 'border-text-secondary bg-text-secondary/5 text-text-secondary',
      },
      {
        variant: 'outline',
        color: 'white',
        className: 'border-border-soft bg-white/5 text-text-main',
      },
      {
        variant: 'outline',
        color: 'black',
        className: 'border-black bg-black/5 text-text-main',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'primary',
    },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
export type BadgeColor = NonNullable<VariantProps<typeof badgeVariants>['color']>;

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, color, ...props }: BadgeProps) => {
  return <div className={cn(badgeVariants({ variant, color }), 'caption-12 rounded-[8px] px-3 py-1', className)} {...props} />;
};

Badge.displayName = 'Badge';
