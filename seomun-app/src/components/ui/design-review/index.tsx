'use client';

import { useGetOrderDesignReview, useReplyDesignReviewMutation } from '@/apis/order/order.query';
import { Button, Textarea } from '@/components/common';
import { DATE_FORMAT } from '@/constants/common';
import { DesignReviewReplyStatus } from '@/enums/common';
import { Link } from '@/i18n/navigation';
import { formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/routes';
import { ErrorRESP } from '@/types';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

type ReviewDecision = {
  response?: DesignReviewReplyStatus;
  note: string;
};

const getItemKey = (orderItemId: number, versionId: number) => `${orderItemId}-${versionId}`;

const getInitialDecision = (customerResponse: string, customerNote: string | null): ReviewDecision => ({
  response:
    customerResponse === DesignReviewReplyStatus.APPROVED || customerResponse === DesignReviewReplyStatus.REJECTED
      ? customerResponse
      : undefined,
  note: customerNote ?? '',
});

const formatDateTime = (value: string | undefined) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return formatDate(date, DATE_FORMAT.DATE_TIME);
};

const getErrorMessage = (error: unknown, fallback: string) =>
  (error as AxiosError<ErrorRESP>)?.response?.data.message ?? (error as Error)?.message ?? fallback;

const DesignReview = () => {
  const params = useParams<{ token: string }>();
  const token = typeof params.token === 'string' ? params.token : '';
  const t = useTranslations('design_review');
  const [decisions, setDecisions] = useState<Record<string, ReviewDecision>>({});
  const { data, isError, isLoading } = useGetOrderDesignReview(token);

  const { mutate: replyDesignReview, isPending } = useReplyDesignReviewMutation({
    onSuccess: (response) => {
      if (response.success === false) {
        toast.error(response.message ?? t('submit_failed'));
        return;
      }

      toast.success(response.message ?? t('submit_success'));
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, t('submit_failed')));
    },
  });

  const isComplete = useMemo(
    () =>
      Boolean(data?.items.length) &&
      (data?.items ?? []).every((item) => {
        const decision =
          decisions[getItemKey(item.order_item_id, item.version_id)] ??
          getInitialDecision(item.customer_response, item.customer_note);
        return decision?.response && (decision.response !== DesignReviewReplyStatus.REJECTED || Boolean(decision.note.trim()));
      }),
    [data?.items, decisions],
  );

  const updateDecision = (
    orderItemId: number,
    versionId: number,
    initialDecision: ReviewDecision,
    update: Partial<ReviewDecision>,
  ) => {
    const key = getItemKey(orderItemId, versionId);
    setDecisions((current) => ({
      ...current,
      [key]: { ...(current[key] ?? initialDecision), ...update },
    }));
  };

  const handleSubmit = () => {
    if (!data || !isComplete) {
      toast.error(t('complete_all_error'));
      return;
    }

    replyDesignReview({
      token,
      responses: data.items.map((item) => {
        const decision =
          decisions[getItemKey(item.order_item_id, item.version_id)] ??
          getInitialDecision(item.customer_response, item.customer_note);
        return {
          order_item_id: item.order_item_id,
          version_id: item.version_id,
          response: decision.response as DesignReviewReplyStatus,
          note: decision.response === DesignReviewReplyStatus.APPROVED ? 'approved' : decision.note.trim(),
        };
      }),
    });
  };

  const isEmptyData = !data?.items?.length;

  if (!token || isError || (!isLoading && isEmptyData)) {
    return (
      <main className='flex min-h-[52vh] items-center justify-center bg-gray-50 px-4 py-12'>
        <section className='border-border-soft w-full max-w-xl rounded-2xl border bg-white px-6 py-10 text-center shadow-sm'>
          <div className='bg-error/10 text-error mx-auto mb-5 flex size-12 items-center justify-center rounded-full text-2xl font-bold'>
            !
          </div>
          <h1 className='title-20 text-text-main mb-3'>{t('no_data_title')}</h1>
          <p className='body-16 text-text-secondary break-words'>{t('no_data_retry')}</p>
        </section>
      </main>
    );
  }

  if (isLoading || !data) {
    return (
      <main className='flex min-h-[52vh] items-center justify-center bg-gray-50 px-4 py-12'>
        <div className='text-text-secondary flex items-center gap-3'>
          <span className='border-primary size-5 animate-spin rounded-full border-2 border-t-transparent' />
          {t('loading')}
        </div>
      </main>
    );
  }

  const reviewData = data;

  const completedCount = reviewData.items.filter((item) => {
    const decision =
      decisions[getItemKey(item.order_item_id, item.version_id)] ??
      getInitialDecision(item.customer_response, item.customer_note);
    return decision.response;
  }).length;
  const expiresAt = formatDateTime(reviewData.expires_at);

  return (
    <main className='min-h-screen bg-gray-50 py-8 md:py-12'>
      <div className='mx-auto w-full max-w-4xl px-4'>
        <header className='bg-primary-500 mb-6 rounded-2xl bg-linear-to-br px-5 py-7 text-white shadow-sm md:px-8'>
          <p className='body-14 mb-2 text-white/75'>{t('order_design_confirmation')}</p>
          <h1 className='title-24 mb-4'>{t('title')}</h1>
          <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90'>
            <Link
              href={ROUTES.MY_PAGE.ORDER_DETAIL(String(reviewData.order_number))}
              target='_blank'
              rel='noreferrer'
              aria-label={t('view_order_detail', { orderNumber: reviewData.order_number })}
              className='text-primary-600 hover:bg-primary-50 hover:text-primary-500 inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 font-bold shadow-sm transition-colors'>
              {t('order_number', { orderNumber: reviewData.order_number })}
              <span aria-hidden='true'>↗</span>
            </Link>
            <span className='font-medium'>
              {t('remaining_items', { remaining: reviewData.remaining_items, total: reviewData.total_items })}
            </span>
            {expiresAt && <span className='font-medium'>{t('expires_at', { date: expiresAt })}</span>}
          </div>
        </header>

        <section className='border-border-soft mb-6 rounded-xl border bg-white p-5 shadow-sm md:p-6'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h2 className='title-18 text-text-main'>{t('check_each_file')}</h2>
              <p className='body-14 text-text-secondary mt-1'>{t('instruction')}</p>
            </div>
            <span className='bg-primary-50 text-text-brand w-fit rounded-full px-3 py-1.5 text-sm font-semibold'>
              {t('completed_count', { completed: completedCount, total: reviewData.items.length })}
            </span>
          </div>
        </section>

        <div className='space-y-5'>
          {reviewData.items.map((item, index) => {
            const key = getItemKey(item.order_item_id, item.version_id);
            const decision = decisions[key] ?? getInitialDecision(item.customer_response, item.customer_note);
            const isRejected = decision.response === DesignReviewReplyStatus.REJECTED;

            return (
              <article key={key} className='border-border-soft overflow-hidden rounded-xl border bg-white shadow-sm'>
                <div className='border-border-soft flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-text-brand text-sm font-bold'>{t('order_item_number', { number: index + 1 })}</p>
                    <h2 className='title-18 text-text-main mt-0.5'>{item.item_title}</h2>
                  </div>
                  <span className='text-text-secondary w-fit rounded-full bg-gray-100 px-3 py-1 text-sm'>
                    {t('version', { version: item.version })}
                  </span>
                </div>

                <div className='space-y-5 p-5'>
                  <div className='border-border-soft flex flex-col gap-3 rounded-lg border bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='min-w-0'>
                      <p className='text-text-main truncate font-semibold'>{item.file_name}</p>
                      {item.designer_note && (
                        <p className='body-14 text-text-secondary mt-1 whitespace-pre-wrap'>
                          {t('designer_note')}: {item.designer_note}
                        </p>
                      )}
                    </div>
                    <a
                      href={item.file_url}
                      download={item.file_name}
                      target='_blank'
                      rel='noreferrer'
                      className='border-text-brand text-text-brand hover:bg-primary-50 inline-flex h-10 shrink-0 items-center justify-center rounded-lg border px-4 text-sm font-bold transition-colors'>
                      {t('download_file')}
                    </a>
                  </div>

                  <div>
                    <p className='text-text-main mb-2 font-semibold'>
                      {t('your_response')} <span className='text-error'>*</span>
                    </p>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <button
                        type='button'
                        disabled={isPending}
                        onClick={() =>
                          updateDecision(item.order_item_id, item.version_id, decision, {
                            response: DesignReviewReplyStatus.APPROVED,
                          })
                        }
                        className={`cursor-pointer rounded-lg border px-4 py-3 text-left font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          decision.response === DesignReviewReplyStatus.APPROVED
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-border-soft text-text-main hover:border-emerald-300'
                        }`}>
                        {t('approve')}
                      </button>
                      <button
                        type='button'
                        disabled={isPending}
                        onClick={() =>
                          updateDecision(item.order_item_id, item.version_id, decision, {
                            response: DesignReviewReplyStatus.REJECTED,
                          })
                        }
                        className={`cursor-pointer rounded-lg border px-4 py-3 text-left font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          isRejected
                            ? 'border-error bg-error/5 text-error'
                            : 'border-border-soft text-text-main hover:border-error/50'
                        }`}>
                        {t('reject')}
                      </button>
                    </div>
                  </div>

                  {isRejected && (
                    <Textarea
                      required
                      label={t('revision_note')}
                      placeholder={t('revision_note_placeholder')}
                      value={decision.note}
                      disabled={isPending}
                      onChange={(event) =>
                        updateDecision(item.order_item_id, item.version_id, decision, { note: event.target.value })
                      }
                      error={!decision.note.trim() ? t('revision_note_required') : undefined}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {reviewData.items.length === 0 ? (
          <section className='border-border-soft rounded-xl border bg-white px-5 py-10 text-center shadow-sm'>
            <h2 className='title-18 text-text-main'>{t('no_remaining_items')}</h2>
            <p className='body-14 text-text-secondary mt-2'>{t('no_remaining_items_description')}</p>
          </section>
        ) : (
          <div className='border-border-soft sticky bottom-4 mt-6 rounded-xl border bg-white/95 p-4 shadow-lg backdrop-blur md:flex md:items-center md:justify-between'>
            <p className='body-14 text-text-secondary mb-3 md:mb-0'>
              {isComplete ? t('all_completed') : t('incomplete_count', { count: reviewData.items.length - completedCount })}
            </p>
            <Button size='lg' onClick={handleSubmit} loading={isPending} disabled={!isComplete} className='w-full md:w-auto'>
              {t('submit')}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default DesignReview;
