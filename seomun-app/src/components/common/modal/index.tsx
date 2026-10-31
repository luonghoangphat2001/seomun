'use client';

import { XIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { useLenis } from 'lenis/react';
import { AnimatePresence, motion } from 'motion/react';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../button';

const modalVariants = cva('relative flex flex-col bg-white overflow-hidden shadow-2xl transition-all duration-300 mx-4 md:mx-0', {
  variants: {
    size: {
      xs: 'w-full max-w-[320px]',
      sm: 'w-full max-w-[400px]',
      md: 'w-full max-w-[560px]',
      lg: 'w-full max-w-[800px]',
      xl: 'w-full max-w-[1024px]',
      '2xl': 'w-full max-w-[1280px]',
      full: 'w-full h-full max-w-none rounded-none',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
    },
    position: {
      center: 'my-auto',
      top: 'mt-20 mb-auto',
      bottom: 'mt-auto mb-0 rounded-b-none w-full max-w-auto mx-auto',
    },
  },
  defaultVariants: {
    size: 'md',
    rounded: 'xl',
    position: 'center',
  },
});

export interface ModalHandle {
  open: () => void;
  close: () => void;
}

export interface ModalProps extends VariantProps<typeof modalVariants> {
  children?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  titleClassName?: string;
  titleContainerClassName?: string;
  bodyClassName?: string;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

export const Modal = forwardRef<ModalHandle, ModalProps>(
  (
    {
      children,
      title,
      description,
      footer,
      size,
      rounded,
      position,
      className,
      overlayClassName,
      titleClassName,
      titleContainerClassName,
      bodyClassName,
      onClose,
      closeOnOverlayClick = true,
      closeOnEsc = true,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const lenis = useLenis();

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => {
      setIsOpen(false);
      onClose?.();
    }, [onClose]);

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (closeOnEsc && e.key === 'Escape') close();
      };
      if (isOpen) {
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        lenis?.stop();
      }
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
        lenis?.start();
      };
    }, [isOpen, close, closeOnEsc, lenis]);

    if (!isOpen) return null;

    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <div
            data-lenis-prevent
            className='fixed inset-0 z-[9999] flex items-center justify-center overflow-x-hidden overflow-y-auto'>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOnOverlayClick ? close : undefined}
              className={cn('fixed inset-0 bg-black/15 backdrop-blur-[0.5px]', overlayClassName)}
            />

            {/* Modal Content */}
            <motion.div
              initial={position === 'bottom' ? { opacity: 0, y: '100%' } : { opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={position === 'bottom' ? { opacity: 0, y: '100%' } : { opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn('max-h-[90dvh]', modalVariants({ size, rounded, position }), className)}>
              {/* Header */}
              {(title || description) && (
                <div
                  className={cn(
                    'flex items-start justify-between p-4',
                    position === 'bottom' && 'border-border-soft border-b',
                    titleContainerClassName,
                  )}>
                  <div className='flex w-full flex-col gap-1'>
                    {title && <div className={cn('text-text-main title-18 line-clamp-1 pt-2', titleClassName)}>{title}</div>}
                    {description && <p className='text-text-soft body-14'>{description}</p>}
                  </div>
                  {position === 'bottom' && (
                    <Button variant={'ghost'} size={'icon'} onClick={close} className='h-6'>
                      <XIcon width={24} height={24} />
                    </Button>
                  )}
                </div>
              )}

              {/* Body */}
              <div data-lenis-prevent className={cn('flex-1 overflow-y-auto', bodyClassName)}>
                {children}
              </div>

              {/* Footer */}
              {footer && <div className={cn('p-4', position === 'bottom' && 'border-border-soft border-t')}>{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body,
    );
  },
);

Modal.displayName = 'Modal';
