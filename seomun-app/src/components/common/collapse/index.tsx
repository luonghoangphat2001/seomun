'use client';

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { ChevDown } from '@/icons';

export interface CollapseItem {
  key: string | number;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

export interface CollapseProps {
  items: CollapseItem[];
  defaultActiveKey?: string | number | (string | number)[];
  accordion?: boolean;
  className?: string;
  itemClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  iconClassname?: string;
  onChange?: (activeKeys: (string | number)[]) => void;
}

export const Collapse: React.FC<CollapseProps> = ({
  items,
  defaultActiveKey = [],
  accordion = false,
  className,
  itemClassName,
  headerClassName,
  contentClassName,
  iconClassname,
  onChange,
}) => {
  const normalizedDefault = Array.isArray(defaultActiveKey) ? defaultActiveKey : [defaultActiveKey];
  const [activeKeys, setActiveKeys] = useState<(string | number)[]>(normalizedDefault);

  const handleToggle = (key: string | number) => {
    let newActiveKeys: (string | number)[];

    if (accordion) {
      newActiveKeys = activeKeys.includes(key) ? [] : [key];
    } else {
      newActiveKeys = activeKeys.includes(key) ? activeKeys.filter((k) => k !== key) : [...activeKeys, key];
    }

    setActiveKeys(newActiveKeys);
    onChange?.(newActiveKeys);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {items.map((item) => {
        const isActive = activeKeys.includes(item.key);

        return (
          <div key={item.key} className={cn('overflow-hidden border-b border-gray-400 bg-white', itemClassName)}>
            <button
              type='button'
              disabled={item.disabled}
              onClick={() => !item.disabled && handleToggle(item.key)}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between px-4 py-6 text-left transition-colors',
                item.disabled && 'cursor-not-allowed opacity-50',
                headerClassName,
              )}>
              <div className='title-16 flex-1 font-medium'>{item.label}</div>
              <motion.div
                animate={{ rotate: isActive ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='ml-2 text-gray-500'>
                <ChevDown className={cn('text-[32px] font-semibold text-gray-800 md:text-[40px]', iconClassname)} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className='overflow-hidden'>
                  <div className={cn('bg-gray-50 px-4 py-6', contentClassName)}>{item.children}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
