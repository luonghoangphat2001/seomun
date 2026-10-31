import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AppDialogModalProps } from './types';

export function AppDialogModal({
  isOpen,
  title,
  children,
  footer,
  width,
  contentClassName,
  overlayClassName,
  okText = 'OK',
  cancelText = 'Cancel',
  confirmLoading = false,
  okDisabled = false,
  setIsOpen,
  onOk,
}: AppDialogModalProps) {
  const maxWidth = width ? `${width}px` : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn('overflow-hidden', contentClassName)}
        overlayClassName={overlayClassName}
        style={maxWidth ? { maxWidth, width: '100%' } : undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div>{children}</div>

        {footer !== null && (
          <DialogFooter>
            {footer !== undefined ? (
              footer
            ) : (
              <>
                <Button variant='outline' className='h-10' onClick={() => setIsOpen(false)}>
                  {cancelText}
                </Button>
                {onOk && (
                  <Button className='h-10' onClick={onOk} disabled={confirmLoading || okDisabled}>
                    {confirmLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    {okText}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
