import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

import type { DashboardStatusBreakdown } from '../api';
import { dashboardNumberFormatter, translateDashboardBreakdownLabel, translateDashboardStatLabel } from '../utils';

type BreakdownListProps = {
  items: DashboardStatusBreakdown[];
};

export function BreakdownList({ items }: BreakdownListProps) {
  const { t } = useTranslation();

  const groups = useMemo(() => [...new Set(items.map((item) => item.group).filter((group): group is string => Boolean(group)))], [items]);

  const [selectedGroup, setSelectedGroup] = useState<string>();

  // Two or more groups would otherwise stack into one long scroll, so they become a switcher instead.
  const hasSwitcher = groups.length > 1;
  const activeGroup = selectedGroup && groups.includes(selectedGroup) ? selectedGroup : groups[0];

  const visibleItems = hasSwitcher ? items.filter((item) => item.group === activeGroup) : items;
  const hasGroups = visibleItems.some((item) => item.group);

  return (
    <div>
      {hasSwitcher && (
        <div className='bg-muted/60 mb-3 inline-flex rounded-lg p-0.5'>
          {groups.map((group) => (
            <button
              key={group}
              type='button'
              aria-pressed={group === activeGroup}
              onClick={() => setSelectedGroup(group)}
              className={cn(
                'cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                group === activeGroup ? 'bg-white text-gray-900 shadow-sm' : 'text-muted-foreground hover:text-gray-800',
              )}
            >
              {translateDashboardBreakdownLabel(t, group)}
            </button>
          ))}
        </div>
      )}

      <div className={cn(!hasGroups && visibleItems.length > 8 ? 'grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3')}>
        {visibleItems.map((item, index) => {
          const showGroupHeader = !hasSwitcher && Boolean(item.group) && item.group !== visibleItems[index - 1]?.group;

          return (
            <Fragment key={`${item.group ?? ''}-${item.label}`}>
              {showGroupHeader && (
                <p className='text-muted-foreground pt-2 text-xs font-semibold tracking-wide uppercase first:pt-0'>
                  {translateDashboardBreakdownLabel(t, item.group as string)}
                </p>
              )}
              <div className='space-y-1'>
                <div className='flex items-center justify-between gap-3 text-sm'>
                  <span className='truncate font-medium'>{translateDashboardBreakdownLabel(t, item.label)}</span>
                  <span className='text-muted-foreground shrink-0'>
                    {item.value !== undefined ? dashboardNumberFormatter.format(item.value) : ''}
                    {item.value !== undefined && item.rate !== undefined ? ' / ' : ''}
                    {item.rate !== undefined ? `${item.rate}%` : ''}
                  </span>
                </div>
                {item.stats?.length ? (
                  <div className='flex flex-wrap gap-1.5'>
                    {item.stats.map((stat) => (
                      <Badge key={stat.key} variant='outline' className='text-muted-foreground gap-1 font-normal'>
                        {translateDashboardStatLabel(t, stat.key, stat.label)}: {dashboardNumberFormatter.format(stat.value)}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {item.rate !== undefined && (
                  <div className='h-2 rounded-full bg-gray-100'>
                    <div className='bg-primary h-2 rounded-full' style={{ width: `${Math.min(item.rate, 100)}%` }} />
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
