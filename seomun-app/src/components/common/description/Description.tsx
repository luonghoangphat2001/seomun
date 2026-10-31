'use client';

import { ChevDown } from '@/icons';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { ReactNode, useState } from 'react';

type DescriptionProps = {
  mode?: 'info' | 'form';
  children?: ReactNode;
  title: ReactNode;
  isCollapse?: boolean;
  defaultOpen?: boolean;
  contentKey?: string;
  className?: string;
  extra?: ReactNode;
  titleClassName?: string;
  isTitleBorder?: boolean;
};

export const Description = ({
  mode = 'info',
  children,
  title,
  isCollapse = true,
  defaultOpen = false,
  contentKey,
  className,
  extra,
  titleClassName,
  isTitleBorder = true,
}: DescriptionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div key={contentKey} className={className}>
      <div
        className={cn(
          'border-text-main flex flex-wrap items-center justify-between gap-1',
          mode === 'info' && 'border-b-2 px-3 pb-4',
          mode === 'form' && isTitleBorder && 'md:border-b-2 md:pb-4',
        )}
        onClick={() => setOpen(!open)}>
        <div className={cn(mode === 'info' && 'title-16 md:title-18', mode === 'form' && 'title-20', titleClassName)}>
          {title}
        </div>
        {extra}
        {isCollapse && (
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
            <ChevDown className='size-6' />
          </motion.div>
        )}
      </div>
      {isCollapse ? (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key={contentKey || 'content'}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className='overflow-hidden'>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        children
      )}
    </div>
  );
};
