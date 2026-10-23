import { describe, expect, it } from 'vitest';
import { normalizeRecord, toIsoDate } from './normalize.js';

describe('toIsoDate', () => {
  it('reads dd/mm/yyyy (data.gov.in format)', () => {
    expect(toIsoDate('23/10/2026')).toBe('2026-10-23');
    expect(toIsoDate('3/1/2026')).toBe('2026-01-03');
  });
  it('reads yyyy-mm-dd', () => {
    expect(toIsoDate('2026-10-23')).toBe('2026-10-23');
  });
  it('rejects impossible dates', () => {
    expect(toIsoDate('31/02/2026')).toBeNull();
    expect(toIsoDate('abc')).toBeNull();
    expect(toIsoDate(undefined)).toBeNull();
  });
});

describe('normalizeRecord', () => {
  const raw = {
    state: ' Uttar Pradesh ',
    district: 'Ghaziabad',
    market: 'Ghaziabad  APMC',
    commodity: 'Onion',
    variety: 'Red',
    grade: 'FAQ',
    arrival_date: '23/10/2026',
    min_price: '2000',
    max_price: '2,600',
    modal_price: 2400,
  };

  it('cleans spaces, parses numbers and dates', () => {
    expect(normalizeRecord(raw)).toEqual({
      state: 'Uttar Pradesh',
      district: 'Ghaziabad',
      market: 'Ghaziabad APMC',
      commodity: 'Onion',
      variety: 'Red',
      grade: 'FAQ',
      arrivalDate: '2026-10-23',
      minPrice: 2000,
      maxPrice: 2600,
      modalPrice: 2400,
    });
  });

  it('drops records with missing or zero prices', () => {
    expect(normalizeRecord({ ...raw, modal_price: '0' })).toBeNull();
    expect(normalizeRecord({ ...raw, min_price: 'NR' })).toBeNull();
    expect(normalizeRecord({ ...raw, commodity: '' })).toBeNull();
  });
});
