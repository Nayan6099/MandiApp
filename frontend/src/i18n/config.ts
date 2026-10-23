import { bn } from './locales/bn';
import { type Dictionary, en } from './locales/en';
import { gu } from './locales/gu';
import { hi } from './locales/hi';
import { mr } from './locales/mr';
import { pa } from './locales/pa';

export const LOCALES = [
  { code: 'en', native: 'English', intl: 'en-IN' },
  { code: 'hi', native: 'हिन्दी', intl: 'hi-IN' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', intl: 'pa-IN' },
  { code: 'mr', native: 'मराठी', intl: 'mr-IN' },
  { code: 'gu', native: 'ગુજરાતી', intl: 'gu-IN' },
  { code: 'bn', native: 'বাংলা', intl: 'bn-IN' },
] as const;

export type Locale = (typeof LOCALES)[number]['code'];
export const DEFAULT_LOCALE: Locale = 'en';

export const DICTIONARIES: Record<Locale, Dictionary> = { en, hi, pa, mr, gu, bn };

export const isLocale = (v: unknown): v is Locale => LOCALES.some((l) => l.code === v);

export const intlLocale = (l: Locale) => LOCALES.find((x) => x.code === l)?.intl ?? 'en-IN';
