'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TrendPointDto } from '@/api/generated/model';
import { useT } from '@/i18n/use-t';

const LINE = 'var(--primary)';
const GRID = 'var(--border)';
const AXIS_TEXT = 'var(--muted-foreground)';

type Row = TrendPointDto & { range: [number, number] };

/**
 * One series (usual price) as a 2px line, with the lowest–highest range as a light wash.
 * Hover shows a crosshair + tooltip; the last point is labelled directly.
 */
export function TrendChart({ points }: { points: TrendPointDto[] }) {
  const { t, money, date } = useT();
  const rows: Row[] = points.map((p) => ({ ...p, range: [p.minPrice, p.maxPrice] }));
  const last = rows.at(-1);
  const compact = (n: number) => `₹${n >= 1000 ? `${Math.round(n / 100) / 10}k` : n}`;

  return (
    <figure className="rounded-xl border bg-card p-3 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-muted-foreground text-xs">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-5 rounded bg-primary" aria-hidden />
          {t('trend.chartModal')}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-5 rounded-sm bg-primary/10" aria-hidden />
          {t('trend.chartRange')}
        </span>
        <span>₹ {t('common.perQuintal')}</span>
      </figcaption>

      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 12, right: 64, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => date(d, { day: 'numeric', month: 'short' })}
              tick={{ fill: AXIS_TEXT, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              minTickGap={24}
            />
            <YAxis
              tickFormatter={compact}
              tick={{ fill: AXIS_TEXT, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={52}
              domain={['auto', 'auto']}
            />
            <Tooltip
              cursor={{ stroke: AXIS_TEXT, strokeWidth: 1 }}
              content={(props: TooltipContentProps<ValueType, NameType>) => {
                const row = props.payload?.[0]?.payload as Row | undefined;
                if (!props.active || !row) return null;
                return (
                  <div className="rounded-md border bg-popover px-3 py-2 text-popover-foreground text-sm shadow-md">
                    <p className="font-medium">{date(row.date)}</p>
                    <p className="tabular mt-1">
                      {t('price.modal')}: <strong>{money(row.modalPrice)}</strong>
                    </p>
                    <p className="tabular text-muted-foreground text-xs">
                      {money(row.minPrice)} – {money(row.maxPrice)}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="range"
              stroke="none"
              fill={LINE}
              fillOpacity={0.1}
              isAnimationActive={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="modalPrice"
              stroke={LINE}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              activeDot={{ r: 5, fill: LINE, stroke: 'var(--card)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {last ? (
              <ReferenceDot
                x={last.date}
                y={last.modalPrice}
                r={4}
                fill={LINE}
                stroke="var(--card)"
                strokeWidth={2}
                label={{
                  value: money(last.modalPrice),
                  position: 'right',
                  fill: 'var(--foreground)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Same numbers as a table, for screen readers and anyone who prefers figures */}
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted-foreground">{t('common.table')}</summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-left">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-1 pr-3 font-medium">{t('common.date')}</th>
                <th className="py-1 pr-3 text-right font-medium">{t('price.modal')}</th>
                <th className="py-1 text-right font-medium">{t('price.range')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date} className="border-t">
                  <td className="py-1 pr-3">{date(r.date)}</td>
                  <td className="tabular py-1 pr-3 text-right">{money(r.modalPrice)}</td>
                  <td className="tabular py-1 text-right">
                    {money(r.minPrice)} – {money(r.maxPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
