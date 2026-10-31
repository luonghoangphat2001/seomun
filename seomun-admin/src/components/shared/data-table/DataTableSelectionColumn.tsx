import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';

import { SELECTION_COLUMN_ID } from './constants';

export function createSelectionColumn<TData, TValue = unknown>(): ColumnDef<TData, TValue> {
  return {
    id: SELECTION_COLUMN_ID,
    size: 48,
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          aria-label='Select all rows on the current page'
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center' onClick={(event) => event.stopPropagation()}>
        <Checkbox
          aria-label={`Select row ${row.id}`}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        />
      </div>
    ),
  };
}
