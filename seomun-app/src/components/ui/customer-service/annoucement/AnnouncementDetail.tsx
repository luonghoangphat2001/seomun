'use client';

import { Button, RichText } from '@/components/common';
import { useRouter } from '@/i18n/navigation';
import { Attachment, ChevronLeft, Download, Right, ShareNetwork } from '@/icons';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { AnnouncementList } from './AnnouncementList';
import { useParams } from 'next/navigation';
import { useNoticeDetailQuery, useNoticeListQuery } from '@/apis/notice/notice.query';
import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { AnnouncementTable } from './AnnouncementTable';
import Loading from '@/components/common/loading';
import { formatDate, formatFileSize, handleFileDownload } from '@/lib/utils';
import { copyCurrentUrl } from '@/lib/utils/helper';
import toast from 'react-hot-toast';

export const AnnouncementDetail = () => {
  const t = useTranslations('customer_service');
  const router = useRouter();
  const { id } = useParams();

  //api detail
  const { data: dataDetail, isLoading: isLoadingDetail } = useNoticeDetailQuery(Number(id) || undefined);

  //api list
  const { data: dataNotice, isLoading: isLoadingList } = useNoticeListQuery({
    page: PAGINATION.DEFAULT_PAGE,
    per_page: 5,
    exclude_ids: Number(id),
  });

  const toDetail = (id: number) => {
    router.push(ROUTES.CUSTOMER_SERVICE.ANNOUNCEMENT_DETAIL(id));
  };

  const handleCopy = async () => {
    const success = await copyCurrentUrl();

    if (success) {
      toast.success('링크가 복사되었습니다.');
    } else {
      toast.error('Failed to copy URL.');
    }
  };

  return (
    <section className='flex w-full flex-col gap-8 md:gap-12'>
      <div className='flex flex-col gap-6 md:gap-8'>
        <div className='flex flex-col gap-3'>
          <button onClick={() => router.back()} className='title-14 flex w-fit cursor-pointer items-center gap-1 md:gap-2'>
            <ChevronLeft className='h-6 w-6' />
            <span>{t('notice_list')}</span>
          </button>

          <div className='flex items-start gap-3'>
            <div className='flex flex-1 flex-col gap-2 md:gap-3'>
              <h1 className='title-24'>{dataDetail?.title}</h1>
              <p className='body-16'>{formatDate(dataDetail?.created_at || '', DATE_FORMAT.DATE_WITH_DOT)}</p>
            </div>
            <Button
              onClick={handleCopy}
              variant='outline'
              size='lg'
              className='body-16 hidden rounded-full md:flex'
              rightIcon={<ShareNetwork className='size-6' />}>
              {t('share')}
            </Button>
          </div>
        </div>

        {isLoadingDetail ? (
          <Loading displayText />
        ) : (
          <>
            <div className='bg-border-soft h-px w-full' />

            <div className='flex max-w-219 flex-col gap-6'>
              <RichText content={dataDetail?.content} className='body-16' />

              <div className='border-border-soft h-px w-full border-t border-dashed md:border-solid' />

              {dataDetail?.attachments && (
                <div className='flex flex-col gap-1.5 md:gap-3'>
                  <div className='flex items-center gap-1.5 md:gap-2'>
                    <Attachment className='size-4 md:size-5' />
                    <span className='title-14 md:title-18'>
                      {t('attachment')} ({dataDetail.attachments.length})
                    </span>
                  </div>
                  <div className=''>
                    {dataDetail.attachments.map((file) => (
                      <div
                        key={file.key}
                        className='flex cursor-pointer items-center gap-2 hover:opacity-80'
                        onClick={() => handleFileDownload(file.url, file.name)}>
                        <div className='bg-text-brand ml-7 size-1 shrink-0 rounded-full md:ml-2' />
                        <span className='body-14 text-text-brand truncate underline'>
                          {file.name} ({formatFileSize(file.size)})
                        </span>
                        <div>
                          <Download className='text-text-brand size-5' />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className='flex flex-col gap-4'>
        <div className='hidden justify-end md:flex'>
          <Button
            variant='ghost'
            size='md'
            className='body-16 px-4 underline'
            onClick={() => router.push(ROUTES.CUSTOMER_SERVICE.ANNOUNCEMENT)}
            rightIcon={<Right className='size-3' />}>
            {t('inventory')}
          </Button>
        </div>

        <div className='flex items-center justify-end md:hidden'>
          <Button
            variant='ghost'
            size='md'
            className='h-8 px-3'
            onClick={() => router.push(ROUTES.CUSTOMER_SERVICE.ANNOUNCEMENT)}>
            <span className='body-16 underline'>{t('inventory')}</span>
          </Button>
        </div>

        <AnnouncementTable
          data={dataNotice?.list || []}
          pagination={{ pageIndex: PAGINATION.DEFAULT_PAGE_INDEX, pageSize: 5 }}
          totalItems={dataNotice?.pagination.total_item || 0}
          isLoading={isLoadingList}
          toDetail={toDetail}
        />

        <AnnouncementList relatedData={dataNotice?.list || []} toDetail={toDetail} />
      </div>
    </section>
  );
};
