'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart3, ChevronRight, Search, Tags, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGetOverview, useGetPopularCommodities } from '@/api/generated/endpoints/stats/stats';
import { useCropLabel } from '@/components/crop-name';
import { CropField } from '@/components/location-fields';
import { EmptyState, ErrorState } from '@/components/state-message';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import { BhavBoard } from './bhav-board';

const findSchema = z.object({ commodity: z.string().min(1) });
type FindInput = z.infer<typeof findSchema>;

export function HomeView() {
  const { t } = useT();
  const router = useRouter();
  const label = useCropLabel();
  const overview = useGetOverview();
  const popular = useGetPopularCommodities({ limit: 8 });

  const form = useForm<FindInput>({ resolver: zodResolver(findSchema) });
  const onSubmit = form.handleSubmit(({ commodity }) =>
    router.push(`/prices?commodity=${encodeURIComponent(commodity)}`),
  );

  const actions = [
    { href: '/prices', icon: Tags, title: t('home.pricesTitle'), desc: t('home.pricesDesc') },
    { href: '/compare', icon: BarChart3, title: t('home.compareTitle'), desc: t('home.compareDesc') },
    { href: '/trend', icon: TrendingUp, title: t('home.trendTitle'), desc: t('home.trendDesc') },
  ];

  const noData = overview.data && overview.data.totalRecords === 0;

  return (
    <div className="flex flex-col gap-12 pt-8 md:pt-14">
      <section className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-bold text-4xl text-primary leading-[1.1] sm:text-5xl">{t('home.title')}</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t('home.subtitle')}</p>
          </div>

          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:p-5"
          >
            <p className="font-medium font-display text-lg">{t('home.findLabel')}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <CropField
                  control={form.control}
                  name="commodity"
                  required
                  invalid={!!form.formState.errors.commodity}
                />
              </div>
              <Button type="submit" size="lg" className="h-11">
                <Search aria-hidden />
                {t('home.findButton')}
              </Button>
            </div>
            {popular.data?.items.length ? (
              <ul className="flex flex-wrap gap-2 pt-1">
                {popular.data.items.map((p) => (
                  <li key={p.commodity}>
                    <Link
                      href={`/prices?commodity=${encodeURIComponent(p.commodity)}`}
                      className="inline-flex h-9 items-center rounded-full border bg-background px-3 text-sm transition-colors hover:border-primary hover:text-primary"
                    >
                      {label(p.commodity)}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>
        </div>

        {overview.isError ? (
          <ErrorState onRetry={() => void overview.refetch()} />
        ) : noData ? (
          <EmptyState title={t('home.emptyTitle')} hint={t('home.emptyDesc')} />
        ) : (
          <BhavBoard />
        )}
      </section>

      <section aria-labelledby="do-title">
        <h2 id="do-title" className="mb-4 font-bold text-2xl">
          {t('home.doTitle')}
        </h2>
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {actions.map(({ href, icon: Icon, title, desc }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50 sm:px-6"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display font-semibold text-lg">{title}</span>
                  <span className="block text-muted-foreground text-sm">{desc}</span>
                </span>
                <ChevronRight
                  className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="info-title" className="rounded-xl border bg-card p-6 shadow-xs">
        <h2 id="info-title" className="font-bold font-display text-xl sm:text-2xl">
          Reliable Wholesale Mandi Prices Across India
        </h2>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
          Mandi Bhav aggregates daily agricultural market rates across hundreds of APMC mandis in India.
          Whether you are tracking seasonal arrivals for cash crops like wheat, soybean, and mustard, or daily
          essential produce like onions, potatoes, and tomatoes, our platform keeps farmers, traders, and
          consumers updated with government-verified modal rates, minimum and maximum trade ranges, and
          multi-lingual transparency in 6 Indian languages.
        </p>
      </section>
    </div>
  );
}
