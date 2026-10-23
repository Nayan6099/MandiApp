'use client';

import type { PriceDto } from '@/api/generated/model';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n/use-t';
import { CropName } from './crop-name';
import { SaveButton } from './save-button';

/**
 * Responsive price list:
 * - phone: one card per price (big usual price, range under it)
 * - tablet/desktop: a proper table with aligned number columns
 */
export function PriceList({ items, showDate = false }: { items: PriceDto[]; showDate?: boolean }) {
  const { t, money, perKg, date } = useT();

  return (
    <>
      {/* Phone */}
      <ul className="flex flex-col gap-2 md:hidden">
        {items.map((p) => (
          <li key={p.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <CropName name={p.commodity} className="text-lg" />
              <SaveButton {...p} className="-mt-2 -mr-2" />
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              {p.market}, {p.district} ({p.state})
            </p>
            {p.variety ? (
              <p className="text-muted-foreground text-xs">
                {t('common.variety')}: {p.variety}
              </p>
            ) : null}
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-xs">{t('price.modal')}</p>
                <p className="tabular font-bold font-display text-2xl text-primary">{money(p.modalPrice)}</p>
                <p className="text-muted-foreground text-xs">
                  {t('common.perQuintal')}, {perKg(p.modalPrice)}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground text-xs">{t('price.range')}</p>
                <p className="tabular">
                  {money(p.minPrice)} – {money(p.maxPrice)}
                </p>
                {showDate ? <p className="text-muted-foreground text-xs">{date(p.arrivalDate)}</p> : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet / desktop */}
      <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                {t('common.commodity')}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t('common.market')}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                {t('price.min')}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                {t('price.max')}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                {t('price.modal')}
              </th>
              <th scope="col" className="w-12 px-2 py-3">
                <span className="sr-only">{t('saved.save')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t align-top transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <CropName name={p.commodity} />
                  {p.variety ? (
                    <span className="block text-muted-foreground text-xs">{p.variety}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{p.market}</span>
                  <span className="block text-muted-foreground text-xs">
                    {p.district}, {p.state}
                    {showDate ? `, ${date(p.arrivalDate)}` : ''}
                  </span>
                </td>
                <td className="tabular px-4 py-3 text-right">{money(p.minPrice)}</td>
                <td className="tabular px-4 py-3 text-right">{money(p.maxPrice)}</td>
                <td className="px-4 py-3 text-right">
                  <span className="tabular font-bold text-base text-primary">{money(p.modalPrice)}</span>
                  <span className="block text-muted-foreground text-xs">{perKg(p.modalPrice)}</span>
                </td>
                <td className="px-2 py-2">
                  <SaveButton {...p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function PriceListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
        <Skeleton key={i} className="h-24 w-full md:h-14" />
      ))}
    </div>
  );
}
