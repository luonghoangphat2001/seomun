'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  align?: 'left' | 'right' | 'center';
}

export const Popover: React.FC<PopoverProps> = ({ trigger, children, className, contentClassName, align = 'center' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openPopover = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  const closePopover = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  useEffect(() => () => clearCloseTimeout(), []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        clearCloseTimeout();
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate position
  useEffect(() => {
    if (isOpen && containerRef.current && popoverRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = popoverRef.current.offsetWidth;

      let left = rect.left;

      if (align === 'left') {
        left = rect.left;
      } else if (align === 'right') {
        left = rect.right - popoverWidth;
      } else {
        // center
        left = rect.left + rect.width / 2 - popoverWidth / 2;
      }

      // Prevent overflow
      const padding = 8;
      left = Math.max(padding, Math.min(left, window.innerWidth - popoverWidth - padding));

      setPosition({
        top: rect.bottom + 12,
        left,
      });
    }
  }, [isOpen, align]);

  return (
    <div
      className={cn('relative inline-block', className)}
      ref={containerRef}
      onMouseEnter={openPopover}
      onMouseLeave={closePopover}>
      <div>{trigger}</div>

      {isOpen &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={openPopover}
                onMouseLeave={closePopover}
                className={cn(
                  'border-border-soft fixed z-50 w-max max-w-xs rounded-lg border bg-white p-2.5 shadow-xl ring-1 ring-black/5',
                  contentClassName,
                )}
                style={{
                  top: position.top,
                  left: position.left,
                }}>
                <div className='caption-12 text-text-main whitespace-pre-line'>{children}</div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};
