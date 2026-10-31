import { ReactNode } from 'react';

type HeaderIconTooltipProps = {
  children: ReactNode;
  label: string;
};

export const HeaderIconTooltip = ({ children, label }: HeaderIconTooltipProps) => (
  <span className='group relative inline-flex'>
    {children}
    <span
      role='tooltip'
      className='body-14 bg-text-main pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-xs px-1.5 py-0.5 whitespace-nowrap text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100'>
      {label}
      <span className='border-t-text-main absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-8 border-x-transparent' />
    </span>
  </span>
);
