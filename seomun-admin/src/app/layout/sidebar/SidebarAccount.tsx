import { useNavigate } from '@tanstack/react-router';
import { ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { routePaths } from '@/app/router/route-paths';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth-store';

export function SidebarAccount() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const displayName = useAuthStore((state) => state.user?.name);
  const username = useAuthStore((state) => state.user?.username);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate({ to: routePaths.login });
  };

  return (
    <section className='border-sidebar-border mt-2 border-t pt-2'>
      <div className='flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:justify-center'>
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className='min-w-0 flex-1 group-data-[collapsible=icon]:hidden'>
          <CollapsibleTrigger className='hover:bg-sidebar-accent flex w-full min-w-0 items-center gap-2 rounded-md p-1 text-left transition-colors'>
            <div className='min-w-0 flex-1'>
              <p className='text-sidebar-foreground truncate text-sm font-semibold'>{displayName || 'Guest'}</p>
              <p className='text-sidebar-foreground/65 truncate text-xs'>{username || ''}</p>
            </div>
            <ChevronDown
              className='text-sidebar-foreground/65 size-4 shrink-0 transition-transform data-[state=open]:rotate-180'
              data-state={isOpen ? 'open' : 'closed'}
            />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <Button
              type='button'
              variant='ghost'
              className='text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mt-1 w-full justify-start gap-2'
              onClick={handleLogout}
              title={t('action.logout')}
            >
              <LogOut className='size-4 shrink-0' />
              <span>{t('action.logout')}</span>
            </Button>
          </CollapsibleContent>
        </Collapsible>

        <SidebarTrigger
          className='text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shrink-0'
          title='Toggle sidebar'
        />
      </div>
    </section>
  );
}
