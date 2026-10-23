'use client';

import { useCallback } from 'react';
import { usePreferences } from '@/stores/preferences';
import { localCropName } from './commodities';
import { DICTIONARIES, intlLocale, type Locale } from './config';
import type { Dictionary } from './locales/en';

/** All dotted keys of the dictionary, e.g. "home.title". Typos become type errors. */
type Paths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];
export type TKey = Paths<Dictionary>;

type Vars = Record<string, string | number>;

function lookup(dict: Dictionary, key: TKey): string {
  let node: unknown = dict;
  for (const part of key.split('.')) node = (node as Record<string, unknown>)?.[part];
  return typeof node === 'string' ? node : key;
}

const fill = (s: string, vars?: Vars) =>
  vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : s;

/** Latin digits everywhere so prices look the same in every language. */
const nfmt = (locale: Locale, opts?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(`${intlLocale(locale)}-u-nu-latn`, opts);

/** Month names for languages some browsers ship without date data (e.g. Punjabi in Chrome). */
const MONTHS: Partial<Record<Locale, string[]>> = {
  pa: ['ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ'],
};

function fallbackDate(locale: Locale, d: Date, opts: Intl.DateTimeFormatOptions): string {
  const months = MONTHS[locale];
  if (!months) return new Intl.DateTimeFormat('en-IN', opts).format(d);
  const parts: string[] = [];
  if (opts.day) parts.push(String(d.getDate()));
  if (opts.month) parts.push(months[d.getMonth()]);
  if (opts.year) parts.push(String(d.getFullYear()));
  let out = parts.join(' ');
  if (opts.hour) {
    out += `, ${new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(d)}`;
  }
  return out;
}

export function useT() {
  const locale = usePreferences((s) => s.locale);
  const dict = DICTIONARIES[locale];

  const t = useCallback((key: TKey, vars?: Vars) => fill(lookup(dict, key), vars), [dict]);

  const money = useCallback(
    (n: number) => nfmt(locale, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n),
    [locale],
  );

  const num = useCallback((n: number) => nfmt(locale).format(n), [locale]);

  const perKg = useCallback(
    (perQuintal: number) =>
      fill(dict.common.perKg, { price: nfmt(locale, { maximumFractionDigits: 1 }).format(perQuintal / 100) }),
    [dict, locale],
  );

  const date = useCallback(
    (
      iso: string | null | undefined,
      opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
    ) => {
      if (!iso) return '';
      const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
      const tag = intlLocale(locale);
      const out = new Intl.DateTimeFormat(`${tag}-u-nu-latn`, opts).format(d);
      // Some browsers lack month names for a language and print "M10" instead.
      return /\bM\d{1,2}\b/.test(out) ? fallbackDate(locale, d, opts) : out;
    },
    [locale],
  );

  /** Local crop name if we know it; null otherwise. */
  const crop = useCallback((english: string) => localCropName(english, locale), [locale]);

  return { t, locale, money, num, perKg, date, crop };
}
