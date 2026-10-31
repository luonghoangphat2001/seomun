import { Link } from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';

import { SidebarHeader } from '@/components/ui/sidebar';
import { branding } from '@/config/branding';
import { IMAGE } from '@/assets/images';

export function SidebarBrand({ children }: PropsWithChildren) {
  return (
    <SidebarHeader className='border-sidebar-border rounded-xl border bg-white/20 p-2'>
      <Link to={branding.homePath} className='flex items-center justify-center gap-3'>
        <img src={IMAGE.logo} alt={branding.appName} loading='eager' className='h-auto w-[150px]' />
        {/* <span
          className={cn(
            'title-16 text-sidebar-foreground truncate font-bold tracking-tight uppercase',
            'transition-opacity duration-300',
            'group-data-[collapsible=icon]:hidden',
          )}
        >
          {branding.appName}
        </span> */}
      </Link>
      {children}
    </SidebarHeader>
  );
}
