'use client';

import { PageHeader } from '@/components/page-header';
import { useT } from '@/i18n/use-t';

export function AboutView() {
  const { t } = useT();
  return (
    <div className="max-w-2xl">
      <PageHeader title={t('about.title')} subtitle={t('about.what')} />
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="font-bold text-xl">{t('about.sourceTitle')}</h2>
          <p className="mt-2">{t('about.source')}</p>
          <p className="mt-2">
            <a
              href="https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-4"
            >
              data.gov.in
            </a>
            {' / '}
            <a
              href="https://agmarknet.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-4"
            >
              agmarknet.gov.in
            </a>
          </p>
        </section>
        <section>
          <h2 className="font-bold text-xl">{t('about.unitsTitle')}</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">{t('about.units')}</p>
          <p className="mt-2 text-muted-foreground leading-relaxed">{t('about.modal')}</p>
        </section>

        <section>
          <h2 className="font-bold text-xl">Frequently Asked Questions</h2>
          <dl className="mt-4 flex flex-col gap-4">
            <div className="rounded-xl border bg-card p-4">
              <dt className="font-semibold text-foreground">What is an APMC Mandi?</dt>
              <dd className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                Agricultural Produce Market Committees (APMCs) are marketing boards established by state
                governments across India to regulate trading and ensure farmers receive fair wholesale prices
                without middleman exploitation.
              </dd>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <dt className="font-semibold text-foreground">What is the Modal Price?</dt>
              <dd className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                The modal price is the most frequently transacted rate for a commodity on that market day.
                While minimum and maximum prices represent the trading boundaries, the modal price reflects
                what the majority of buyers and sellers actually paid.
              </dd>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <dt className="font-semibold text-foreground">Why do crop prices vary across mandis?</dt>
              <dd className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                Prices fluctuate based on daily supply arrivals, transportation costs, regional demand, crop
                moisture content, variety, and grading standards. Comparing mandis helps farmers identify the
                most profitable market before dispatching produce.
              </dd>
            </div>
          </dl>
        </section>

        <p className="rounded-lg border-accent border-l-4 bg-card p-4 text-muted-foreground text-sm">
          {t('about.note')}
        </p>
      </div>
    </div>
  );
}
