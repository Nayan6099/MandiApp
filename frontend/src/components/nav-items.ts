import { BarChart3, Home, Star, Tags, TrendingUp } from 'lucide-react';
import type { TKey } from '@/i18n/use-t';

/** Same 5 destinations on desktop (top bar) and phone (bottom bar). */
export const NAV_ITEMS = [
  { href: '/', label: 'nav.home', icon: Home },
  { href: '/prices', label: 'nav.prices', icon: Tags },
  { href: '/compare', label: 'nav.compare', icon: BarChart3 },
  { href: '/trend', label: 'nav.trend', icon: TrendingUp },
  { href: '/saved', label: 'nav.saved', icon: Star },
] as const satisfies readonly { href: string; label: TKey; icon: unknown }[];

export const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);
