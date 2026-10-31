import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { TaskLogRESP } from '../api';
import { buildTaskTypeLabels, TASK_TYPE_STYLES } from '../constants';
import { TaskLogSortField } from '../enums';
import { formatJsonValueLines, getPermissionMenuLines, isHtml, isPlainObject, linePartsToText } from '../utils/format-json-value';
import { type HtmlField, HtmlValueDialog } from './HtmlValueDialog';
import { JsonFieldValue, JsonLineParts } from './JsonValueTree';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const DATE_TIME_VALUE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

function isUrl(value: string) {
  return /^https?:\/\//.test(value);
}

function formatPrimitiveValue(value: unknown) {
  const text = String(value);
  return DATE_TIME_VALUE.test(text) && dayjs(text).isValid() ? dayjs(text).format(DATE_TIME_FORMAT) : text;
}

const COLLAPSED_ENTRY_LIMIT = 3;
const COLLAPSED_LINE_LIMIT = 2;

function isObjectValue(value: unknown) {
  return value !== null && typeof value === 'object';
}

function ValueChangeCell({ log, side }: { log: TaskLogRESP; side: 'before' | 'after' }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [htmlField, setHtmlField] = useState<HtmlField>();
  const values = side === 'before' ? log.before_values : log.after_values;
  const otherValues = side === 'before' ? log.after_values : log.before_values;

  if (!values) return <span className='text-muted-foreground'>-</span>;
  if (Array.isArray(values)) {
    if (values.length === 0) return <span className='text-muted-foreground'>-</span>;
    return <span className='text-sm'>{JSON.stringify(values)}</span>;
  }

  const entries = Object.entries(values);
  if (entries.length === 0) return <span className='text-muted-foreground'>-</span>;

  const hiddenCount = Math.max(entries.length - COLLAPSED_ENTRY_LIMIT, 0);
  const collapsed =
    !expanded &&
    (hiddenCount > 0 || entries.some(([, item]) => Array.isArray(item.value) && formatJsonValueLines(item.value).length > COLLAPSED_LINE_LIMIT));
  const clamp = collapsed ? 'line-clamp-2' : '';

  return (
    <div className='grid max-w-96 grid-cols-[auto_1fr] items-start gap-x-2 gap-y-1 text-left text-xs wrap-break-word whitespace-normal'>
      {(collapsed ? entries.slice(0, COLLAPSED_ENTRY_LIMIT) : entries).map(([key, item]) => {
        const label = item.label?.ko || item.label?.en || key;
        const objectValue = isObjectValue(item.value);
        const val = item.value === null ? 'NULL' : formatPrimitiveValue(item.value);
        const title = collapsed ? val : undefined;

        if (isHtml(item.value)) {
          return (
            <Fragment key={key}>
              <span className='text-muted-foreground pt-0.5 font-semibold'>{label}:</span>
              <button
                type='button'
                className='cursor-pointer justify-self-start font-medium text-blue-600 hover:underline'
                onClick={() => setHtmlField({ key, label })}
              >
                {t('common.action.view')}
              </button>
            </Fragment>
          );
        }

        if (isPlainObject(item.value)) {
          return (
            <div key={key} className='col-span-2 space-y-0.5'>
              <div className='text-muted-foreground font-semibold'>{label}:</div>
              <JsonFieldValue
                value={item.value}
                other={Array.isArray(otherValues) ? undefined : otherValues?.[key]?.value}
                side={side}
                onViewHtml={(path) => setHtmlField({ key, label, path })}
              />
            </div>
          );
        }

        if (objectValue) {
          const lines = formatJsonValueLines(item.value);
          const permissionLines = getPermissionMenuLines(item.value);
          const visibleCount = collapsed ? COLLAPSED_LINE_LIMIT : undefined;
          return (
            <Fragment key={key}>
              <span className='text-muted-foreground pt-0.5 font-semibold'>{label}:</span>
              {lines.length === 0 ? (
                <span className='text-muted-foreground pt-0.5'>-</span>
              ) : permissionLines ? (
                <div className='min-w-0 space-y-1.5'>
                  {permissionLines.slice(0, visibleCount).map(({ menu, actions }, index) => (
                    <div key={index} className='space-y-1'>
                      <div className='text-foreground font-semibold'>{menu}</div>
                      <div className='flex flex-wrap gap-1'>
                        {actions.length === 0 ? (
                          <span className='text-muted-foreground'>-</span>
                        ) : (
                          actions.map((action) => (
                            <span key={action} className='bg-muted text-foreground rounded border px-1.5 py-px text-[11px] font-medium'>
                              {action}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul
                  className={`text-foreground min-w-0 space-y-0.5 font-medium ${lines.length > 1 ? 'list-disc pl-3.5' : ''}`}
                  title={collapsed ? lines.map((line) => linePartsToText(line, 'HTML')).join('\n') : undefined}
                >
                  {lines.slice(0, visibleCount).map((line, index) => (
                    <li key={index} className={clamp}>
                      <JsonLineParts parts={line} onViewHtml={(path) => setHtmlField({ key, label, path })} />
                    </li>
                  ))}
                </ul>
              )}
            </Fragment>
          );
        }

        return (
          <Fragment key={key}>
            <span className='text-muted-foreground pt-0.5 font-semibold'>{label}:</span>
            {isUrl(val) ? (
              <a
                href={val}
                target='_blank'
                rel='noopener noreferrer'
                className={`min-w-0 font-mono font-medium break-all text-blue-600 underline hover:text-blue-700 ${clamp}`}
                title={title}
              >
                {val}
              </a>
            ) : (
              <span className={`${val ? 'text-foreground' : 'text-muted-foreground'} min-w-0 font-mono font-medium break-all ${clamp}`} title={title}>
                {val || '-'}
              </span>
            )}
          </Fragment>
        );
      })}
      {(collapsed || expanded) && (
        <button
          type='button'
          aria-expanded={expanded}
          className='col-span-2 cursor-pointer justify-self-start font-medium text-blue-600 hover:underline'
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded
            ? t('common.action.show_less')
            : hiddenCount > 0
              ? t('common.action.show_more_count', { count: hiddenCount })
              : t('common.action.show_more')}
        </button>
      )}
      <HtmlValueDialog log={log} field={htmlField} onClose={() => setHtmlField(undefined)} />
    </div>
  );
}

export function getTaskLogColumns(t: TFunction<'page'>): ColumnDef<TaskLogRESP>[] {
  const taskTypeLabels = buildTaskTypeLabels(t);

  return [
    {
      accessorKey: 'no',
      header: t('system_logs.tasks.columns.no'),
      enableSorting: false,
      cell: ({ row }) => <span className='text-sm font-medium'>{row.original.no ?? row.index + 1}</span>,
    },
    {
      id: TaskLogSortField.CREATED_AT,
      accessorKey: 'created_at',
      header: t('system_logs.tasks.columns.created_at'),
      enableSorting: true,
      cell: ({ row }) => <span className='text-sm'>{dayjs(row.original.created_at).format(DATE_TIME_FORMAT)}</span>,
    },
    {
      id: TaskLogSortField.WORKER,
      accessorKey: 'worker',
      header: t('system_logs.tasks.columns.worker'),
      enableSorting: true,
      cell: ({ row }) => {
        const worker = row.original.worker;

        return (
          <div className='space-y-0.5 text-left'>
            <div className={worker?.name ? 'text-foreground text-sm' : 'text-muted-foreground text-sm'}>
              {worker?.name ? `${worker.name} (${worker.email})` : '-'}
            </div>
            {worker?.role && <div className='text-muted-foreground text-xs'>{t(`administrators.enums.roles.${worker.role}`)}</div>}
          </div>
        );
      },
    },
    {
      id: TaskLogSortField.MENU,
      accessorKey: 'target_menu',
      header: t('system_logs.tasks.columns.target_menu'),
      enableSorting: true,
      cell: ({ row }) => (
        <div className='space-y-0.5 text-left'>
          <div className='text-foreground text-sm font-semibold'>{row.original.target_menu}</div>
          <div className='text-muted-foreground text-xs'>ID: {row.original.data_identifier}</div>
        </div>
      ),
    },
    {
      id: TaskLogSortField.TASK_TYPE,
      accessorKey: 'task_type',
      header: t('system_logs.tasks.columns.task_type'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className={`rounded px-2.5 py-0.5 text-xs font-semibold ${TASK_TYPE_STYLES[row.original.task_type]}`}>
          {taskTypeLabels[row.original.task_type]}
        </span>
      ),
    },
    {
      accessorKey: 'before_values',
      header: t('system_logs.tasks.columns.before_values'),
      enableSorting: false,
      cell: ({ row }) => <ValueChangeCell log={row.original} side='before' />,
    },
    {
      accessorKey: 'after_values',
      header: t('system_logs.tasks.columns.after_values'),
      enableSorting: false,
      cell: ({ row }) => <ValueChangeCell log={row.original} side='after' />,
    },
  ];
}
