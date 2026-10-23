'use client';

import Link from 'next/link';
import { useGetOverview, useGetPopularCommodities } from '@/api/generated/endpoints/stats/stats';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n/use-t';

/**
 * The signature element: a mandi "rate board". Deep green slate,
 * crop names on the left, today's average usual price in mustard on the right.
 */
export function BhavBoard() {
  const { t, money, num, date, crop, locale } = useT();
  const popular = useGetPopularCommodities({ limit: 7 });
  const overview = useGetOverview();
  const items = popular.data?.items ?? [];

  return (
    <section
      aria-labelledby="board-title"
      className="bhav-board relative overflow-hidden rounded-xl p-5 text-primary-foreground shadow-lg sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="board-title" className="font-bold text-2xl text-accent">
          {t('home.boardTitle')}
        </h2>
        {popular.data?.date ? (
          <span className="text-primary-foreground/70 text-sm">{date(popular.data.date)}</span>
        ) : null}
      </div>
      <p className="mt-1 text-primary-foreground/70 text-xs">{t('home.boardNote')}</p>

      <ul className="mt-4">
        {popular.isLoading
          ? Array.from({ length: 6 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
              <li key={i} className="flex h-12 items-center justify-between">
                <Skeleton className="h-5 w-32 bg-white/10" />
                <Skeleton className="h-6 w-20 bg-white/10" />
              </li>
            ))
          : items.map((it) => {
              const local = crop(it.commodity);
              return (
                <li key={it.commodity}>
                  <Link
                    href={`/compare?commodity=${encodeURIComponent(it.commodity)}`}
                    className="-mx-2 flex h-12 items-center justify-between gap-4 rounded-md px-2 transition-colors hover:bg-white/5"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-medium" lang={local ? locale : 'en'}>
                        {local ?? it.commodity}
                      </span>
                      {local ? (
                        <span className="ml-2 text-primary-foreground/55 text-xs">{it.commodity}</span>
                      ) : null}
                    </span>
                    <span className="tabular shrink-0 font-bold font-display text-2xl text-accent">
                      {money(it.avgModalPrice)}
                    </span>
                  </Link>
                </li>
              );
            })}
      </ul>

      {overview.data?.latestDate ? (
        <dl className="relative -mx-5 -mb-5 mt-4 grid grid-cols-3 gap-2 border-white/15 border-t bg-primary-deep px-5 pt-4 pb-5 text-center sm:-mx-6 sm:-mb-6 sm:px-6 sm:pb-6">
          <div>
            <dt className="text-primary-foreground/65 text-xs">{t('home.statMandis')}</dt>
            <dd className="tabular font-bold text-xl">{num(overview.data.markets)}</dd>
          </div>
          <div>
            <dt className="text-primary-foreground/65 text-xs">{t('home.statCrops')}</dt>
            <dd className="tabular font-bold text-xl">{num(overview.data.commodities)}</dd>
          </div>
          <div>
            <dt className="text-primary-foreground/65 text-xs">{t('home.statStates')}</dt>
            <dd className="tabular font-bold text-xl">{num(overview.data.states)}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
