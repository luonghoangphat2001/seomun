'use client';

import { ContentRow, Description, DescriptionContent } from '@/components/common';
import { PaperClip } from '@/icons';
import { cn, formatFileSize } from '@/lib/utils';
import { QuoteInquiryDetailComment } from '@/types/inquiry';
import { useTranslations } from 'next-intl';

interface Props {
  comments: QuoteInquiryDetailComment[];
}

export const InquiryComments = ({ comments }: Props) => {
  const t = useTranslations();

  return comments.map((comment, index) => {
    const rows: ContentRow[] = [
      ...(comment.isAdmin
        ? [
            {
              items: [
                {
                  label: t('inquiry.person_in_charge'),
                  value: <div className='body-14 md:body-16 whitespace-pre-wrap'>{comment.authorName || '-'}</div>,
                },
              ],
            },
          ]
        : []),
      {
        items: [
          {
            label: t('inquiry.detail'),
            value: <div className='body-14 md:body-16 whitespace-pre-wrap'>{comment.content}</div>,
          },
        ],
      },
      ...(comment.files
        ? [
            {
              items: [
                {
                  label: t('inquiry.attachment'),
                  value:
                    comment.files.length > 0 ? (
                      <div className='flex flex-wrap gap-6'>
                        {comment.files.map((file) => (
                          <button
                            key={file.url}
                            type='button'
                            onClick={() => window.open(file.url, '_blank', 'noopener,noreferrer')}
                            className='text-text-brand-secondary flex items-center gap-1.5'>
                            <PaperClip className='size-5' />
                            <span className='body-14 md:body-16 underline'>
                              {file.name} ({formatFileSize(file.size)})
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      '-'
                    ),
                },
              ],
            },
          ]
        : []),
    ];

    return (
      <Description
        key={comment.id}
        className={cn(comment.isAdmin && 'bg-fill-brand-soft')}
        title={
          <span className='title-40 flex items-end justify-between'>
            <span className={cn(comment.isAdmin && 'text-text-brand-secondary')}>{comment.isAdmin ? 'A' : 'Q'}</span>
            <span className='body-14 text-text-secondary'>{comment.createdAt}</span>
          </span>
        }
        titleClassName='w-full'
        isCollapse={false}>
        <DescriptionContent
          labelClassName='items-start'
          className={index === comments.length - 1 ? 'border-x-0 border-b-0' : 'border-x-0'}
          rows={rows}
        />
      </Description>
    );
  });
};
