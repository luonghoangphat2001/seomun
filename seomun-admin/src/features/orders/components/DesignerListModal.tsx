import { Loader2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useAdministratorsQuery } from '@/features/administrators/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DEFAULT_PAGE } from '@/constants/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { getApiErrorMessage } from '@/utils/api-error';
import { cn } from '@/utils/cn';

import { useAssignOrderToDesignerMutation } from '../api';

const DESIGNERS_PER_PAGE = 100;

type DesignerListModalProps = {
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DesignerListModal({ orderNumber, open, onOpenChange }: DesignerListModalProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesignerId, setSelectedDesignerId] = useState<number | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm);
  const assignDesignerMutation = useAssignOrderToDesignerMutation();

  const queryParams = useMemo(
    () => ({
      page: DEFAULT_PAGE,
      per_page: DESIGNERS_PER_PAGE,
      search_term: debouncedSearchTerm.trim() || undefined,
    }),
    [debouncedSearchTerm],
  );
  const administratorsQuery = useAdministratorsQuery(queryParams, { enabled: open });
  const administrators = (administratorsQuery.data?.data.users ?? []).filter(
    (administrator) => administrator.username.toLowerCase() !== 'superadmin',
  );

  const closeModal = () => {
    setSearchTerm('');
    setSelectedDesignerId(null);
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!assignDesignerMutation.isPending) {
      if (nextOpen) {
        onOpenChange(true);
      } else {
        closeModal();
      }
    }
  };

  const handleAssign = () => {
    if (selectedDesignerId === null) return;

    assignDesignerMutation.mutate(
      {
        orderNumber,
        designer_user_id: selectedDesignerId,
        order_item_ids: undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('orders.detail.assign_designer.success'));
          closeModal();
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, t('orders.detail.assign_designer.error')));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('orders.detail.assign_designer.title')}</DialogTitle>
          <DialogDescription>{t('orders.detail.assign_designer.description')}</DialogDescription>
        </DialogHeader>

        <div className='relative'>
          <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('orders.detail.assign_designer.search_placeholder')}
            className='pl-8'
            disabled={assignDesignerMutation.isPending}
          />
          {administratorsQuery.isFetching ? (
            <Loader2 className='text-muted-foreground absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin' />
          ) : null}
        </div>

        <div className='max-h-80 space-y-2 overflow-y-auto pr-1' role='listbox' aria-label={t('orders.detail.assign_designer.title')}>
          {administratorsQuery.isLoading ? (
            <div className='flex justify-center py-10'>
              <Loader2 className='text-primary size-5 animate-spin' />
            </div>
          ) : null}

          {administratorsQuery.isError ? (
            <p className='text-destructive py-10 text-center text-sm'>{t('orders.detail.assign_designer.load_error')}</p>
          ) : null}

          {!administratorsQuery.isLoading && !administratorsQuery.isError && administrators.length === 0 ? (
            <p className='text-muted-foreground py-10 text-center text-sm'>{t('orders.detail.assign_designer.empty')}</p>
          ) : null}

          {administrators.map((administrator) => (
            <button
              key={administrator.id}
              type='button'
              role='option'
              aria-selected={selectedDesignerId === administrator.id}
              onClick={() => setSelectedDesignerId(administrator.id)}
              disabled={assignDesignerMutation.isPending}
              className={cn(
                'hover:bg-muted flex w-full cursor-pointer flex-col rounded-lg border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                selectedDesignerId === administrator.id ? 'border-primary bg-primary/5' : 'border-input',
              )}
            >
              <span className='text-sm font-medium'>{administrator.name}</span>
              <span className='text-muted-foreground text-xs'>
                {administrator.username} · {administrator.email}
              </span>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => handleOpenChange(false)} disabled={assignDesignerMutation.isPending}>
            {tCommon('action.cancel')}
          </Button>
          <Button type='button' onClick={handleAssign} disabled={selectedDesignerId === null || assignDesignerMutation.isPending}>
            {assignDesignerMutation.isPending ? <Loader2 className='mr-1 size-4 animate-spin' /> : null}
            {t('orders.detail.assign_designer.assign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
