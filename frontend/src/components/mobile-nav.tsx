'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/i18n/use-t';
import { cn } from '@/lib/utils';
import { isActive, NAV_ITEMS } from './nav-items';

/** Bottom tab bar on phones: big touch targets, icon + label. */
export function MobileNav() {
  const { t } = useT();
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] text-muted-foreground leading-tight',
                  active && 'font-semibold text-primary',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                    active && 'bg-secondary',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="max-w-full truncate">{t(label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
