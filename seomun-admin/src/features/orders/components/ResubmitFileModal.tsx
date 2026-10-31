import { Loader2, UploadCloud } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { AppFieldLabel } from '@/components/shared/form-fields';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileType } from '@/enums';
import { uploadFile } from '@/lib/api/upload-file';

import { useResubmitOrderDesignFileMutation } from '../api/order.query';

const ACCEPTED_FILE_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'ai', 'eps', 'zip'] as const;

type ResubmitFileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  orderItemId: number;
};

export function ResubmitFileModal({ open, onOpenChange, orderNumber, orderItemId }: ResubmitFileModalProps) {
  const { t } = useTranslation('page');
  const { t: tc } = useTranslation('common');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const resubmitOrderDesignFile = useResubmitOrderDesignFileMutation();
  const isSaving = isUploading || resubmitOrderDesignFile.isPending;

  const resetForm = () => {
    setSelectedFile(null);
    setNote('');
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ACCEPTED_FILE_EXTENSIONS.includes(extension as (typeof ACCEPTED_FILE_EXTENSIONS)[number])) {
      setSelectedFile(null);
      toast.error(t('orders.detail.design.resubmit.file_type_invalid'));
      return;
    }

    setSelectedFile(file);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error(t('orders.detail.design.resubmit.file_required'));
      return;
    }

    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!extension || !ACCEPTED_FILE_EXTENSIONS.includes(extension as (typeof ACCEPTED_FILE_EXTENSIONS)[number])) {
      toast.error(t('orders.detail.design.resubmit.file_type_invalid'));
      return;
    }

    const trimmedNote = note.trim();
    if (!trimmedNote) {
      toast.error(t('orders.detail.design.resubmit.note_required'));
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFile = await uploadFile({ file: selectedFile, type: FileType.PRODUCT_IMAGES });
      await resubmitOrderDesignFile.mutateAsync({
        orderNumber,
        order_item_id: orderItemId,
        file_name: uploadedFile.name,
        file_url: uploadedFile.url,
        note: trimmedNote,
      });

      toast.success(t('orders.detail.design.resubmit.success'));
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error(t('orders.detail.design.resubmit.error'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('orders.detail.design.resubmit.title')}</DialogTitle>
          <DialogDescription>{t('orders.detail.design.resubmit.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4' noValidate>
          <div className='space-y-2'>
            <AppFieldLabel htmlFor='order-design-resubmit-file' label={t('orders.detail.design.resubmit.file')} required />
            <Input
              id='order-design-resubmit-file'
              type='file'
              accept='.pdf,.jpg,.jpeg,.png,.ai,.eps,.zip'
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              disabled={isSaving}
              required
            />
            <p className='text-muted-foreground text-xs'>{t('orders.detail.design.resubmit.file_hint')}</p>
          </div>

          <div className='space-y-2'>
            <AppFieldLabel htmlFor='order-design-resubmit-note' label={t('orders.detail.design.resubmit.note')} required />
            <Textarea
              id='order-design-resubmit-note'
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('orders.detail.design.resubmit.note_placeholder')}
              disabled={isSaving}
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => handleOpenChange(false)} disabled={isSaving}>
              {tc('action.cancel')}
            </Button>
            <Button type='submit' disabled={isSaving} className='gap-2'>
              {isSaving ? <Loader2 className='size-4 animate-spin' /> : <UploadCloud className='size-4' />}
              {isSaving ? tc('message.uploading') : t('orders.detail.design.resubmit.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
