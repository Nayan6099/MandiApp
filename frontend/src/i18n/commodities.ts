import type { Locale } from './config';

/**
 * Local names for common crops. Keys are the exact AGMARKNET names (lower-case).
 * The original English name is always shown next to the local one,
 * so a missing or imperfect translation never hides the real data.
 */
type Names = Record<Exclude<Locale, 'en'>, string>;

const NAMES: Record<string, Names> = {
  onion: { hi: 'प्याज', pa: 'ਪਿਆਜ਼', mr: 'कांदा', gu: 'ડુંગળી', bn: 'পেঁয়াজ' },
  potato: { hi: 'आलू', pa: 'ਆਲੂ', mr: 'बटाटा', gu: 'બટાકા', bn: 'আলু' },
  tomato: { hi: 'टमाटर', pa: 'ਟਮਾਟਰ', mr: 'टोमॅटो', gu: 'ટામેટા', bn: 'টমেটো' },
  wheat: { hi: 'गेहूं', pa: 'ਕਣਕ', mr: 'गहू', gu: 'ઘઉં', bn: 'গম' },
  'paddy(dhan)(common)': { hi: 'धान', pa: 'ਝੋਨਾ', mr: 'भात (धान)', gu: 'ડાંગર', bn: 'ধান' },
  rice: { hi: 'चावल', pa: 'ਚੌਲ', mr: 'तांदूळ', gu: 'ચોખા', bn: 'চাল' },
  maize: { hi: 'मक्का', pa: 'ਮੱਕੀ', mr: 'मका', gu: 'મકાઈ', bn: 'ভুট্টা' },
  'bajra(pearl millet/cumbu)': { hi: 'बाजरा', pa: 'ਬਾਜਰਾ', mr: 'बाजरी', gu: 'બાજરી', bn: 'বাজরা' },
  'jowar(sorghum)': { hi: 'ज्वार', pa: 'ਜਵਾਰ', mr: 'ज्वारी', gu: 'જુવાર', bn: 'জোয়ার' },
  cotton: { hi: 'कपास', pa: 'ਕਪਾਹ', mr: 'कापूस', gu: 'કપાસ', bn: 'তুলা' },
  mustard: { hi: 'सरसों', pa: 'ਸਰ੍ਹੋਂ', mr: 'मोहरी', gu: 'રાઈ', bn: 'সরিষা' },
  soyabean: { hi: 'सोयाबीन', pa: 'ਸੋਇਆਬੀਨ', mr: 'सोयाबीन', gu: 'સોયાબીન', bn: 'সয়াবিন' },
  groundnut: { hi: 'मूंगफली', pa: 'ਮੂੰਗਫਲੀ', mr: 'भुईमूग', gu: 'મગફળી', bn: 'চিনাবাদাম' },
  garlic: { hi: 'लहसुन', pa: 'ਲਸਣ', mr: 'लसूण', gu: 'લસણ', bn: 'রসুন' },
  'ginger(green)': { hi: 'अदरक', pa: 'ਅਦਰਕ', mr: 'आले', gu: 'આદુ', bn: 'আদা' },
  'green chilli': { hi: 'हरी मिर्च', pa: 'ਹਰੀ ਮਿਰਚ', mr: 'हिरवी मिरची', gu: 'લીલા મરચાં', bn: 'কাঁচা লঙ্কা' },
  cauliflower: { hi: 'फूलगोभी', pa: 'ਫੁੱਲ ਗੋਭੀ', mr: 'फुलकोबी', gu: 'ફુલાવર', bn: 'ফুলকপি' },
  cabbage: { hi: 'पत्तागोभी', pa: 'ਬੰਦ ਗੋਭੀ', mr: 'कोबी', gu: 'કોબીજ', bn: 'বাঁধাকপি' },
  brinjal: { hi: 'बैंगन', pa: 'ਬੈਂਗਣ', mr: 'वांगी', gu: 'રીંગણ', bn: 'বেগুন' },
  'bhindi(ladies finger)': { hi: 'भिंडी', pa: 'ਭਿੰਡੀ', mr: 'भेंडी', gu: 'ભીંડા', bn: 'ঢেঁড়স' },
  apple: { hi: 'सेब', pa: 'ਸੇਬ', mr: 'सफरचंद', gu: 'સફરજન', bn: 'আপেল' },
  banana: { hi: 'केला', pa: 'ਕੇਲਾ', mr: 'केळी', gu: 'કેળા', bn: 'কলা' },
  'arhar (tur/red gram)(whole)': { hi: 'अरहर (तूर)', pa: 'ਅਰਹਰ (ਤੂਰ)', mr: 'तूर', gu: 'તુવેર', bn: 'অড়হর (তুর)' },
  'bengal gram(gram)(whole)': { hi: 'चना', pa: 'ਛੋਲੇ', mr: 'हरभरा', gu: 'ચણા', bn: 'ছোলা' },
  lemon: { hi: 'नींबू', pa: 'ਨਿੰਬੂ', mr: 'लिंबू', gu: 'લીંબુ', bn: 'লেবু' },
  'cucumbar(kheera)': { hi: 'खीरा', pa: 'ਖੀਰਾ', mr: 'काकडी', gu: 'કાકડી', bn: 'শসা' },
  carrot: { hi: 'गाजर', pa: 'ਗਾਜਰ', mr: 'गाजर', gu: 'ગાજર', bn: 'গাজর' },
};

/** Returns the local crop name, or null when we don't have one (then show English only). */
export function localCropName(english: string, locale: Locale): string | null {
  if (locale === 'en') return null;
  const key = english.trim().toLowerCase();
  return NAMES[key]?.[locale] ?? null;
}
