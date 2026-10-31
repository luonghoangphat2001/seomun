import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { NavLinkView } from '@/app/navigation/nav-config';
import { navIcons } from '@/app/navigation/nav-icons';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/utils/cn';

interface SidebarNavLinkProps {
  item: NavLinkView;
}

export function SidebarNavLink({ item }: SidebarNavLinkProps) {
  const { t } = useTranslation('nav');
  const Icon = navIcons[item.icon];

  return (
    <SidebarGroup className='relative'>
      {item.isActive && (
        <div className='from-sidebar-primary to-sidebar-primary/50 absolute top-2 bottom-2 left-0 w-1 rounded-full bg-linear-to-b opacity-100 transition-all duration-300 motion-reduce:transition-none' />
      )}
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={item.isActive}
            className={cn(
              'button-13 h-10 gap-3 px-3 transition-colors duration-200',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              'focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground',
              item.isActive && 'data-active:bg-sidebar-primary/15 data-active:text-sidebar-primary font-bold',
            )}
          >
            <Link to={item.to}>
              <Icon className={cn('size-4 shrink-0 transition-colors duration-200', item.isActive && 'text-sidebar-primary')} aria-hidden='true' />
              <span className={cn('truncate', item.isActive && 'font-bold!')}>{t(item.labelKey)}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
