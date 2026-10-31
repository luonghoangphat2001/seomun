import { useTranslation } from 'react-i18next';

import type { PointPolicySection } from '../../types/customer.type';
import { translatePointPolicyItem, translatePointPolicySectionTitle } from '../../utils/i18n';

type PointPolicyNotesSectionProps = {
  sections: PointPolicySection[];
};

export function PointPolicyNotesSection({ sections }: PointPolicyNotesSectionProps) {
  const { t } = useTranslation();

  return (
    <section className='rounded-xl border p-5'>
      <div className='mb-4'>
        <h2 className='text-sm font-semibold'>{t('page.customers.points.policy.title')}</h2>
        <p className='text-muted-foreground text-sm'>{t('page.customers.points.policy.description')}</p>
      </div>

      <div className='space-y-4'>
        {sections.map((section) => (
          <div key={section.id} className='rounded-lg border p-4'>
            <h3 className='text-sm font-semibold'>{translatePointPolicySectionTitle(t, section.id, section.title)}</h3>
            <ul className='text-muted-foreground mt-3 list-disc space-y-2 pl-5 text-sm'>
              {section.items.map((item) => (
                <li key={item.id}>{translatePointPolicyItem(t, section.id, item.id, item.content)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
