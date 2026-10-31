import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import { usePriceHistoryDetailQuery, usePriceHistoryLogsQuery, type PriceHistoryLog } from '../api';
import { PriceHistorySearchFilters } from '../components/PriceHistorySearchFilters';
import { EMPTY_PRICE_HISTORY_SEARCH_FILTER_VALUES, getPriceHistoryFieldLabelKey, type PriceHistorySearchFilterValues } from '../constants';

function getRowColor(actionType: PriceHistoryLog['action_type']) {
  if (actionType === 'CREATE') {
    return 'bg-green-50/70';
  }

  if (actionType === 'DELETE') {
    return 'bg-red-50/70';
  }

  return 'bg-blue-50/70';
}

function normalizeValue(value: string | undefined) {
  if (!value || !value.trim()) {
    return '-';
  }

  return value;
}

function humanizeFieldKey(fieldKey: string) {
  return fieldKey
    .split('_')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

export function PriceHistoryPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<PriceHistorySearchFilterValues>(EMPTY_PRICE_HISTORY_SEARCH_FILTER_VALUES);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      page: DEFAULT_PAGE,
      per_page: DEFAULT_PER_PAGE,
      query: filters.query.trim() || undefined,
      action_type: filters.action_type,
      target_section: filters.target_section,
    }),
    [filters],
  );

  const logsQuery = usePriceHistoryLogsQuery(queryParams);
  const detailQuery = usePriceHistoryDetailQuery(selectedLogId ?? '', Boolean(selectedLogId));

  const logs = logsQuery.data?.data ?? [];
  const detailRows = useMemo(() => {
    if (!detailQuery.data) {
      return [];
    }

    const beforePayload = detailQuery.data.before_payload ?? {};
    const afterPayload = detailQuery.data.after_payload ?? {};
    const mergedKeys = Array.from(new Set([...Object.keys(beforePayload), ...Object.keys(afterPayload)])).sort();

    return mergedKeys.map((fieldKey) => {
      const beforeValue = normalizeValue(beforePayload[fieldKey]);
      const afterValue = normalizeValue(afterPayload[fieldKey]);

      return {
        fieldKey,
        beforeValue,
        afterValue,
        changed: beforeValue !== afterValue,
      };
    });
  }, [detailQuery.data]);

  const getFieldLabel = (fieldKey: string) => {
    const translationKey = getPriceHistoryFieldLabelKey(fieldKey);

    return translationKey ? t(translationKey, humanizeFieldKey(fieldKey)) : humanizeFieldKey(fieldKey);
  };

  const getDetailStatusLabel = (changed: boolean) => {
    const actionType = detailQuery.data?.action_type;

    if (actionType === 'CREATE') {
      return t('page.products.price_history.detail.created');
    }

    if (actionType === 'DELETE') {
      return t('page.products.price_history.detail.deleted');
    }

    return changed ? t('page.products.price_history.detail.updated') : t('page.products.price_history.detail.unchanged');
  };

  return (
    <PageContainer>
      <div className='space-y-4'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.products.price_history.title')}</h1>
          <p className='text-muted-foreground mt-0.5 text-sm'>{t('page.products.price_history.description')}</p>
        </div>

        <PriceHistorySearchFilters
          initialValues={filters}
          onSearch={setFilters}
          onReset={() => setFilters(EMPTY_PRICE_HISTORY_SEARCH_FILTER_VALUES)}
        />

        <div data-slot='data-table' className='bg-card flex min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm'>
          <Table className='min-w-255 table-fixed' containerClassName='min-h-0'>
            <colgroup>
              <col className='w-52' />
              <col className='w-28' />
              <col className='w-36' />
              <col className='w-52' />
              <col className='w-auto' />
              <col className='w-40' />
            </colgroup>
            <TableHeader className='bg-card sticky top-0 z-10 shadow-[0_1px_0_var(--border)]'>
              <TableRow className='hover:bg-transparent'>
                <TableHead>{t('page.products.price_history.columns.time')}</TableHead>
                <TableHead>{t('page.products.price_history.columns.action')}</TableHead>
                <TableHead>{t('page.products.price_history.columns.section')}</TableHead>
                <TableHead>{t('page.products.price_history.columns.name')}</TableHead>
                <TableHead>{t('page.products.price_history.columns.summary')}</TableHead>
                <TableHead>{t('page.products.price_history.columns.processor')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-32 text-center'>
                    <Loader2 className='text-muted-foreground mx-auto size-5 animate-spin' />
                  </TableCell>
                </TableRow>
              ) : logsQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-muted-foreground h-32 text-center text-sm'>
                    {t('page.products.price_history.messages.load_error')}
                  </TableCell>
                </TableRow>
              ) : logs.length ? (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className={`${getRowColor(log.action_type)} cursor-pointer hover:opacity-95`}
                    onClick={() => setSelectedLogId(log.id)}
                  >
                    <TableCell className='text-sm'>{new Date(log.changed_at).toLocaleString()}</TableCell>
                    <TableCell className='text-sm font-medium'>{t(`page.products.price_history.actions.${log.action_type}`)}</TableCell>
                    <TableCell className='text-sm'>{t(`page.products.price_history.sections.${log.target_section}`)}</TableCell>
                    <TableCell className='text-sm'>{log.target_name}</TableCell>
                    <TableCell className='text-sm'>{log.summary_text}</TableCell>
                    <TableCell className='text-sm'>{log.changed_by}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className='text-muted-foreground h-32 text-center text-sm'>
                    {t('page.products.price_history.messages.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AppDialogModal
        isOpen={Boolean(selectedLogId)}
        setIsOpen={(isOpen) => {
          if (!isOpen) {
            setSelectedLogId(null);
          }
        }}
        title={t('page.products.price_history.detail.title')}
        width={920}
        contentClassName='max-h-[85vh] overflow-y-auto'
        cancelText={t('common.action.cancel')}
      >
        {detailQuery.isLoading ? (
          <div className='py-6'>
            <Loader2 className='text-muted-foreground mx-auto size-5 animate-spin' />
          </div>
        ) : detailQuery.data ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-2 rounded-lg border bg-slate-50/60 p-3 text-sm md:grid-cols-2'>
              <p>
                <span className='font-medium'>{t('page.products.price_history.columns.action')}: </span>
                {t(`page.products.price_history.actions.${detailQuery.data.action_type}`)}
              </p>
              <p>
                <span className='font-medium'>{t('page.products.price_history.columns.section')}: </span>
                {t(`page.products.price_history.sections.${detailQuery.data.target_section}`)}
              </p>
              <p>
                <span className='font-medium'>{t('page.products.price_history.columns.name')}: </span>
                {detailQuery.data.target_name}
              </p>
              <p>
                <span className='font-medium'>{t('page.products.price_history.columns.processor')}: </span>
                {detailQuery.data.changed_by}
              </p>
              <p className='md:col-span-2'>
                <span className='font-medium'>{t('page.products.price_history.columns.time')}: </span>
                {new Date(detailQuery.data.changed_at).toLocaleString()}
              </p>
            </div>

            <div className='overflow-hidden rounded-lg border'>
              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead>{t('page.products.price_history.detail.field')}</TableHead>
                    <TableHead>{t('page.products.price_history.detail.old_value')}</TableHead>
                    <TableHead>{t('page.products.price_history.detail.new_value')}</TableHead>
                    <TableHead className='text-center'>{t('page.products.price_history.detail.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailRows.length ? (
                    detailRows.map((row) => (
                      <TableRow key={row.fieldKey}>
                        <TableCell className='font-medium'>{getFieldLabel(row.fieldKey)}</TableCell>
                        <TableCell className={row.changed ? 'bg-amber-50 font-medium' : ''}>{row.beforeValue}</TableCell>
                        <TableCell className={row.changed ? 'bg-emerald-50 font-medium' : ''}>{row.afterValue}</TableCell>
                        <TableCell className='text-center'>
                          <Badge variant={row.changed ? 'default' : 'secondary'}>{getDetailStatusLabel(row.changed)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className='text-muted-foreground h-20 text-center text-sm'>
                        {t('page.products.price_history.detail.no_value')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>{t('page.products.price_history.messages.load_error')}</p>
        )}
      </AppDialogModal>
    </PageContainer>
  );
}
