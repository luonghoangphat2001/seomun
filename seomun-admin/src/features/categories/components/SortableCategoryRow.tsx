import React from 'react';
import { useTranslation } from 'react-i18next';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { ChevronDown, ChevronRight, Edit, Eye, GripVertical, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import type { Category } from '../api/category.response';
import { CATEGORY_STATUS } from '../enums';
import { CategoryTag } from './CategoryTag';
import { ExposurePeriodDisplay } from './ExposurePeriodDisplay';

type SortableCategoryRowProps = {
  category: Category;
  level: number;
  expandedIds: Set<number>;
  enableRowSelection?: boolean;
  selectedIds: Set<number>;
  toggleExpand: (id: number) => void;
  onView?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  isReordering: boolean;
  renderChildren: (category: Category, level: number) => React.ReactNode;
  onToggleSelection: (id: number) => void;
};

export function SortableCategoryRow({
  category,
  level,
  expandedIds,
  toggleExpand,
  onView,
  onEdit,
  onDelete,
  isReordering,
  renderChildren,
  enableRowSelection,
  selectedIds,
  onToggleSelection,
}: SortableCategoryRowProps) {
  const { t } = useTranslation();
  const { t: tCommon } = useTranslation('common');
  const isTopLevel = category.parent_id === null;
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const indent = level * 24;

  const sortable = useSortable({
    id: category.id,
    disabled: !isTopLevel || isReordering,
  });

  const style = isTopLevel
    ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.5 : 1,
      }
    : {};

  return (
    <>
      <TableRow ref={isTopLevel ? sortable.setNodeRef : undefined} style={style} className='hover:bg-muted/50 border-b'>
        {enableRowSelection && (
          <TableCell className='w-12 p-3 text-center text-xs'>
            <div className='flex items-center justify-center' onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedIds.has(category.id)}
                onCheckedChange={() => onToggleSelection(category.id)}
                aria-label={t('page.category.table.select_row')}
              />
            </div>
          </TableCell>
        )}

        <TableCell className='w-10 p-3 text-xs'>
          {isTopLevel ? (
            <button
              {...sortable.attributes}
              {...sortable.listeners}
              disabled={isReordering}
              className='hover:bg-accent cursor-move rounded p-1 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <GripVertical className='h-4 w-4' />
            </button>
          ) : (
            <div className='w-6' />
          )}
        </TableCell>

        <TableCell className='p-3 text-xs' style={{ paddingLeft: `${indent + 12}px` }}>
          <div className='flex items-center gap-2'>
            {hasChildren ? (
              <button onClick={() => toggleExpand(category.id)} className='hover:bg-accent cursor-pointer rounded p-0.5'>
                {isExpanded ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
              </button>
            ) : (
              <div className='w-5' />
            )}
            <span className='font-medium'>{category.name}</span>
          </div>
        </TableCell>

        <TableCell className='p-3 text-xs'>{category.code ?? '-'}</TableCell>
        <TableCell className='p-3 text-xs'>{category.slug}</TableCell>

        <TableCell className='p-3 text-xs'>
          <CategoryTag color={category.status.value === CATEGORY_STATUS.ACTIVE ? 'green' : 'default'}>
            {t(`page.category.status.${category.status.value}`, category.status.label)}
          </CategoryTag>
        </TableCell>

        {/* <TableCell className='p-3 text-center text-xs'>
          <span className='inline-flex items-center rounded bg-[#e6f7ff] px-2 py-1 text-xs font-medium text-blue-700'>
            {t(`page.category.level.${category.level as CATEGORY_LEVEL}`, category.level)}
          </span>
        </TableCell> */}

        <TableCell className='p-3 text-center text-xs'>
          <ExposurePeriodDisplay startDate={category.exposure_start_date} endDate={category.exposure_end_date} />
        </TableCell>

        <TableCell className='p-3 text-center text-xs'>{category.sort_order}</TableCell>
        <TableCell className='p-3 text-center text-xs'>
          {category.is_best ? <CategoryTag color='yellow'>{t('page.category.table.best', 'Best')}</CategoryTag> : '-'}
        </TableCell>
        <TableCell className='p-3 text-center text-xs'>{category.registrant?.name ?? category.registrant?.username ?? '-'}</TableCell>

        <TableCell className='p-3 text-center text-xs'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='xs' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
                <span className='sr-only'>{t('page.category.table.actions_sr')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onView?.(category)} className='cursor-pointer'>
                <Eye className='mr-2 h-4 w-4' />
                {tCommon('action.view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(category)} className='cursor-pointer'>
                <Edit className='mr-2 h-4 w-4' />
                {tCommon('action.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(category)} className='cursor-pointer text-red-600 focus:text-red-600'>
                <Trash2 className='mr-2 h-4 w-4' />
                {tCommon('action.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {hasChildren && isExpanded && category.children.map((child) => renderChildren(child, level + 1))}
    </>
  );
}
