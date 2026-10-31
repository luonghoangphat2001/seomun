import React from 'react';
import { cn } from '@/lib/utils';

export interface TabOption {
  label: string;
  value: string;
}

export interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
}

export const Tabs: React.FC<TabsProps> = ({ options, value, onChange, className, tabClassName, activeTabClassName }) => {
  return (
    <div className={cn('bg-border-light flex items-center rounded-xl p-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'body-14 text-text-main rounded-lg px-2.5 py-1.5 transition-colors',
            tabClassName,
            value === option.value ? cn('title-14 bg-white shadow-md', activeTabClassName) : 'text-[#0A0A0A] hover:bg-gray-100',
          )}>
          {option.label}
        </button>
      ))}
    </div>
  );
};
