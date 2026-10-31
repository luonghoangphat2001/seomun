import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

type CategoryTagProps = {
  children: React.ReactNode;
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'gray' | 'default';
  className?: string;
};

const COLOR_CLASS_MAP: Record<string, string> = {
  green: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  red: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  blue: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  gray: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
  default: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100',
};

export function CategoryTag({ children, color = 'default', className }: CategoryTagProps) {
  return (
    <Badge
      variant='outline'
      className={cn('items-center rounded bg-[#e6f7ff] px-2 py-1 text-xs', COLOR_CLASS_MAP[color] ?? COLOR_CLASS_MAP.default, className)}
    >
      {children}
    </Badge>
  );
}
