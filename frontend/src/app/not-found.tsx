'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';

export default function NotFound() {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="font-bold font-display text-6xl text-accent-ink">404</p>
      <h1 className="font-bold text-2xl">{t('common.notFound')}</h1>
      <Button asChild>
        <Link href="/">{t('common.goHome')}</Link>
      </Button>
    </div>
  );
}
