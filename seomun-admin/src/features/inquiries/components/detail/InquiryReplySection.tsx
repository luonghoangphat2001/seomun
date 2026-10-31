import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Pencil, SendHorizontal, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppTextareaFormField } from '@/components/shared/form-fields';
import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppInput } from '@/components/shared/app-input';
import { AppLabel } from '@/components/shared/app-label';
import { AppMessage } from '@/components/shared/app-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { getAnswerChannelLabel, getTimelineEventTypeLabel } from '../../constants';
import { useCreateReply, useDeleteReply, useInquiryReplies, useInquiryTimeline, useUpdateReply } from '../../api';
import { AnswerChannel, TimelineEventType } from '../../enums';
import { createReplySchema, type ReplyFormValues } from '../../schemas';
import type { ReplyDTO } from '../../types';
import { cn } from '@/utils/cn';
import { formatLocalDateTimeShort } from '@/utils/format-date';
import { ReplyAttachmentBadges } from './ReplyAttachmentBadges';
import { ReplyAttachmentUpload } from './ReplyAttachmentUpload';

export function InquiryReplySection({ inquiryId }: { inquiryId: string }) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const { t: tValidationRaw } = useTranslation('validation');
  const tValidation = tValidationRaw as (key: string, options?: Record<string, unknown>) => string;
  const { data: replies = [], isLoading: isRepliesLoading } = useInquiryReplies(inquiryId);
  const { data: timeline = [], isLoading: isTimelineLoading } = useInquiryTimeline(inquiryId);
  const isLoading = isRepliesLoading || isTimelineLoading;
  // `answered` only repeats the latest admin_comment, so it is shown as a badge on that answer instead of its own row.
  const thread = timeline.filter((event) => event.event_type !== TimelineEventType.ANSWERED);
  const latestAnswerId = thread.findLast((event) => event.event_type === TimelineEventType.ADMIN_COMMENT)?.id;
  // ponytail: timeline events carry no reply_id, so answers are matched to replies by created_at; add reply_id to the event payload if they ever drift.
  const replyByCreatedAt = new Map(replies.map((reply) => [reply.created_at, reply]));
  const createReply = useCreateReply();
  const updateReply = useUpdateReply();
  const deleteReply = useDeleteReply();
  const [editingReply, setEditingReply] = useState<ReplyDTO | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  const emptyReply = (): ReplyFormValues => ({
    reply_content: '',
    contact_phone: '',
    channels: [AnswerChannel.EMAIL],
    attachments: [],
  });

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(createReplySchema(t, tValidation)),
    defaultValues: emptyReply(),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!editingReply) {
      form.reset(emptyReply());
      return;
    }
    // The form sits above the history; jump to it so the edit is visible. Runs after reset() re-registers the field ref.
    form.setFocus('reply_content');
  }, [editingReply, form]);

  const submit = (values: ReplyFormValues) => {
    const data = {
      ...values,
      attachments: values.attachments?.map((att) => ({ key: att.url, name: att.name, url: att.url, size: att.size ?? 0 })),
    };
    if (editingReply) {
      updateReply.mutate(
        { inquiryId, replyId: editingReply.id, data },
        {
          onSuccess: () => {
            setEditingReply(null);
            form.reset(emptyReply());
          },
        },
      );
      return;
    }

    createReply.mutate(
      { id: inquiryId, data },
      {
        onSuccess: () => {
          toast.success(t('page.inquiries.messages.reply_success'));
          form.reset(emptyReply());
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingReplyId) return;
    deleteReply.mutate(
      { inquiryId, replyId: deletingReplyId },
      {
        onSuccess: () => setDeletingReplyId(null),
      },
    );
  };

  const handleEdit = (reply: ReplyDTO) => {
    setEditingReply(reply);
    const channel = Object.values(AnswerChannel).find((c) => c === reply.notification_channel);
    form.reset({
      reply_content: reply.content,
      contact_phone: reply.contact_phone ?? '',
      channels: channel ? [channel] : [AnswerChannel.EMAIL],
      attachments: (reply.attachments ?? []).map((att) => ({ url: att.url, name: att.name, size: att.size })),
    });
  };

  const isMutating = createReply.isPending || updateReply.isPending || deleteReply.isPending;

  return (
    <section className='bg-card rounded-xl border'>
      <div className='px-6 py-4'>
        <h2 className='text-sm font-semibold'>{t('page.inquiries.detail.register_answer')}</h2>
      </div>
      <Separator />
      <div className='space-y-6 p-6'>
        <form onSubmit={form.handleSubmit(submit)} className='space-y-4'>
          <AppTextareaFormField
            name='reply_content'
            control={form.control}
            label={t('form.inquiries.fields.reply_content.label')}
            rows={4}
            placeholder={t('form.inquiries.fields.reply_content.placeholder')}
            required
          />
          <Controller
            name='contact_phone'
            control={form.control}
            render={({ field, fieldState }) => (
              <div className='space-y-2'>
                <AppLabel label={t('form.inquiries.fields.contact_phone.label')} />
                <AppInput
                  value={field.value ?? ''}
                  onValueChange={(value) => field.onChange(value.replace(/\D/g, '').slice(0, 12))}
                  onBlur={field.onBlur}
                  placeholder={t('form.inquiries.fields.contact_phone.placeholder')}
                  inputMode='numeric'
                  maxLength={12}
                  isInvalid={!!fieldState.error}
                />
                <AppMessage message={fieldState.error?.message} />
              </div>
            )}
          />
          <Controller
            name='channels'
            control={form.control}
            render={({ field, fieldState }) => (
              <div className='space-y-2'>
                <AppLabel label={t('form.inquiries.fields.channels.label')} required />
                <div className='flex flex-wrap gap-4'>
                  {Object.values(AnswerChannel).map((channel) => (
                    <label key={channel} className='flex items-center gap-2 text-sm'>
                      <Checkbox
                        checked={field.value.includes(channel)}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true ? [...field.value, channel] : field.value.filter((item) => item !== channel));
                        }}
                      />
                      {getAnswerChannelLabel(t, channel)}
                    </label>
                  ))}
                </div>
                <AppMessage message={fieldState.error?.message} />
              </div>
            )}
          />
          <Controller
            name='attachments'
            control={form.control}
            render={({ field }) => (
              <div className='space-y-2'>
                <AppLabel label={t('form.inquiries.fields.attachments.label')} />
                <ReplyAttachmentUpload value={field.value} onChange={field.onChange} disabled={isMutating} />
              </div>
            )}
          />
          <div className='flex flex-wrap gap-2'>
            <Button type='submit' className='gap-2' disabled={isMutating || !form.formState.isValid}>
              <SendHorizontal className='size-4' />{' '}
              {editingReply ? t('page.inquiries.actions.update_response') : t('page.inquiries.actions.send_response')}
            </Button>
            {editingReply ? (
              <Button type='button' variant='outline' onClick={() => setEditingReply(null)}>
                {t('page.inquiries.actions.cancel_edit')}
              </Button>
            ) : null}
          </div>
        </form>

        <div className='space-y-3'>
          <h3 className='text-sm font-semibold'>{t('page.inquiries.detail.response_history')}</h3>
          {isLoading ? <div className='text-muted-foreground text-sm'>{t('page.inquiries.messages.loading_responses')}</div> : null}
          {!isLoading && thread.length === 0 ? (
            <div className='text-muted-foreground text-sm'>{t('page.inquiries.messages.no_responses')}</div>
          ) : null}
          {thread.length ? (
            <ol className='divide-y overflow-hidden rounded-lg border'>
              {thread.map((event) => {
                const isAnswer = event.event_type === TimelineEventType.ADMIN_COMMENT;
                const reply = isAnswer ? replyByCreatedAt.get(event.created_at) : undefined;
                const isEditing = !!reply && reply.id === editingReply?.id;
                return (
                  <li key={event.id} className={cn('flex gap-3 px-4 py-3', isAnswer && 'bg-primary/5', isEditing && 'bg-primary/15')}>
                    <span
                      aria-hidden
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        isAnswer ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background',
                      )}
                    >
                      {isAnswer ? 'A' : 'Q'}
                    </span>
                    <div className='min-w-0 flex-1 space-y-2'>
                      <div className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className='text-sm font-semibold'>{getTimelineEventTypeLabel(t, event.event_type)}</span>
                          {event.id === latestAnswerId ? (
                            <Badge variant='outline' className='border-emerald-200 bg-emerald-50 text-emerald-700'>
                              {getTimelineEventTypeLabel(t, TimelineEventType.ANSWERED)}
                            </Badge>
                          ) : null}
                          {isEditing ? <Badge>{t('page.inquiries.detail.editing')}</Badge> : null}
                        </div>
                        <span className='text-muted-foreground text-right text-xs'>{formatLocalDateTimeShort(event.created_at)}</span>
                        <span className='text-muted-foreground text-xs'>{event.created_by.name}</span>
                        <span className='text-muted-foreground text-right text-xs'>
                          {reply?.updated_at && reply.updated_at !== reply.created_at
                            ? t('page.inquiries.messages.updated_at', { updated_at: formatLocalDateTimeShort(reply.updated_at) })
                            : null}
                        </span>
                      </div>
                      <div className='text-sm whitespace-pre-line'>{reply?.content ?? event.description}</div>
                      {reply?.attachments?.length ? <ReplyAttachmentBadges attachments={reply.attachments} /> : null}
                      {reply?.notification_channel ? (
                        <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                          {reply.notification_sent ? <Check className='size-3 text-emerald-500' /> : null}
                          <span className='font-medium'>{reply.notification_channel}</span>
                          <span>{reply.notification_status}</span>
                          {reply.notification_sent_at ? <span>{formatLocalDateTimeShort(reply.notification_sent_at)}</span> : null}
                        </div>
                      ) : null}
                      {reply ? (
                        // Edit and delete sit at opposite ends so the destructive action is hard to hit by mistake.
                        <div className='flex items-center justify-between gap-2 border-t pt-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='gap-1.5'
                            disabled={isEditing || isMutating}
                            onClick={() => handleEdit(reply)}
                          >
                            <Pencil className='size-3.5' />
                            {t('common.action.edit')}
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            className='gap-1.5'
                            disabled={!!editingReply || isMutating}
                            onClick={() => setDeletingReplyId(reply.id)}
                          >
                            <Trash2 className='size-3.5' />
                            {t('common.action.delete')}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </div>
      </div>

      <AppDialogModal
        isOpen={!!deletingReplyId}
        setIsOpen={(open) => {
          if (!open) setDeletingReplyId(null);
        }}
        title={t('common.action.delete')}
        confirmLoading={deleteReply.isPending}
        footer={
          <>
            <AppButton variant='outline' onClick={() => setDeletingReplyId(null)} disabled={deleteReply.isPending}>
              {t('common.action.cancel')}
            </AppButton>
            <AppButton variant='destructive' onClick={handleDeleteConfirm} isLoading={deleteReply.isPending}>
              {t('common.action.delete')}
            </AppButton>
          </>
        }
      >
        <p className='text-sm'>{t('page.inquiries.detail.confirm_delete_response')}</p>
      </AppDialogModal>
    </section>
  );
}
