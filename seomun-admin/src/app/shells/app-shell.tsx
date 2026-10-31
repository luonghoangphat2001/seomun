import type { PropsWithChildren } from 'react';

import { MenuPermissionGuard } from '@/app/guards/menu-permission-guard';
import { AppSidebar } from '@/app/layout/sidebar/AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <SidebarProvider defaultOpen className='h-svh overflow-hidden'>
      <AppSidebar />
      <SidebarInset className='overflow-hidden'>
        <SidebarTrigger className='border-border bg-background fixed top-4 left-4 z-30 shadow-sm md:hidden' />
        <div className='flex-1 overflow-auto pt-14 md:pt-0'>
          <MenuPermissionGuard>{children}</MenuPermissionGuard>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
