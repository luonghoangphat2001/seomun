import type { NavItemView } from '@/app/navigation/nav-config';
import { SidebarContent } from '@/components/ui/sidebar';

import { SidebarNavNode } from './SidebarNavNode';

interface SidebarNavProps {
  items: NavItemView[];
  onOpenChange: (groupId: string, open: boolean) => void;
}

export function SidebarNav({ items, onOpenChange }: SidebarNavProps) {
  return (
    <SidebarContent className='py-2'>
      {items.map((item) => (
        <SidebarNavNode key={item.id} item={item} onOpenChange={onOpenChange} />
      ))}
    </SidebarContent>
  );
}
