import type { NavItemView } from '@/app/navigation/nav-config';

import { SidebarNavGroup } from './SidebarNavGroup';
import { SidebarNavLink } from './SidebarNavLink';

interface SidebarNavNodeProps {
  item: NavItemView;
  onOpenChange: (groupId: string, open: boolean) => void;
}

export function SidebarNavNode({ item, onOpenChange }: SidebarNavNodeProps) {
  if (item.type === 'link') {
    return <SidebarNavLink item={item} />;
  }

  return <SidebarNavGroup group={item} onOpenChange={onOpenChange} />;
}
