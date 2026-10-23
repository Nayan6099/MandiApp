'use client';

import { useQueries } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
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

export function SavedView() {
  const { t, money, perKg, date } = useT();
  const items = useSaved((s) => s.items);

  // One small request per saved item, run in parallel and cached by TanStack Query.
  const results = useQueries({
    queries: items.map((i) =>
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
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item, idx) => {
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
      )}
    </div>
  );
}
