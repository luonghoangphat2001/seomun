import type { NavConfig, NavGroupView, NavItemView } from '@/app/navigation/nav-config';
import { findNavMatch } from '@/app/navigation/nav-filter';

export function getExpandedGroupIdFromPath(items: NavConfig, pathname: string) {
  return findNavMatch(items, pathname)?.group?.id ?? null;
}

export function buildSidebarView(items: NavConfig, pathname: string, expandedGroupIds: string[]): NavItemView[] {
  const match = findNavMatch(items, pathname);

  return items.map((item) => {
    if (item.type === 'link') {
      return {
        ...item,
        isActive: item.id === match?.item.id,
      };
    }

    const children = item.children.map((child) => ({
      ...child,
      isActive: child.id === match?.item.id,
    }));
    const hasActiveChild = children.some((child) => child.isActive);

    const group: NavGroupView = {
      ...item,
      children,
      isActive: hasActiveChild,
      isExpanded: expandedGroupIds.includes(item.id),
    };

    return group;
  });
}
