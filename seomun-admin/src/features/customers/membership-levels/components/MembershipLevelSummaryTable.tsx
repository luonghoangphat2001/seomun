import { useTranslation } from 'react-i18next';

import type { MembershipLevel } from '../../types/customer.type';
import { getMembershipLevelLabel } from '../../utils/i18n';

type MembershipLevelSummaryTableProps = {
  levels: MembershipLevel[];
};

function formatCurrency(value: number) {
  return value > 0 ? value.toLocaleString() : '-';
}

function formatAccrualRate(value: number) {
  return value > 0 ? `${value}%` : 'X';
}

export function MembershipLevelSummaryTable({ levels }: MembershipLevelSummaryTableProps) {
  const { t } = useTranslation();

  return (
    <section className='rounded-xl border p-5'>
      <div className='mb-4'>
        <h2 className='text-sm font-semibold'>{t('page.customers.membership_levels.summary.title')}</h2>
        <p className='text-muted-foreground text-sm'>{t('page.customers.membership_levels.summary.description')}</p>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full min-w-[720px] border-collapse text-sm'>
          <thead>
            <tr className='bg-muted/40'>
              <th className='border px-3 py-2 text-left font-semibold'>{t('page.customers.membership_levels.summary.columns.level_name')}</th>
              <th className='border px-3 py-2 text-right font-semibold'>{t('page.customers.membership_levels.summary.columns.condition')}</th>
              <th className='border px-3 py-2 text-right font-semibold'>{t('page.customers.membership_levels.summary.columns.average')}</th>
              <th className='border px-3 py-2 text-center font-semibold'>{t('page.customers.membership_levels.summary.columns.accrual_rate')}</th>
              <th className='border px-3 py-2 text-center font-semibold'>{t('page.customers.membership_levels.summary.columns.free_shipping')}</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id}>
                <td className='border px-3 py-2'>{getMembershipLevelLabel(t, level.code)}</td>
                <td className='border px-3 py-2 text-right'>{formatCurrency(level.conditionAmount)}</td>
                <td className='border px-3 py-2 text-right'>{formatCurrency(level.averageAmount)}</td>
                <td className='border px-3 py-2 text-center'>{formatAccrualRate(level.accrualRate)}</td>
                <td className='border px-3 py-2 text-center'>
                  {level.freeShipping
                    ? t('page.customers.membership_levels.summary.values.available')
                    : t('page.customers.membership_levels.summary.values.unavailable')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
