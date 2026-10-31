import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';

import { CategoryForm } from '../form/CategoryForm';

interface CategoryDetailDialogProps {
  categoryId: number | null;
  onClose: () => void;
}

export const CategoryDetailDialog = ({ categoryId, onClose }: CategoryDetailDialogProps) => {
  const { t } = useTranslation('common');
  const { t: tDefault } = useTranslation();

  const isOpen = categoryId !== null;

  const handleFormSubmit = () => {
    // No-op for view mode
  };

  return (
    <AppDialogModal
      isOpen={isOpen}
      setIsOpen={(open) => !open && onClose()}
      title={tDefault('page.category.detail.title')}
      footer={null}
      width={1200}
      contentClassName='max-h-[calc(100dvh-2rem)] gap-3 data-open:animate-none data-open:zoom-in-100 data-closed:animate-none data-closed:zoom-out-100'
      overlayClassName='[backdrop-filter:none] supports-backdrop-filter:[backdrop-filter:none]'
    >
      <div className='max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain pr-2 [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable]'>
        {categoryId ? (
          <CategoryForm mode='view' categoryId={categoryId} onSubmit={handleFormSubmit} onCancel={onClose} />
        ) : (
          <div className='flex items-center justify-center py-8'>
            <p className='text-muted-foreground'>{t('message.no_data')}</p>
          </div>
        )}
      </div>
    </AppDialogModal>
  );
};
