'use client';

import { UserMemberType } from '@/enums/user';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type CautionSectionProps = {
  memberType?: UserMemberType;
  className?: string;
};

const CautionSection = ({ memberType = UserMemberType.INDIVIDUAL, className }: CautionSectionProps) => {
  const t = useTranslations('');

  const individualNotes = [
    t('my.individual_note_1'),
    t('my.individual_note_2'),
    t('my.individual_note_3'),
    t('my.individual_note_4'),
  ];

  const coporateNotes = [t('my.corporate_note_1'), t('my.corporate_note_2'), t('my.corporate_note_3')];

  const notes = memberType === UserMemberType.INDIVIDUAL ? individualNotes : coporateNotes;

  return (
    <div className={cn('text-text-secondary rounded-lg bg-gray-50 p-3 md:p-5', className)}>
      <p className='title-14'>{t('product.caution')}</p>
      <ul className='mt-4 flex list-disc flex-col items-start gap-3 pl-5'>
        {notes.map((text, i) => (
          <li key={i} className='body-14'>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CautionSection;
