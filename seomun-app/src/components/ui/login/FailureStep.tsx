import { XIcon } from '@/icons';
import { useTranslations } from 'next-intl';

interface FailureStepProps {
  message?: string;
}

export const FailureStep = ({ message }: FailureStepProps) => {
  const tAuth = useTranslations('auth');

  return (
    <div className='border-border-soft flex flex-col items-center gap-6 border-t border-b px-4 py-6 max-md:border-none md:px-10 md:py-8'>
      <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-[#EB5757]/10 text-[#EB5757]'>
        <XIcon className='size-8 stroke-2' />
      </div>
      <div className='space-y-2'>
        <h3 className='title-20 text-text-main text-center'>{tAuth('found_1_id')}</h3>
      </div>
      <div className='bg-border-light border-border-soft flex w-full items-center justify-center rounded-xl border py-8 md:mt-2 md:py-16'>
        <p className='body-14 text-center'>{message || tAuth('no_ids_match')}</p>
      </div>
    </div>
  );
};
