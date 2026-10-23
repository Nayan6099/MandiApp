'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toSearchParams } from '@/lib/schemas';

/** Keeps the address bar in sync with a form, so the current view can be shared or bookmarked. */
export function useUrlFormSync(values: Record<string, unknown>, enabled = true) {
  const router = useRouter();
  const pathname = usePathname();
  const qs = toSearchParams(values);

  useEffect(() => {
    if (!enabled) return;
    const current = window.location.search.replace(/^\?/, '');
    if (qs !== current) router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [qs, enabled, pathname, router]);
}
