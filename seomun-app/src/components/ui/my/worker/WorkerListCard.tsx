'use client';

import { useWorkerDeleteMutation, useWorkerMobileListQuery } from '@/apis/my/worker/worker.query';
import { WorkerListREQ } from '@/apis/my/worker/worker.request';
import { Button, Checkbox, ModalHandle } from '@/components/common';
import Loading from '@/components/common/loading';
import { ConfirmModal } from '@/components/common/modal/ConfirmModal';
import { DATE_FORMAT } from '@/constants/common';
import { useRouter } from '@/i18n/navigation';
import { formatDate, splitPhonePattern } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { RowSelectionState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type WorkerListCardProps = {
  filter?: WorkerListREQ;
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
};

const WorkerListCard = ({ filter, rowSelection, setRowSelection }: WorkerListCardProps) => {
  const t = useTranslations();
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const confirmDeleteModalRef = useRef<ModalHandle>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  //api inifiniy list
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useWorkerMobileListQuery(filter);
  const workers = data?.pages.flatMap((page) => page.data.workers) ?? [];

  //api delete
  const { mutate: mutateDelete, isPending: isPendingDelete } = useWorkerDeleteMutation();

  const onCheckItem = (addressId: number, value: boolean) => {
    setRowSelection((prev) => {
      // unchecked => remove key
      if (!value) {
        const next = { ...prev };
        delete next[addressId];
        return next;
      }

      // checked
      return {
        ...prev,
        [addressId]: true,
      };
    });
  };

  const closeConfirmModal = () => {
    confirmDeleteModalRef.current?.close();
  };

  const clickDelete = (id: number) => {
    setDeleteId(id);
    confirmDeleteModalRef.current?.open();
  };

  const confirmDelete = () => {
    if (!deleteId || isPendingDelete) return;
    mutateDelete([deleteId], {
      onSuccess: () => {
        closeConfirmModal();
        toast.success(t('common.success_delete'));
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('common.fail_delete'));
      },
    });
  };

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchNextPage();
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className='md:hidden'>
        <Loading />
      </div>
    );
  }

  return (
    <section className='-mt-4 space-y-4 md:mt-0 md:hidden'>
      {workers.map((worker) => (
        <div key={worker.id} className='border-border-soft space-y-4 rounded-xl border p-4'>
          <div className='flex items-center gap-3'>
            <Checkbox
              label={worker.name}
              labelClassName='title-16 ml-1'
              checked={!!rowSelection[worker.id]}
              onChange={(value) => {
                onCheckItem(worker.id, value);
              }}
            />
            <div className='bg-text-third size-1.5 rounded-full'></div>
            <p className='title-16'>{splitPhonePattern(worker.mobile)?.formatted || ''}</p>
          </div>
          <div className='bg-border-soft h-px'></div>
          <div className='flex gap-4'>
            <div className='flex-1 space-y-1'>
              <p className='body-14'>{t('common.registration')}</p>
              <p className='title-14'>{formatDate(worker.created_at, DATE_FORMAT.DATE_HOUR_MINUTE)}</p>
            </div>
            <div className='flex-1 space-y-1'>
              <p className='body-14'>{t('common.recent_modified_date')}</p>
              <p className='title-14'>{formatDate(worker.updated_at, DATE_FORMAT.DATE_HOUR_MINUTE)}</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button size='sm' variant='outline' className='body-14 flex-1' onClick={() => clickDelete(worker.id)}>
              {t('editor.delete')}
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='body-14 flex-1'
              onClick={() => router.push(ROUTES.MY_PAGE.WORKER_DETAIL(worker.id))}>
              {t('common.edit_button')}
            </Button>
          </div>
        </div>
      ))}

      {hasNextPage && <div ref={loadMoreRef}>{isFetchingNextPage && <Loading />}</div>}

      <ConfirmModal
        ref={confirmDeleteModalRef}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        isLoading={isPendingDelete}
      />
    </section>
  );
};

export default WorkerListCard;
