import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Eye, Power } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { PricingProfile } from '../api';

type PricingProfileColumnsOptions = {
  t: TFunction<'page'>;
  tCommon: TFunction<'common'>;
  togglingId: number | null;
  onView: (profile: PricingProfile) => void;
  onToggleStatus: (profile: PricingProfile) => void;
};

export function getPricingProfileColumns({
  t,
  tCommon,
  togglingId,
  onView,
  onToggleStatus,
}: PricingProfileColumnsOptions): ColumnDef<PricingProfile>[] {
  return [
    {
      accessorKey: 'code',
      header: t('products.pricing_profiles.columns.code'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-mono text-sm font-medium'>{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: t('products.pricing_profiles.columns.name'),
      enableSorting: false,
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    },
    {
      accessorKey: 'calculator_type',
      header: t('products.pricing_profiles.columns.calculator'),
      enableSorting: false,
      cell: ({ row }) => t(`products.pricing_profiles.calculators.${row.original.calculator_type}`),
    },
    {
      id: 'structures',
      header: t('products.pricing_profiles.columns.structures'),
      enableSorting: false,
      cell: ({ row }) => {
        const settings = Array.isArray(row.original.settings) ? undefined : row.original.settings;
        const structures = settings?.supported_structures ?? row.original.supported_structures ?? [];

        return (
          <div className='flex flex-wrap gap-1'>
            {structures.map((structure) => (
              <span key={structure} className='bg-muted rounded px-2 py-0.5 text-xs'>
                {t(`products.pricing_profiles.structures.${structure}`)}
              </span>
            ))}
            {!structures.length ? <span className='text-muted-foreground text-sm'>-</span> : null}
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: t('products.pricing_profiles.columns.status'),
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${row.original.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
        >
          {row.original.is_active ? t('products.pricing_profiles.status.active') : t('products.pricing_profiles.status.inactive')}
        </span>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: t('products.pricing_profiles.columns.updated_at'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm'>{row.original.updated_at?.slice(0, 10) ?? '-'}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-center'>{t('products.pricing_profiles.columns.actions')}</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex justify-center gap-2'>
          <Button type='button' variant='outline' size='sm' onClick={() => onView(row.original)}>
            <Eye className='size-4' />
            {tCommon('action.view')}
          </Button>
          <Button type='button' variant='outline' size='sm' onClick={() => onToggleStatus(row.original)} disabled={togglingId === row.original.id}>
            <Power className='size-4' />
            {row.original.is_active ? t('products.pricing_profiles.actions.deactivate') : t('products.pricing_profiles.actions.activate')}
          </Button>
        </div>
      ),
    },
  ];
}
