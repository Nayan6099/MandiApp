'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
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

const PAGE_SIZE = 20;

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
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [values.state, values.district, values.market, values.commodity, values.sort, q]);

  // URL → form, only when the URL changed from outside (a link, back button).
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to URL changes only
  useEffect(() => {
    const key = filterKey(fromUrl);
    if (key !== lastWritten.current) {
      lastWritten.current = key;
      form.reset(fromUrl);
    }
  }, [fromUrl]);

  const goToPage = (p: number) => {
    const sp = new URLSearchParams(params);
    if (p > 1) sp.set('page', String(p));
    else sp.delete('page');
    router.replace(`${pathname}?${sp.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const query = useListPrices(
    { ...fromUrl, page, pageSize: PAGE_SIZE },
    { query: { placeholderData: keepPreviousData } },
  );
  const data = query.data;

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

      <div className="mt-6 mb-3 flex flex-wrap items-baseline justify-between gap-2" aria-live="polite">
        {data ? (
          <>
            <p className="font-medium">{t('prices.results', { count: num(data.total) })}</p>
            {data.date ? (
              <p className="text-muted-foreground text-sm">{t('common.dataOf', { date: date(data.date) })}</p>
            ) : null}
          </>
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
            <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Pagination">
              <Button variant="outline" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                <ChevronLeft aria-hidden />
                {t('prices.prev')}
              </Button>
              <span className="text-muted-foreground text-sm">
                {t('prices.page', { page: num(page), total: num(data.totalPages) })}
              </span>
              <Button variant="outline" onClick={() => goToPage(page + 1)} disabled={page >= data.totalPages}>
                {t('prices.next')}
                <ChevronRight aria-hidden />
              </Button>
            </nav>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
