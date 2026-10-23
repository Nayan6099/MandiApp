'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useEffect, useState } from 'react';
import { ApiError } from '@/api/fetcher';
import { usePreferences } from '@/stores/preferences';
import { useSaved } from '@/stores/saved';

/** Keeps <html lang> in sync with the chosen language (screen readers + correct fonts). */
function HtmlLang() {
  const locale = usePreferences((s) => s.locale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  // One QueryClient per browser tab (useState keeps it stable across re-renders).
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000, // mandi data changes a few times a day
            gcTime: 30 * 60_000,
            refetchOnWindowFocus: false,
            retry: (count, err) =>
              // don't retry bad requests (4xx), retry network/server errors twice
              !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
          },
        },
      }),
  );

  // Load saved language + favourites from localStorage after the first render
  // (doing it during render would make server and browser HTML differ).
  useEffect(() => {
    void usePreferences.persist.rehydrate();
    void useSaved.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={client}>
      <HtmlLang />
      {children}
    </QueryClientProvider>
  );
}
