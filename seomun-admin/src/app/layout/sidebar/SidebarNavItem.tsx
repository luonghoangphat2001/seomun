import { Link } from '@tanstack/react-router';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import { SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import { cn } from '@/utils/cn';

interface SidebarNavItemProps {
  id: string;
  labelKey: ParseKeys<'nav'>;
  to: string;
  isActive: boolean;
}

export function SidebarNavItem({ id, labelKey, to, isActive }: SidebarNavItemProps) {
  const { t } = useTranslation('nav');

  return (
    <SidebarMenuSubItem key={id}>
      <SidebarMenuSubButton
        asChild
        isActive={isActive}
        className={cn(
          'transition-colors duration-150 motion-reduce:transition-none',
          'hover:bg-sidebar-accent',
          'focus-visible:bg-sidebar-accent',
          isActive && 'data-active:bg-sidebar-primary/15 data-active:text-sidebar-primary font-bold',
        )}
      >
        <Link to={to}>
          <span className={cn('truncate', isActive && 'font-bold!')}>{t(labelKey)}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
