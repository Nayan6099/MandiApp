'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useComparePrices } from '@/api/generated/endpoints/prices/prices';
import type { PriceDto } from '@/api/generated/model';
import { CropName } from '@/components/crop-name';
import { CropField, LocationFields } from '@/components/location-fields';
import { PageHeader } from '@/components/page-header';
import { PriceListSkeleton } from '@/components/price-list';
import { SaveButton } from '@/components/save-button';
import { EmptyState, ErrorState } from '@/components/state-message';
import { Button } from '@/components/ui/button';
import { useUrlFormSync } from '@/hooks/use-url-form-sync';
import { useT } from '@/i18n/use-t';
import { type CompareInput, compareSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

export function CompareView() {
  const { t, money, num, date } = useT();
  const params = useSearchParams();

  const form = useForm<CompareInput>({
    resolver: zodResolver(compareSchema),
    defaultValues: {
      commodity: params.get('commodity') ?? '',
      state: params.get('state') ?? undefined,
    },
  });
  const values = useWatch({ control: form.control });
  const commodity = values.commodity?.trim() ?? '';
  useUrlFormSync({ commodity, state: values.state });

  const query = useComparePrices(
    { commodity, state: values.state },
    { query: { enabled: commodity.length > 0 } },
  );
  const data = query.data;

  return (
    <div>
      <PageHeader title={t('compare.title')} subtitle={t('compare.subtitle')} />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="grid gap-3 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-2"
      >
        <CropField control={form.control} name="commodity" place={{ state: values.state }} required />
        <LocationFields
          control={form.control}
          setValue={form.setValue}
          fields={['state']}
          className="sm:grid-cols-1"
        />
      </form>

      <div className="mt-6">
        {!commodity ? (
          <EmptyState title={t('compare.pick')} />
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : query.isLoading ? (
          <PriceListSkeleton />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title={t('compare.empty')} />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">
                <CropName name={data.commodity} />
              </h2>
              <p className="text-muted-foreground text-sm">
                {data.date ? t('common.dataOf', { date: date(data.date) }) : null}
                {data.stats ? `, ${t('compare.mandis', { count: num(data.stats.marketCount) })}` : null}
              </p>
            </div>

            {data.stats ? (
              <dl className="mb-6 grid grid-cols-3 overflow-hidden rounded-xl border bg-card text-center">
                <Stat label={t('compare.cheapest')} value={money(data.stats.lowest)} tone="down" />
                <Stat label={t('compare.average')} value={money(data.stats.average)} />
                <Stat label={t('compare.costliest')} value={money(data.stats.highest)} tone="up" />
              </dl>
            ) : null}

            <CompareBars items={data.items} />
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'up' | 'down' }) {
  return (
    <div className="border-r px-2 py-4 last:border-r-0">
      <dt className="text-muted-foreground text-xs sm:text-sm">{label}</dt>
      <dd
        className={cn(
          'tabular mt-1 font-bold font-display text-lg sm:text-2xl',
          tone === 'down' && 'text-down',
          tone === 'up' && 'text-up',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** Each mandi as a row with a bar: longer bar = higher usual price. Cheapest first. */
function CompareBars({ items }: { items: PriceDto[] }) {
  const { t, money, num, perKg } = useT();
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  // Reset to first page when the commodity or list changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page when items array changes
  useEffect(() => {
    setPage(1);
  }, [items]);

  const max = useMemo(() => Math.max(...items.map((i) => i.modalPrice)), [items]);
  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const pageItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize],
  );

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-4">
      {items.length > 20 ? (
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>
            {t('prices.results', { count: num(items.length) })} ({startIndex + 1}–
            {Math.min(startIndex + pageSize, items.length)})
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs">{t('prices.sortLabel')}:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-md border border-input bg-card px-2 text-xs"
            >
              <option value={15}>15 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      ) : null}

      <ol className="flex flex-col gap-2">
        {pageItems.map((p, idx) => {
          const rank = startIndex + idx + 1;
          return (
            <li key={p.id} className="rounded-lg border bg-card p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <span className="tabular mt-0.5 w-6 shrink-0 text-right text-muted-foreground text-sm">
                  {rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0">
                      <span className="font-medium">{p.market}</span>
                      <span className="block truncate text-muted-foreground text-xs">
                        {p.district}, {p.state}
                      </span>
                    </p>
                    <p className="tabular shrink-0 font-bold text-lg text-primary">{money(p.modalPrice)}</p>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div
                      className={cn('h-full rounded-full', rank === 1 ? 'bg-down' : 'bg-accent')}
                      style={{ width: `${Math.max(4, (p.modalPrice / max) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-muted-foreground text-xs">
                    {p.variety ? `${t('common.variety')}: ${p.variety}. ` : ''}
                    {t('price.range')}: {money(p.minPrice)} – {money(p.maxPrice)}. {perKg(p.modalPrice)}
                  </p>
                </div>
                <SaveButton {...p} className="-mt-1 -mr-1" />
              </div>
            </li>
          );
        })}
      </ol>

      {totalPages > 1 ? (
        <nav className="mt-2 flex items-center justify-between gap-3 border-t pt-4" aria-label="Pagination">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
            <ChevronLeft aria-hidden />
            {t('prices.prev')}
          </Button>
          <span className="text-muted-foreground text-sm">
            {t('prices.page', { page: num(page), total: num(totalPages) })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            {t('prices.next')}
            <ChevronRight aria-hidden />
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
