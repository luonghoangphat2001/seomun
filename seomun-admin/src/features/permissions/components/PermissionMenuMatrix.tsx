import type { ParseKeys } from 'i18next';
import { Check, Plus, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/utils/cn';

import { getNavItemMenuKey } from '../constants';

type MatrixNavMenu = {
  id: string;
  labelKey: ParseKeys<'nav'>;
};

/** Sidebar nav item with its icon resolved. The route passes it in because features must not import the app-layer nav config. */
export type PermissionMatrixNavItem = MatrixNavMenu & {
  type: 'link' | 'group';
  icon: LucideIcon;
  children?: MatrixNavMenu[];
};

type MatrixMenu = {
  id: string;
  labelKey: ParseKeys<'nav'>;
  menuKey?: string;
};

type MatrixSection = {
  id: string;
  labelKey: ParseKeys<'nav'>;
  icon: LucideIcon;
  menus: MatrixMenu[];
  isLink: boolean;
};

function buildSections(navItems: PermissionMatrixNavItem[]): MatrixSection[] {
  return navItems.map((item) => {
    const menus = (item.children ?? [item]).map((menu) => ({
      id: menu.id,
      labelKey: menu.labelKey,
      menuKey: getNavItemMenuKey(menu),
    }));

    return {
      id: item.id,
      labelKey: item.labelKey,
      icon: item.icon,
      menus,
      isLink: item.type === 'link',
    };
  });
}

const CHIP_CLASS_NAME = 'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap';

function getSectionKeys(section: MatrixSection) {
  return section.menus.flatMap((menu) => (menu.menuKey ? [menu.menuKey] : []));
}

function getCheckedState(keys: string[], selectedKeys: Set<string>) {
  const selected = keys.filter((key) => selectedKeys.has(key)).length;
  return { selected, state: selected === 0 ? false : selected === keys.length ? true : ('indeterminate' as const) };
}

type PermissionMenuMatrixProps = {
  navItems: PermissionMatrixNavItem[];
  selectedKeys: Set<string>;
  disabled?: boolean;
  onChange: (menuKeys: string[], checked: boolean) => void;
};

export function PermissionMenuMatrix({ navItems, selectedKeys, disabled = false, onChange }: PermissionMenuMatrixProps) {
  const { t } = useTranslation();
  const sections = useMemo(() => buildSections(navItems), [navItems]);
  const allMenuKeys = useMemo(() => [...new Set(sections.flatMap(getSectionKeys))], [sections]);
  const total = getCheckedState(allMenuKeys, selectedKeys);

  return (
    <div className='bg-card divide-y rounded-lg border'>
      <div className='bg-muted/40 flex flex-wrap items-center justify-between gap-3 px-4 py-3'>
        <label className='flex cursor-pointer items-center gap-3 text-sm font-medium'>
          <Checkbox checked={total.state} disabled={disabled} onCheckedChange={() => onChange(allMenuKeys, total.state !== true)} />
          {t('page.permissions.settings.select_all')}
        </label>
        <span className='text-muted-foreground text-sm tabular-nums'>
          {t('page.permissions.settings.group_summary', { selected: total.selected, total: allMenuKeys.length })}
        </span>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        const sectionKeys = getSectionKeys(section);
        const sectionState = getCheckedState(sectionKeys, selectedKeys);
        const sectionLabel = t(section.labelKey, { ns: 'nav' });

        return (
          <div key={section.id} className='grid gap-x-6 gap-y-2 px-4 py-2 md:grid-cols-[220px_1fr]'>
            <div className='flex items-center gap-3 md:h-8'>
              {/* Not-gated sections (no keys) are always allowed, so they show as checked + disabled. */}
              <Checkbox
                checked={sectionKeys.length === 0 || sectionState.state}
                disabled={disabled || sectionKeys.length === 0}
                onCheckedChange={() => onChange(sectionKeys, sectionState.state !== true)}
                aria-label={`${sectionLabel} ${t('page.permissions.settings.toggle_group')}`}
              />
              <Icon className='text-muted-foreground size-4 shrink-0' />
              <span className='min-w-0 flex-1 truncate text-sm font-semibold'>{sectionLabel}</span>
              {!section.isLink && (
                <span className='text-muted-foreground text-xs tabular-nums'>
                  {sectionState.selected}/{sectionKeys.length}
                </span>
              )}
            </div>

            <div className='flex flex-wrap gap-2 pl-7 md:pl-0'>
              {section.menus.map((menu) => {
                const menuLabel = t(menu.labelKey, { ns: 'nav' });

                if (!menu.menuKey) {
                  return (
                    <span
                      key={menu.id}
                      title={t('page.permissions.settings.always_allowed_hint')}
                      className={cn(CHIP_CLASS_NAME, 'bg-muted/60 text-muted-foreground border-dashed')}
                    >
                      <Check className='size-3.5' />
                      {menuLabel}
                      <span className='text-xs'>· {t('page.permissions.settings.always_allowed')}</span>
                    </span>
                  );
                }

                const menuKey = menu.menuKey;
                const checked = selectedKeys.has(menuKey);

                return (
                  <button
                    key={menu.id}
                    type='button'
                    aria-pressed={checked}
                    disabled={disabled}
                    onClick={() => onChange([menuKey], !checked)}
                    className={cn(
                      CHIP_CLASS_NAME,
                      'focus-visible:ring-ring/50 cursor-pointer transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
                      checked
                        ? 'border-primary bg-primary/15 text-foreground font-medium'
                        : 'bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                    )}
                  >
                    {checked ? <Check className='size-3.5' /> : <Plus className='size-3.5' />}
                    {menuLabel}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
