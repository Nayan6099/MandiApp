'use client';

import Link from 'next/link';
import { useT } from '@/i18n/use-t';
import { SyncBadge } from './sync-badge';

export function SiteFooter() {
  const { t } = useT();
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-muted-foreground text-sm md:flex-row md:items-center md:justify-between">
        <p className="max-w-prose">{t('footer.source')}</p>
        <div className="flex items-center gap-4">
          <SyncBadge />
          <Link href="/about" className="underline-offset-4 hover:text-foreground hover:underline md:hidden">
            {t('nav.about')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
