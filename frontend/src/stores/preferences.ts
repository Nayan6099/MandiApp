'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';

/**
 * Client state that should survive a page refresh (saved in localStorage):
 * the chosen language and the user's home state.
 */
interface PreferencesState {
  locale: Locale;
  homeState: string | null;
  setLocale: (locale: Locale) => void;
  setHomeState: (state: string | null) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      homeState: null,
      setLocale: (locale) => set({ locale }),
      setHomeState: (homeState) => set({ homeState }),
    }),
    {
      name: 'mandi-bhav:prefs',
      version: 1,
      skipHydration: true, // rehydrated in <Providers> after mount
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
