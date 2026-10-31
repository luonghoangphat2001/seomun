import { useTranslation } from 'react-i18next';

import { cn } from '@/utils/cn';
import { formatDateOnly, parseDateOnly } from '@/utils/format-date';
import { formatPhoneNumber } from '@/utils/format-phone';

import type { EquipmentRESP } from '../api/equipment.response';

type EquipmentDetailSummaryProps = {
  equipment: EquipmentRESP;
};

function SummaryItem({ label, value, scrollable }: { label: string; value: string; scrollable?: boolean }) {
  return (
    <div className='rounded-lg border p-4'>
      <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>{label}</p>
      <p className={cn('mt-1 text-sm font-medium', scrollable && 'max-h-36 overflow-y-auto wrap-break-word whitespace-pre-wrap')}>{value}</p>
    </div>
  );
}

export function EquipmentDetailSummary({ equipment }: EquipmentDetailSummaryProps) {
  const { t } = useTranslation('page');

  return (
    <section className='space-y-4 rounded-xl border p-5'>
      <div className='flex flex-col gap-4 lg:flex-row'>
        <div className='grid flex-1 gap-3 md:grid-cols-2'>
          <SummaryItem label={t('orders.equipment.detail.summary.company_name', 'Manufacturer Company')} value={equipment.company_name} />
          <SummaryItem label={t('orders.equipment.detail.summary.equipment_name', 'Equipment Name')} value={equipment.name} />
          <SummaryItem label={t('orders.equipment.detail.summary.machine_type', 'Machine Type')} value={equipment.machine_type ?? '-'} />
          <SummaryItem
            label={t('orders.equipment.detail.summary.maintenance_company', 'Maintenance Company')}
            value={equipment.maintenance_company ?? '-'}
          />
          <SummaryItem label={t('orders.equipment.detail.summary.manager_name', 'Manager Name')} value={equipment.manager_name ?? '-'} />
          <SummaryItem
            label={t('orders.equipment.detail.summary.manager_phone', 'Manager Phone')}
            value={formatPhoneNumber(equipment.manager_phone) || '-'}
          />
          <SummaryItem
            label={t('orders.equipment.detail.summary.introduced_at', 'Introduced Date')}
            value={formatDateOnly(parseDateOnly(equipment.introduced_at)) ?? '-'}
          />
          <SummaryItem
            label={t('orders.equipment.detail.summary.work_process', 'Work Process')}
            value={t(`orders.equipment.work_process.${equipment.work_process}`, equipment.work_process)}
          />
          <SummaryItem
            label={t('orders.equipment.detail.summary.status', 'Status')}
            value={t(`orders.equipment.status.${equipment.status}`, equipment.status)}
          />
          <div className='md:col-span-2'>
            <SummaryItem label={t('orders.equipment.detail.summary.note', 'Note')} value={equipment.notes?.trim() || '-'} scrollable />
          </div>
        </div>

        <div className='bg-muted/30 flex h-52 w-full items-center justify-center overflow-hidden rounded-xl border lg:w-80'>
          {equipment.image ? (
            <img src={equipment.image} alt={equipment.name} className='h-full w-full object-cover' />
          ) : (
            <span className='text-muted-foreground text-sm'>{t('orders.equipment.detail.summary.no_image', 'No image uploaded')}</span>
          )}
        </div>
      </div>
    </section>
  );
}
