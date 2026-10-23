'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/i18n/use-t';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { isActive, NAV_ITEMS } from './nav-items';

export function SiteHeader() {
  const { t } = useT();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5 rounded-md" aria-label={t('app.name')}>
          <Logo className="size-9" />
          <span className="font-display font-semibold text-primary text-xl leading-none">
            {t('app.name')}
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground',
                isActive(pathname, item.href) && 'bg-secondary text-secondary-foreground',
              )}
            >
              {t(item.label)}
            </Link>
          ))}
          <Link
            href="/about"
            aria-current={isActive(pathname, '/about') ? 'page' : undefined}
            className={cn(
              'rounded-md px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground',
              isActive(pathname, '/about') && 'bg-secondary text-secondary-foreground',
            )}
          >
            {t('nav.about')}
          </Link>
        </nav>

        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
