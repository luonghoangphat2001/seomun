import { navConfig, type NavConfig, type NavGroupChildItem, type NavGroupItem, type NavItem, type NavLinkItem } from '@/app/navigation/nav-config';
import type { UserRole } from '@/lib/auth';
import { hasRequiredRole } from '@/lib/auth';
import { getNavItemMenuKey } from '@/features/permissions';

export type NavMatch = {
  group?: NavGroupItem;
  item: NavLinkItem | NavGroupChildItem;
};

function isGroup(item: NavItem): item is NavGroupItem {
  return item.type === 'group';
}

function isItemAllowed(item: NavLinkItem | NavGroupChildItem, allowedKeys: Set<string>) {
  const menuKey = getNavItemMenuKey(item);
  return !menuKey || allowedKeys.has(menuKey);
}

export function filterNavByRole(items: NavConfig, role: UserRole): NavConfig {
  return items.flatMap<NavItem>((item) => {
    if (!hasRequiredRole(role, item.allowedRoles)) {
      return [];
    }

    if (!isGroup(item)) {
      return [item];
    }

    const children = item.children.filter((child) => hasRequiredRole(role, child.allowedRoles));

    if (children.length === 0) {
      return [];
    }

    return [{ ...item, children }];
  });
}

/** Hides nav items whose menu key is not granted. `null` keys (loading) shows everything. */
export function filterNavByPermission(items: NavConfig, allowedKeys: Set<string> | null): NavConfig {
  if (allowedKeys === null) {
    return items;
  }

  return items.flatMap<NavItem>((item) => {
    if (!isGroup(item)) {
      return isItemAllowed(item, allowedKeys) ? [item] : [];
    }

    const children = item.children.filter((child) => isItemAllowed(child, allowedKeys));

    if (children.length === 0) {
      return [];
    }

    return [{ ...item, children }];
  });
}

/** Resolves the permission menu key required for a pathname, or undefined if the page is not permission-gated. */
export function getMenuKeyForPathname(pathname: string): string | undefined {
  const match = findNavMatch(navConfig, pathname);
  return match ? getNavItemMenuKey(match.item) : undefined;
}

export function findNavMatch(items: NavConfig, pathname: string) {
  let bestMatch: NavMatch | undefined;

  for (const item of items) {
    if (!isGroup(item)) {
      const exactMatch = pathname === item.to;
      const nestedMatch = item.to !== '/' && pathname.startsWith(`${item.to}/`);

      if (exactMatch || nestedMatch) {
        if (!bestMatch || item.to.length > bestMatch.item.to.length) {
          bestMatch = { item };
        }
      }

      continue;
    }

    for (const child of item.children) {
      const exactMatch = pathname === child.to;
      const nestedMatch = child.to !== '/' && pathname.startsWith(`${child.to}/`);

      if (exactMatch || nestedMatch) {
        if (!bestMatch || child.to.length > bestMatch.item.to.length) {
          bestMatch = { group: item, item: child };
        }
      }
    }
  }

  return bestMatch;
}
