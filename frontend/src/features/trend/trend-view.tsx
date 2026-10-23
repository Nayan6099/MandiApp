'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useGetPriceTrend } from '@/api/generated/endpoints/prices/prices';
import { CropName } from '@/components/crop-name';
import { CropField, LocationFields } from '@/components/location-fields';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/state-message';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useUrlFormSync } from '@/hooks/use-url-form-sync';
import { useT } from '@/i18n/use-t';
import { TREND_DAYS, type TrendInput, trendSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { TrendChart } from './trend-chart';

export function TrendView() {
  const { t, num } = useT();
  const params = useSearchParams();
  const daysParam = Number(params.get('days'));

  const form = useForm<TrendInput>({
    resolver: zodResolver(trendSchema),
    defaultValues: {
      commodity: params.get('commodity') ?? '',
      state: params.get('state') ?? undefined,
      district: params.get('district') ?? undefined,
      market: params.get('market') ?? undefined,
      days: (TREND_DAYS as readonly number[]).includes(daysParam) ? (daysParam as 7 | 30 | 90) : 30,
    },
  });
  const v = useWatch({ control: form.control });
  const commodity = v.commodity?.trim() ?? '';
  const days = v.days ?? 30;
  useUrlFormSync({
    commodity,
    state: v.state,
    district: v.district,
    market: v.market,
    days: days === 30 ? undefined : days,
  });

  const query = useGetPriceTrend(
    { commodity, state: v.state, district: v.district, market: v.market, days },
    { query: { enabled: commodity.length > 0 } },
  );
  const data = query.data;
  const change = data?.changePercent;

  return (
    <div>
      <PageHeader title={t('trend.title')} subtitle={t('trend.subtitle')} />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <CropField
            control={form.control}
            name="commodity"
            place={{ state: v.state, district: v.district, market: v.market }}
            required
          />
          <div className="flex flex-col gap-1.5">
            <Label id="days-label">{t('trend.period')}</Label>
            <Controller
              control={form.control}
              name="days"
              render={({ field }) => (
                <ToggleGroup
                  type="single"
                  aria-labelledby="days-label"
                  value={String(field.value ?? 30)}
                  onValueChange={(val) => {
                    if (val) field.onChange(Number(val));
                  }}
                  className="h-11 w-full"
                >
                  {TREND_DAYS.map((d) => (
                    <ToggleGroupItem key={d} value={String(d)} className="h-9 flex-1">
                      {t('trend.days', { days: d })}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
            />
          </div>
        </div>
        <LocationFields control={form.control} setValue={form.setValue} />
      </form>

      <div className="mt-6">
        {!commodity ? (
          <EmptyState title={t('trend.pick')} />
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : query.isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : !data || data.points.length < 2 ? (
          <EmptyState title={t('trend.empty')} />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <CropName name={data.commodity} className="font-display text-2xl" />
              {change !== null && change !== undefined ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium text-sm',
                    change > 0.5 && 'border-up/30 bg-up/5 text-up',
                    change < -0.5 && 'border-down/30 bg-down/5 text-down',
                  )}
                >
                  {change > 0.5 ? (
                    <ArrowUpRight className="size-4" aria-hidden />
                  ) : change < -0.5 ? (
                    <ArrowDownRight className="size-4" aria-hidden />
                  ) : (
                    <ArrowRight className="size-4" aria-hidden />
                  )}
                  {change > 0.5
                    ? t('trend.up', { pct: num(change), days })
                    : change < -0.5
                      ? t('trend.down', { pct: num(Math.abs(change)), days })
                      : t('trend.steady', { days })}
                </span>
              ) : null}
            </div>
            <TrendChart points={data.points} />
          </>
        )}
      </div>
    </div>
  );
}
