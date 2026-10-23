'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** A saved "watch": one crop in one mandi. */
export interface SavedItem {
  commodity: string;
  market: string;
  district: string;
  state: string;
  savedAt: number;
}

export const savedKey = (i: Pick<SavedItem, 'commodity' | 'market' | 'state'>) =>
  `${i.state}|${i.market}|${i.commodity}`;

interface SavedState {
  items: SavedItem[];
  toggle: (item: Omit<SavedItem, 'savedAt'>) => void;
  remove: (key: string) => void;
}

const MAX_SAVED = 50;

export const useSaved = create<SavedState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (item) =>
        set((s) => {
          const key = savedKey(item);
          if (s.items.some((i) => savedKey(i) === key)) {
            return { items: s.items.filter((i) => savedKey(i) !== key) };
          }
          return { items: [{ ...item, savedAt: Date.now() }, ...s.items].slice(0, MAX_SAVED) };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => savedKey(i) !== key) })),
    }),
    {
      name: 'mandi-bhav:saved',
      version: 1,
      skipHydration: true, // rehydrated in <Providers> after mount
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
