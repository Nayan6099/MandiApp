'use client';

import { useT } from '@/i18n/use-t';

/** Keyboard users can jump past the header straight to the page content. */
export function SkipLink() {
  const { t } = useT();
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      {t('common.skip')}
    </a>
  );
}
