import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useUserListQuery } from '../api';
import type { Userlist } from '../api/post-payment-limit.response';
import { UserAuthority, UserStatus } from '../enums';

type UserPickerDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (user: Userlist) => void;
};

const PER_PAGE = 10;

export function UserPickerDialog({ open, onClose, onSelect }: UserPickerDialogProps) {
  const { t } = useTranslation('page');

  // ============================================================================
  // State
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<UserStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  // ============================================================================
  // Hooks
  // ============================================================================
  const { data, isFetching } = useUserListQuery(
    {
      page,
      per_page: PER_PAGE,
      search_term: searchTerm || undefined,
      status,
      authority: UserAuthority.NORMAL_USER,
    },
    { enabled: open },
  );

  const users = data?.data.members ?? [];
  const totalPages = data?.pagination.total_page ?? 0;

  const statusOptions = [
    { value: UserStatus.ACTIVE, label: t('post_payment_limit.user_picker.status_active', 'Active') },
    { value: UserStatus.INACTIVE, label: t('post_payment_limit.user_picker.status_inactive', 'Inactive') },
    { value: UserStatus.WITHDRAWN, label: t('post_payment_limit.user_picker.status_withdrawn', 'Withdrawn') },
  ];

  // ============================================================================
  // Functions
  // ============================================================================
  const handleReset = () => {
    setSearchTerm('');
    setStatus(undefined);
    setPage(1);
  };

  const handleSelect = (user: Userlist) => {
    onSelect(user);
    handleReset();
    onClose();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('post_payment_limit.user_picker.title', 'Select User')}</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <div className='flex flex-wrap gap-2'>
            <AppInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setPage(1);
              }}
              placeholder={t('post_payment_limit.user_picker.search_placeholder', 'Search by name or email')}
              className='min-w-52 flex-1'
            />
            <AppSelect
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              options={statusOptions}
              placeholder={t('post_payment_limit.user_picker.status', 'Status')}
              clearable
              className='w-36'
            />
            <Button type='button' variant='outline' size='sm' onClick={handleReset}>
              {t('post_payment_limit.user_picker.reset', 'Reset')}
            </Button>
          </div>

          <div className='rounded-md border'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-muted/50 border-b'>
                  <th className='text-muted-foreground w-14 px-3 py-2 text-left font-medium'>#</th>
                  <th className='text-muted-foreground px-3 py-2 text-left font-medium'>{t('post_payment_limit.user_picker.col_name', 'Name')}</th>
                  <th className='text-muted-foreground px-3 py-2 text-left font-medium'>{t('post_payment_limit.user_picker.col_email', 'Email')}</th>
                  <th className='w-20 px-3 py-2' />
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  <tr>
                    <td colSpan={4} className='text-muted-foreground px-3 py-8 text-center'>
                      {t('post_payment_limit.user_picker.loading', 'Loading…')}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className='text-muted-foreground px-3 py-8 text-center'>
                      {t('post_payment_limit.user_picker.empty', 'No results found.')}
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr key={user.id} className='hover:bg-muted/30 border-b last:border-0'>
                      <td className='text-muted-foreground px-3 py-2'>{(page - 1) * PER_PAGE + idx + 1}</td>
                      <td className='px-3 py-2 font-medium'>{user.name}</td>
                      <td className='text-muted-foreground px-3 py-2'>{user.email}</td>
                      <td className='px-3 py-2'>
                        <Button type='button' variant='outline' size='sm' onClick={() => handleSelect(user)}>
                          {t('post_payment_limit.user_picker.select', 'Select')}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className='flex items-center justify-end gap-2'>
              <Button type='button' variant='outline' size='sm' disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft />
              </Button>
              <span className='text-muted-foreground text-sm'>
                {page} / {totalPages}
              </span>
              <Button type='button' variant='outline' size='sm' disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
