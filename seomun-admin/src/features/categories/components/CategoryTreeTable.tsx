import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Category } from '../api/category.response';
import { DataTablePagination } from '@/components/shared/data-table/DataTablePagination';
import { SortableCategoryRow } from './SortableCategoryRow';

type CategoryTreeTableProps = {
  data: Category[];
  loading?: boolean;
  enableRowSelection?: boolean;
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  rowCount?: number;
  onView?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onReorder?: (orderedIds: number[]) => void;
  isReordering?: boolean;
  onSelectionChange?: (selectedCategories: Category[]) => void;
  onPageChange?: (pageIndex: number, pageSize?: number) => void;
};

export function CategoryTreeTable({
  data,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onReorder,
  isReordering = false,
  enableRowSelection = false,
  onSelectionChange,
  pageCount,
  rowCount = 0,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
}: CategoryTreeTableProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>(data);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setCategories(data);
  }, [data]);

  const selectedCategories = useMemo(() => categories.filter((cat) => selectedIds.has(cat.id)), [categories, selectedIds]);

  useEffect(() => {
    if (!onSelectionChange) return;
    onSelectionChange(selectedCategories);
  }, [onSelectionChange, selectedCategories]);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllSelection = () => {
    if (selectedIds.size === categories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(categories.map((cat) => cat.id)));
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newCategories = arrayMove(categories, oldIndex, newIndex).map((category, index) => ({
          ...category,
          sort_order: index + 1,
        }));
        setCategories(newCategories);
        onReorder?.(newCategories.map((cat) => cat.id));
      }
    }
  };

  const renderCategory = (category: Category, level: number = 0): React.ReactNode => (
    <SortableCategoryRow
      key={category.id}
      category={category}
      level={level}
      expandedIds={expandedIds}
      toggleExpand={toggleExpand}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      isReordering={isReordering}
      renderChildren={renderCategory}
      enableRowSelection={enableRowSelection}
      selectedIds={selectedIds}
      onToggleSelection={toggleSelection}
    />
  );

  const topLevelCategories = categories.filter((cat) => cat.parent_id === null);
  const sortableIds = topLevelCategories.map((cat) => cat.id);

  const hasPagination = pageCount !== undefined;
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < (pageCount ?? 1) - 1;

  const handlePageChange = (newPageIndex: number) => {
    onPageChange?.(newPageIndex, pageSize);
  };

  const columns = [
    ...(enableRowSelection ? [{ label: '', width: 'w-10' }] : []),
    { label: '', width: 'w-10' },
    { label: t('page.category.table.name', 'Category Name'), align: 'left' },
    { label: t('page.category.table.code', 'Code'), align: 'left' },
    { label: t('page.category.table.slug', 'Slug'), align: 'left' },
    { label: t('page.category.table.status', 'Status'), align: 'left' },
    // { label: t('page.category.table.level', 'Level'), align: 'center' },
    { label: t('page.category.table.exposure_period', 'Exposure Period'), align: 'center' },
    { label: t('page.category.table.sort_order', 'Sort Order'), align: 'center' },
    { label: t('page.category.table.best_category', 'Best Category'), align: 'center' },
    { label: t('page.category.table.registrant', 'Registrant'), align: 'left' },
    { label: t('page.category.table.action', 'Actions'), align: 'center' },
  ];

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div data-slot='data-table' className='flex min-h-0 flex-1 flex-col gap-4'>
        <div className='bg-card flex min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm'>
          <Table className='min-w-300 whitespace-nowrap' containerClassName='min-h-0'>
            <TableHeader className='bg-card sticky top-0 z-10 shadow-[0_1px_0_var(--border)]'>
              <TableRow className='hover:bg-transparent'>
                {columns.map((col, index) => {
                  const isSelectionCol = enableRowSelection && index === 0;
                  return (
                    <TableHead key={index} className={`${col.width || ''} px-3 text-sm ${col.align === 'center' ? 'text-center' : 'text-left'}`}>
                      {isSelectionCol ? (
                        <div className='flex items-center justify-center'>
                          <Checkbox
                            checked={selectedIds.size === categories.length && categories.length > 0}
                            onCheckedChange={toggleAllSelection}
                            aria-label={t('page.category.table.select_all')}
                          />
                        </div>
                      ) : (
                        col.label
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24'>
                    <div className='text-muted-foreground flex items-center justify-center'>
                      <Loader2 className='size-5 animate-spin' aria-hidden='true' />
                      <span className='sr-only'>{t('common.message.loading')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length ? (
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                  {categories.map((category) => renderCategory(category))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='text-muted-foreground h-24 text-center text-sm'>
                    {t('table.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {hasPagination && (
          <DataTablePagination
            table={
              {
                getCanPreviousPage: () => canPreviousPage,
                previousPage: () => handlePageChange(pageIndex - 1),
                getCanNextPage: () => canNextPage,
                nextPage: () => handlePageChange(pageIndex + 1),
              } as any
            }
            pageInfo={{ pageCount: pageCount ?? 1, rowCount: rowCount }}
            pagination={{ pageIndex, pageSize }}
            onPaginationChange={(updater) => {
              if (typeof updater === 'function') {
                const newState = updater({ pageIndex, pageSize });
                onPageChange?.(newState.pageIndex, newState.pageSize);
              } else {
                onPageChange?.(updater.pageIndex, updater.pageSize);
              }
            }}
          />
        )}
      </div>
    </DndContext>
  );
}
