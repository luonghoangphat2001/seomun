import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CategoryTag } from '@/features/categories/components/CategoryTag';

import type { ProductListItemRESP } from '../api/product.response';
import { PRODUCT_STATUS_OPTIONS } from '../constants';
import { ProductSortField, ProductStatus } from '../enums';

type ProductColumnLabels = {
  thumbnail: string;
  noImage: string;
  productCode: string;
  productName: string;
  category: string;
  status: string;
  statusLabels: Record<ProductStatus, string>;
  createdAt: string;
  actions: string;
  edit: string;
  delete: string;
};

export function getProductColumns({
  labels,
  onEdit,
  onDelete,
}: {
  labels: ProductColumnLabels;
  onEdit: (product: ProductListItemRESP) => void;
  onDelete: (product: ProductListItemRESP) => void;
}): ColumnDef<ProductListItemRESP>[] {
  return [
    {
      accessorKey: 'thumbnail_url',
      header: labels.thumbnail,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.thumbnail_url ? (
          <img src={row.original.thumbnail_url} alt={row.original.product_name} className='size-12 rounded-md border object-cover' />
        ) : (
          <div className='bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-md border text-xs'>{labels.noImage}</div>
        ),
    },
    {
      accessorKey: 'product_code',
      header: labels.productCode,
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{row.original.product_code}</span>,
    },
    {
      accessorKey: 'product_name',
      header: labels.productName,
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{row.original.product_name}</span>,
    },
    {
      accessorKey: 'category_name',
      header: labels.category,
      enableSorting: false,
    },
    {
      id: 'status',
      header: labels.status,
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.original.is_active ? ProductStatus.SOLD : ProductStatus.HIDDEN;
        const statusOption = PRODUCT_STATUS_OPTIONS.find((option) => option.value === status);

        return statusOption ? (
          <CategoryTag color={status === ProductStatus.SOLD ? 'green' : 'gray'}>{labels.statusLabels[statusOption.value]}</CategoryTag>
        ) : null;
      },
    },
    {
      id: ProductSortField.CREATED_AT,
      accessorKey: 'created_at',
      header: labels.createdAt,
      enableSorting: true,
      cell: ({ row }) => row.original.created_at.slice(0, 10),
    },
    {
      id: 'actions',
      header: labels.actions,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex gap-2'>
          <Button type='button' variant='outline' size='sm' className='gap-1.5' onClick={() => onEdit(row.original)}>
            <Edit className='size-4' />
            {labels.edit}
          </Button>
          <Button type='button' variant='destructive' size='sm' className='gap-1.5' onClick={() => onDelete(row.original)}>
            <Trash2 className='size-4' />
            {labels.delete}
          </Button>
        </div>
      ),
    },
  ];
}
