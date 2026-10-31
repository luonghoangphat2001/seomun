import { Stamp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCompanyStampQuery } from '../api/company-settings.query';
import type { CompanyStamp } from '../api/company-settings.response';
import { SettingsImageField, useObjectUrl } from './SettingsImageField';

export type StampDraft = File | 'delete' | null;

type CompanyStampFieldProps = {
  stamp: CompanyStamp;
  draft: StampDraft;
  onDraftChange: (draft: StampDraft) => void;
  disabled?: boolean;
};

export function CompanyStampField({ stamp, draft, onDraftChange, disabled = false }: CompanyStampFieldProps) {
  const { t } = useTranslation('page');

  // The stamp is an image behind auth: fetched as a Blob and shown through an object URL.
  const stampQuery = useCompanyStampQuery(stamp);
  const previewUrl = useObjectUrl(stamp.is_configured ? stampQuery.data : undefined);

  return (
    <SettingsImageField
      label={t('settings.company.fields.stamp')}
      description={t('settings.stamp.description')}
      emptyText={t('settings.stamp.empty')}
      uploadText={t('settings.stamp.upload')}
      placeholderIcon={Stamp}
      isConfigured={stamp.is_configured && draft !== 'delete'}
      previewUrl={previewUrl}
      fileName={stamp.original_name}
      file={draft instanceof File ? draft : null}
      isLoadingPreview={stampQuery.isFetching}
      isPreviewError={stampQuery.isError}
      disabled={disabled}
      onSelect={onDraftChange}
      onDelete={() => onDraftChange('delete')}
    />
  );
}
