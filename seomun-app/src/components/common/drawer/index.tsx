'use client';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const drawerVariants = cva('fixed z-[10000] bg-gray-00 shadow-2xl flex flex-col transition-all duration-300', {
  variants: {
    position: {
      left: 'top-0 left-0 h-full',
      right: 'top-0 right-0 h-full',
      top: 'top-0 left-0 w-full',
      bottom: 'bottom-0 left-0 w-full',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
      xl: '',
      full: 'w-full h-full',
    },
  },
  compoundVariants: [
    {
      position: ['left', 'right'],
      size: 'sm',
      className: 'w-[280px]',
    },
    {
      position: ['left', 'right'],
      size: 'md',
      className: 'w-[340px] max-w-[85%]',
    },
    {
      position: ['left', 'right'],
      size: 'lg',
      className: 'w-[450px] max-w-[90%]',
    },
    {
      position: ['top', 'bottom'],
      size: 'sm',
      className: 'h-[200px]',
    },
    {
      position: ['top', 'bottom'],
      size: 'md',
      className: 'h-[400px] max-h-[85%]',
    },
  ],
  defaultVariants: {
    position: 'right',
    size: 'md',
  },
});

export interface DrawerProps extends VariantProps<typeof drawerVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
}

export const Drawer = ({
  isOpen,
  onClose,
  position = 'right',
  size = 'md',
  children,
  className,
  overlayClassName,
  closeOnOverlayClick = true,
}: DrawerProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const variants = {
    initial: {
      x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
      y: position === 'bottom' ? '100%' : position === 'top' ? '-100%' : 0,
    },
    animate: { x: 0, y: 0 },
    exit: {
      x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
      y: position === 'bottom' ? '100%' : position === 'top' ? '-100%' : 0,
    },
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-[10000]'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className={cn('absolute inset-0 bg-black/60 backdrop-blur-[2px]', overlayClassName)}
          />

          <motion.div
            initial='initial'
            animate='animate'
            exit='exit'
            variants={variants}
            transition={{ damping: 10, stiffness: 100 }}
            className={cn(drawerVariants({ position, size }), className)}
            onWheel={(e) => e.stopPropagation()}>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

Drawer.displayName = 'Drawer';
