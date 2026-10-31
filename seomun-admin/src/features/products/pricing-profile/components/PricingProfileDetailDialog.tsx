import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';

import type { PricingProfile } from '../api';

type PricingProfileDetailDialogProps = {
  profile: PricingProfile | null;
  onClose: () => void;
};

export function PricingProfileDetailDialog({ profile, onClose }: PricingProfileDetailDialogProps) {
  const { t } = useTranslation('page');
  const settings = profile && !Array.isArray(profile.settings) ? profile.settings : {};

  return (
    <AppDialogModal
      isOpen={profile !== null}
      setIsOpen={(open) => !open && onClose()}
      title={t('products.pricing_profiles.detail.title')}
      width={760}
      footer={null}
    >
      {profile ? (
        <div className='space-y-5'>
          <dl className='grid gap-4 text-sm sm:grid-cols-2'>
            <div>
              <dt className='text-muted-foreground'>{t('products.pricing_profiles.fields.code')}</dt>
              <dd className='font-mono font-medium'>{profile.code}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{t('products.pricing_profiles.fields.name')}</dt>
              <dd className='font-medium'>{profile.name}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{t('products.pricing_profiles.fields.calculator')}</dt>
              <dd>{t(`products.pricing_profiles.calculators.${profile.calculator_type}`)}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{t('products.pricing_profiles.fields.status')}</dt>
              <dd>{profile.is_active ? t('products.pricing_profiles.status.active') : t('products.pricing_profiles.status.inactive')}</dd>
            </div>
          </dl>

          <div className='space-y-2'>
            <h3 className='text-sm font-semibold'>{t('products.pricing_profiles.detail.configuration')}</h3>
            <pre className='bg-muted max-h-96 overflow-auto rounded-lg p-4 text-xs leading-5 whitespace-pre-wrap'>
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </AppDialogModal>
  );
}
