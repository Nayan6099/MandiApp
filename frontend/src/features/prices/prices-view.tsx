'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useListPrices } from '@/api/generated/endpoints/prices/prices';
import { CropField, LocationFields } from '@/components/location-fields';
import { PageHeader } from '@/components/page-header';
import { PriceList, PriceListSkeleton } from '@/components/price-list';
import { EmptyState, ErrorState } from '@/components/state-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounced } from '@/hooks/use-debounced';
import { useT } from '@/i18n/use-t';
import {
  type PricesFilter,
  type PricesFilterInput,
  parseSearchParams,
  pricesFilterSchema,
  SORTS,
  toSearchParams,
} from '@/lib/schemas';

/** Stable query-string for a filter set ("commodity" is the default sort, so it is left out). */
const filterKey = (f: PricesFilter | undefined) =>
  toSearchParams({ ...f, sort: f?.sort === 'commodity' ? undefined : f?.sort });

export function PricesView() {
  const { t, num, date } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const fromUrl = useMemo(() => parseSearchParams(pricesFilterSchema, params), [params]);
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSizeParam = Number(params.get('pageSize'));
  const pageSize = [10, 20, 50, 100].includes(pageSizeParam) ? pageSizeParam : 20;

  const [jumpPage, setJumpPage] = useState('');

  const form = useForm<PricesFilterInput>({
    resolver: zodResolver(pricesFilterSchema),
    defaultValues: fromUrl,
  });

  // Form → URL. Typing in the search box waits a moment; dropdowns apply at once.
  const values = useWatch({ control: form.control });
  const q = useDebounced(values.q ?? '', 400);
  const lastWritten = useRef(filterKey(fromUrl));

  // biome-ignore lint/correctness/useExhaustiveDependencies: run only when a filter value changes
  useEffect(() => {
    const parsed = pricesFilterSchema.safeParse({ ...values, q });
    if (!parsed.success) return;
    const next = filterKey(parsed.data);
    if (next === filterKey(fromUrl)) return;
    lastWritten.current = next;
    const sp = new URLSearchParams(next);
    if (pageSize !== 20) sp.set('pageSize', String(pageSize));
    router.replace(sp.toString() ? `${pathname}?${sp.toString()}` : pathname, { scroll: false });
  }, [values.state, values.district, values.market, values.commodity, values.sort, q, pageSize]);

  // URL → form, only when the URL changed from outside (a link, back button).
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to URL changes only
  useEffect(() => {
    const key = filterKey(fromUrl);
    if (key !== lastWritten.current) {
      lastWritten.current = key;
      form.reset(fromUrl);
    }
  }, [fromUrl]);

  const goToPage = (p: number, newPageSize = pageSize) => {
    const sp = new URLSearchParams(params);
    if (p > 1) sp.set('page', String(p));
    else sp.delete('page');
    if (newPageSize !== 20) sp.set('pageSize', String(newPageSize));
    else sp.delete('pageSize');
    router.replace(`${pathname}?${sp.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(jumpPage);
    if (data && target >= 1 && target <= data.totalPages) {
      goToPage(target);
      setJumpPage('');
    }
  };

  const query = useListPrices(
    { ...fromUrl, page, pageSize },
    { query: { placeholderData: keepPreviousData } },
  );
  const data = query.data;

  const startRecord = data && data.total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRecord = data ? Math.min(page * pageSize, data.total) : 0;

  return (
    <div>
      <PageHeader title={t('prices.title')} subtitle={t('prices.subtitle')} />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
        aria-label={t('prices.title')}
      >
        <LocationFields control={form.control} setValue={form.setValue} />
        <div className="grid gap-3 sm:grid-cols-3">
          <CropField
            control={form.control}
            name="commodity"
            place={{ state: values.state, district: values.district, market: values.market }}
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-q">{t('prices.searchLabel')}</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="f-q"
                type="search"
                className="h-11 pl-9"
                placeholder={t('prices.searchPlaceholder')}
                {...form.register('q')}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-sort">{t('prices.sortLabel')}</Label>
            <select
              id="f-sort"
              {...form.register('sort')}
              className="h-11 w-full cursor-pointer rounded-md border border-input bg-card px-3 text-base shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {t(
                    s === 'commodity'
                      ? 'prices.sortCommodity'
                      : s === 'market'
                        ? 'prices.sortMarket'
                        : s === 'price_low'
                          ? 'prices.sortLow'
                          : 'prices.sortHigh',
                  )}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <div className="mt-6 mb-3 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
        {data ? (
          <div>
            <h2 className="font-medium text-sm sm:text-base">
              {data.total > 0
                ? `${t('prices.results', { count: num(data.total) })} (${num(startRecord)}–${num(endRecord)})`
                : t('prices.results', { count: num(0) })}
            </h2>
            {data.date ? (
              <p className="text-muted-foreground text-xs sm:text-sm">
                {t('common.dataOf', { date: date(data.date) })}
              </p>
            ) : null}
          </div>
        ) : null}

        {data && data.total > 0 ? (
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="f-pagesize" className="text-muted-foreground text-xs sm:text-sm">
              {t('prices.sortLabel')}:
            </label>
            <select
              id="f-pagesize"
              value={pageSize}
              onChange={(e) => goToPage(1, Number(e.target.value))}
              className="h-9 cursor-pointer rounded-md border border-input bg-card px-2.5 text-xs shadow-xs"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        ) : null}
      </div>

      {query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.isLoading ? (
        <PriceListSkeleton />
      ) : data && data.items.length === 0 ? (
        <EmptyState title={t('prices.empty')} hint={t('prices.emptyHint')} />
      ) : data ? (
        <div className={query.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
          <PriceList items={data.items} />
          {data.totalPages > 1 ? (
            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <nav className="flex flex-wrap items-center gap-1.5" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  <span className="hidden sm:inline">{t('prices.prev')}</span>
                </Button>

                {getPageNumbers(page, data.totalPages).map((p, idx) =>
                  p === 'ellipsis' ? (
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed ellipsis position
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      className="size-8 p-0 text-xs"
                      onClick={() => goToPage(p)}
                    >
                      {num(p)}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= data.totalPages}
                  className="gap-1"
                >
                  <span className="hidden sm:inline">{t('prices.next')}</span>
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </nav>

              <form onSubmit={handleJump} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">
                  {t('prices.page', { page: num(page), total: num(data.totalPages) })}
                </span>
                <Input
                  type="number"
                  min={1}
                  max={data.totalPages}
                  placeholder={String(page)}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  className="h-8 w-14 px-1.5 text-center text-xs"
                />
                <Button type="submit" variant="secondary" size="sm" className="h-8 px-2 text-xs">
                  Go
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [];
  pages.push(1);
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}
