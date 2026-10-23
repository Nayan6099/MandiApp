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
          <p className="mt-2">{t('about.units')}</p>
          <p className="mt-2">{t('about.modal')}</p>
        </section>
        <p className="rounded-lg border-accent border-l-4 bg-card p-4 text-muted-foreground text-sm">
          {t('about.note')}
        </p>
      </div>
    </div>
  );
}
