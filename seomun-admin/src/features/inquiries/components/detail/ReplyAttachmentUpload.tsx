import { Paperclip } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppFileLibrarySelect, type SelectedFile } from '@/components/shared/app-file-library-select';
import { FileType } from '@/enums';

import type { ReplyAttachmentInput } from '../../schemas';
import { ReplyAttachmentBadges } from './ReplyAttachmentBadges';

import { ACCEPTED, MAX_SIZE } from '../../constants';

type ReplyAttachmentUploadProps = {
  value?: ReplyAttachmentInput[];
  onChange: (value: ReplyAttachmentInput[]) => void;
  disabled?: boolean;
};

export function ReplyAttachmentUpload({ value, onChange, disabled }: ReplyAttachmentUploadProps) {
  const { t } = useTranslation('page');

  // === State ===
  const [pickerOpen, setPickerOpen] = useState(false);

  // === Variables ===
  const attachments = Array.isArray(value) ? value : [];

  // === Functions ===
  const handlePick = (files: SelectedFile[]) => {
    onChange(files.map((file) => ({ url: file.url, name: file.name, size: file.size })));
  };

  const remove = (index: number) => {
    onChange(attachments.filter((_, i) => i !== index));
  };

  // === JSX ===
  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap items-center gap-2'>
        <AppButton
          type='button'
          variant='outline'
          size='sm'
          onClick={() => setPickerOpen(true)}
          disabled={disabled}
          leftIcon={<Paperclip className='size-4' />}
        >
          {t('inquiries.attachment.click_to_upload')}
        </AppButton>
        <span className='text-muted-foreground text-xs'>{t('inquiries.attachment.limit_note', { current: attachments.length })}</span>
      </div>

      <ReplyAttachmentBadges attachments={attachments} onRemove={remove} disabled={disabled} />

      <AppFileLibrarySelect
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        fileType={FileType.INQUIRY_ATTACHMENTS}
        accepted={ACCEPTED}
        maxSize={MAX_SIZE}
        multiple
        selectedUrls={attachments.map((att) => att.url)}
        onSelect={handlePick}
      />
    </div>
  );
}
