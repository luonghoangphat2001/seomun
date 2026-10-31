import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import type { PriceSimulationResultRESP } from '../api';
import { buildPriceSimulationRows } from '../api/price-simulation.service';
import { formatWon, humanizeGroupCode } from '../utils';

interface PriceSimulationResultsProps {
  result?: PriceSimulationResultRESP;
  isLoading?: boolean;
}

const SKELETON_ROW_COUNT = 4;

export function PriceSimulationResults({ result, isLoading = false }: PriceSimulationResultsProps) {
  const { t } = useTranslation('page');

  const data = result?.data;
  const rows = data ? buildPriceSimulationRows(data) : [];
  const summary = data?.summary ?? { total_raw_cost: 0, total_selling_price: 0, profit: 0, profit_rate: 0 };
  const rawCost = data?.raw_cost;
  const sellingPrice = data?.selling_price;

  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]'>
      <Card>
        <CardHeader>
          <CardTitle>{t('products.price_simulation.results.cost_vs_selling.title')}</CardTitle>
          <p className='text-muted-foreground text-sm'>{t('products.price_simulation.results.cost_vs_selling.description')}</p>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.price_simulation.results.cost_vs_selling.component')}</TableHead>
                <TableHead>{t('products.price_simulation.results.cost_vs_selling.category')}</TableHead>
                <TableHead className='text-right'>{t('products.price_simulation.results.cost_vs_selling.cost')}</TableHead>
                <TableHead className='text-right'>{t('products.price_simulation.results.cost_vs_selling.selling_price')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className='h-4 w-24' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-16 rounded-full' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='ml-auto h-4 w-16' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='ml-auto h-4 w-16' />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className='font-medium'>
                      {t(`products.price_simulation.setup.groups.${row.groupCode}`, { defaultValue: humanizeGroupCode(row.groupCode) })}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{t(`products.price_simulation.results.categories.${row.category}`)}</Badge>
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>{formatWon(row.raw_cost)}</TableCell>
                    <TableCell className='text-right font-medium tabular-nums'>{formatWon(row.selling_price)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className='text-muted-foreground h-24 text-center'>
                    {t('products.price_simulation.results.cost_vs_selling.empty')}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && rawCost && sellingPrice ? (
                <>
                  <TableRow>
                    <TableCell colSpan={2} className='text-muted-foreground'>
                      {t('products.price_simulation.results.cost_vs_selling.subtotal')}
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>{formatWon(rawCost.sub_total)}</TableCell>
                    <TableCell className='text-right font-medium tabular-nums'>{formatWon(sellingPrice.sub_total)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className='text-muted-foreground'>
                      {t('products.price_simulation.results.cost_vs_selling.vat')}
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>{formatWon(rawCost.vat)}</TableCell>
                    <TableCell className='text-right font-medium tabular-nums'>{formatWon(sellingPrice.vat)}</TableCell>
                  </TableRow>
                </>
              ) : null}

              <TableRow className='bg-muted/40 hover:bg-muted/40'>
                <TableCell colSpan={2} className='font-semibold'>
                  {t('products.price_simulation.results.cost_vs_selling.total')}
                </TableCell>
                <TableCell className='text-right font-semibold tabular-nums'>
                  {isLoading ? <Skeleton className='ml-auto h-4 w-16' /> : formatWon(summary.total_raw_cost)}
                </TableCell>
                <TableCell className='text-primary text-right font-semibold tabular-nums'>
                  {isLoading ? <Skeleton className='ml-auto h-4 w-16' /> : formatWon(summary.total_selling_price)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('products.price_simulation.results.final_totals.title')}</CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='rounded-xl border p-4'>
            <p className='text-muted-foreground text-sm'>{t('products.price_simulation.results.final_totals.total_cost')}</p>
            {isLoading ? (
              <Skeleton className='mt-1 h-7 w-28' />
            ) : (
              <p className='mt-1 text-2xl font-semibold tabular-nums'>{formatWon(summary.total_raw_cost)}</p>
            )}
          </div>

          <div className='border-primary/30 bg-primary/5 rounded-xl border p-4'>
            <p className='text-muted-foreground text-sm'>{t('products.price_simulation.results.final_totals.total_selling_price')}</p>
            {isLoading ? (
              <Skeleton className='mt-1 h-8 w-32' />
            ) : (
              <p className='text-primary mt-1 text-3xl font-bold tabular-nums'>{formatWon(summary.total_selling_price)}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='rounded-xl border p-4'>
              <p className='text-muted-foreground text-sm'>{t('products.price_simulation.results.final_totals.margin')}</p>
              {isLoading ? (
                <Skeleton className='mt-1 h-6 w-20' />
              ) : (
                <p className='mt-1 text-lg font-semibold tabular-nums'>{formatWon(summary.profit)}</p>
              )}
            </div>
            <div className='rounded-xl border p-4'>
              <p className='text-muted-foreground text-sm'>{t('products.price_simulation.results.final_totals.margin_rate')}</p>
              {isLoading ? (
                <Skeleton className='mt-1 h-6 w-16' />
              ) : (
                <p className='mt-1 text-lg font-semibold tabular-nums'>{summary.profit_rate.toFixed(1)}%</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
