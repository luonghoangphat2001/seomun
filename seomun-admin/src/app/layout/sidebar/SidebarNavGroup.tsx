import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { NavGroupView } from '@/app/navigation/nav-config';
import { navIcons } from '@/app/navigation/nav-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@/components/ui/sidebar';
import { cn } from '@/utils/cn';

import { SidebarNavItem } from './SidebarNavItem';

interface SidebarNavGroupProps {
  group: NavGroupView;
  onOpenChange: (groupId: string, open: boolean) => void;
}

export function SidebarNavGroup({ group, onOpenChange }: SidebarNavGroupProps) {
  const { t } = useTranslation('nav');
  const Icon = navIcons[group.icon];

  return (
    <SidebarGroup className='relative'>
      {group.isActive && (
        <div className='from-sidebar-primary to-sidebar-primary/50 absolute top-2 bottom-2 left-0 w-1 rounded-full bg-linear-to-b opacity-100 transition-all duration-300 motion-reduce:transition-none' />
      )}
      <Collapsible open={group.isExpanded} onOpenChange={(open) => onOpenChange(group.id, open)} className='group/collapsible'>
        <SidebarMenu>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                isActive={group.isActive}
                className={cn(
                  'button-13 h-10 cursor-pointer gap-3 px-3 transition-colors duration-200',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  'focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground',
                  group.isActive && 'data-active:bg-sidebar-primary/15 data-active:text-sidebar-primary font-bold',
                )}
              >
                <Icon className={cn('size-4 shrink-0 transition-colors duration-200', group.isActive && 'text-sidebar-primary')} aria-hidden='true' />
                <span className={cn('truncate', group.isActive && 'font-bold!')}>{t(group.labelKey)}</span>
                <ChevronRight
                  className={cn(
                    'text-sidebar-foreground/70 ml-auto size-4 shrink-0 transition-transform duration-200',
                    'group-data-[state=open]/collapsible:rotate-90',
                    'motion-reduce:transition-none',
                    group.isActive && 'text-sidebar-primary',
                  )}
                  aria-hidden='true'
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </SidebarMenuItem>
        </SidebarMenu>

        <CollapsibleContent className='motion-reduce:transition-none'>
          <SidebarGroupContent className='motion-reduce:transition-none'>
            <SidebarMenuSub className='border-sidebar-border border-l'>
              {group.children.map((child) => (
                <SidebarNavItem key={child.id} id={child.id} labelKey={child.labelKey} to={child.to} isActive={child.isActive} />
              ))}
            </SidebarMenuSub>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
