import type { MandiPrice } from '../prices/mandi-price.entity.js';
import type { DataGovRecord } from './data-gov.client.js';

export type NormalizedPrice = Pick<
  MandiPrice,
  | 'state'
  | 'district'
  | 'market'
  | 'commodity'
  | 'variety'
  | 'grade'
  | 'arrivalDate'
  | 'minPrice'
  | 'maxPrice'
  | 'modalPrice'
>;

const clean = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const toPrice = (v: unknown): number | null => {
  const n = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** Accepts "23/10/2026", "23-10-2026" or "2026-10-23" and returns "2026-10-23". */
export function toIsoDate(v: unknown): string | null {
  const s = String(v ?? '').trim();
  let y: number;
  let m: number;
  let d: number;
  let match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(s);
  if (match) {
    [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
    if (!match) return null;
    [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null; // e.g. 31/02/2026
  }
  return date.toISOString().slice(0, 10);
}

/** Turns one raw API record into a clean DB row. Returns null for broken records. */
export function normalizeRecord(r: DataGovRecord): NormalizedPrice | null {
  const state = clean(r.state, 100);
  const district = clean(r.district, 100);
  const market = clean(r.market, 150);
  const commodity = clean(r.commodity, 150);
  const arrivalDate = toIsoDate(r.arrival_date);
  const minPrice = toPrice(r.min_price);
  const maxPrice = toPrice(r.max_price);
  const modalPrice = toPrice(r.modal_price);

  if (!state || !market || !commodity || !arrivalDate) return null;
  if (minPrice === null || maxPrice === null || modalPrice === null) return null;
  if (modalPrice === 0) return null; // 0 = no trade that day

  return {
    state,
    district,
    market,
    commodity,
    variety: clean(r.variety, 150),
    grade: clean(r.grade, 50),
    arrivalDate,
    minPrice,
    maxPrice,
    modalPrice,
  };
}
