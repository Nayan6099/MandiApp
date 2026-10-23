'use client';

import { useQueries } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getListPricesQueryOptions } from '@/api/generated/endpoints/prices/prices';
import { CropName } from '@/components/crop-name';
import { PageHeader } from '@/components/page-header';
import { SaveButton } from '@/components/save-button';
import { EmptyState } from '@/components/state-message';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n/use-t';
import { toSearchParams } from '@/lib/schemas';
import { savedKey, useSaved } from '@/stores/saved';

const PAGE_SIZE = 10;

export function SavedView() {
  const { t, money, num, perKg, date } = useT();
  const items = useSaved((s) => s.items);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const pageItems = items.slice(startIndex, startIndex + PAGE_SIZE);

  // One small request per visible saved item, run in parallel and cached by TanStack Query.
  const results = useQueries({
    queries: pageItems.map((i) =>
      getListPricesQueryOptions({
        state: i.state,
        market: i.market,
        commodity: i.commodity,
        sort: 'price_low',
        pageSize: 1,
      }),
    ),
  });

  return (
    <div>
      <PageHeader title={t('saved.title')} subtitle={t('saved.subtitle')} />

      {items.length === 0 ? (
        <EmptyState title={t('saved.empty')} hint={t('saved.emptyHint')} />
      ) : (
        <div className="flex flex-col gap-6">
          <ul className="grid gap-3 sm:grid-cols-2">
            {pageItems.map((item, idx) => {
              const r = results[idx];
              const latest = r?.data?.items[0];
              return (
                <li key={savedKey(item)} className="flex flex-col rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CropName name={item.commodity} className="text-lg" />
                      <p className="mt-1 text-muted-foreground text-sm">
                        {item.market}, {item.district} ({item.state})
                      </p>
                    </div>
                    <SaveButton {...item} className="-mt-2 -mr-2" />
                  </div>

                  <div className="mt-4 flex flex-1 items-end justify-between gap-3">
                    {r?.isLoading ? (
                      <Skeleton className="h-12 w-40" />
                    ) : latest ? (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          {t('price.modal')}, {date(latest.arrivalDate)}
                        </p>
                        <p className="tabular font-bold font-display text-2xl text-primary">
                          {money(latest.modalPrice)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t('common.perQuintal')}, {perKg(latest.modalPrice)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">{t('saved.noLatest')}</p>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/trend?${toSearchParams({ commodity: item.commodity, state: item.state, district: item.district, market: item.market })}`}
                      >
                        <TrendingUp aria-hidden />
                        {t('nav.trend')}
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 ? (
            <nav className="flex items-center justify-between gap-3 border-t pt-4" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft aria-hidden />
                {t('prices.prev')}
              </Button>
              <span className="text-muted-foreground text-sm">
                {t('prices.page', { page: num(page), total: num(totalPages) })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                {t('prices.next')}
                <ChevronRight aria-hidden />
              </Button>
            </nav>
          ) : null}
        </div>
      )}
    </div>
  );
}
