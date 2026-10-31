import { Check } from '@/icons';
import { useTranslations } from 'next-intl';

export interface SuccessStepProps {
  name?: string;
  date?: string;
}

export const SuccessStep = ({ name, date }: SuccessStepProps) => {
  const tAuth = useTranslations('auth');

  const condition = name && date;

  return (
    <div className='border-border-soft flex flex-col items-center gap-6 border-t border-b px-4 py-6 max-md:border-none md:gap-8 md:px-10 md:py-8'>
      <div className='space-y-4 md:space-y-6'>
        <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-[#E8F5EC] text-[#4CAF50]'>
          <Check className='size-8 stroke-2' />
        </div>
        <div className='space-y-2'>
          <h3 className='title-20 text-text-main text-center'>{condition ? tAuth('found_1_id') : tAuth('change_completed')}</h3>
          {!condition && <p className='body-14 text-text-secondary text-center'>{tAuth('login_again')}</p>}
        </div>
      </div>
      {condition && (
        <div className='bg-border-light border-border-soft flex w-full items-center justify-between rounded-xl border p-6'>
          <div className='space-y-2 text-left'>
            <p className='body-14 text-text-secondary'>{tAuth('id')}</p>
            <p className='title-20'>{name}</p>
          </div>
          <div className='space-y-2 text-right'>
            <p className='body-14 text-text-secondary'>{tAuth('date')}</p>
            <p className='body-16 text-text-main'>{date}</p>
          </div>
        </div>
      )}
    </div>
  );
};
