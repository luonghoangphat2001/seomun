import { useRouterState } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { navConfig } from '@/app/navigation/nav-config';
import { filterNavByPermission, filterNavByRole } from '@/app/navigation/nav-filter';
import { buildSidebarView, getExpandedGroupIdFromPath } from '@/app/navigation/sidebar-view';
import { Sidebar } from '@/components/ui/sidebar';
import { useAllowedMenuKeys } from '@/features/permissions';
import { useAuthStore } from '@/stores/auth-store';

import type { UserRole } from '@/lib/auth';
import { SidebarAccount } from './SidebarAccount';
import { SidebarBrand } from './SidebarBrand';
import { SidebarNav } from './SidebarNav';
import { SidebarNavSkeleton } from './SidebarNavSkeleton';

export function AppSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const role = useAuthStore((state) => state.user?.role);
  const { allowedKeys, isLoading } = useAllowedMenuKeys();
  const filteredNav = useMemo(() => filterNavByPermission(filterNavByRole(navConfig, role as UserRole), allowedKeys), [role, allowedKeys]);
  const expandedGroupIdFromPath = useMemo(() => getExpandedGroupIdFromPath(filteredNav, pathname), [filteredNav, pathname]);
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>(() => (expandedGroupIdFromPath ? [expandedGroupIdFromPath] : []));

  useEffect(() => {
    if (!expandedGroupIdFromPath) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedGroupIds((groupIds) => (groupIds.includes(expandedGroupIdFromPath) ? groupIds : [...groupIds, expandedGroupIdFromPath]));
  }, [expandedGroupIdFromPath]);

  const items = useMemo(() => buildSidebarView(filteredNav, pathname, expandedGroupIds), [expandedGroupIds, filteredNav, pathname]);

  function handleGroupOpenChange(groupId: string, open: boolean) {
    setExpandedGroupIds((groupIds) => (open ? [...new Set([...groupIds, groupId])] : groupIds.filter((id) => id !== groupId)));
  }

  return (
    <Sidebar className='app-sidebar-dark p-2' collapsible='icon' variant='sidebar'>
      <SidebarBrand>
        <SidebarAccount />
      </SidebarBrand>
      {isLoading ? <SidebarNavSkeleton /> : <SidebarNav items={items} onOpenChange={handleGroupOpenChange} />}
    </Sidebar>
  );
}
