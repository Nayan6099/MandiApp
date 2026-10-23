import { z } from 'zod';

/** Empty strings from inputs become "not set". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const SORTS = ['commodity', 'market', 'price_low', 'price_high'] as const;

export const pricesFilterSchema = z.object({
  state: optionalText(100),
  district: optionalText(100),
  market: optionalText(150),
  commodity: optionalText(150),
  q: optionalText(60),
  sort: z.enum(SORTS).default('commodity'),
});
export type PricesFilterInput = z.input<typeof pricesFilterSchema>;
export type PricesFilter = z.output<typeof pricesFilterSchema>;

export const compareSchema = z.object({
  commodity: z.string().trim().min(1).max(150),
  state: optionalText(100),
});
export type CompareInput = z.input<typeof compareSchema>;

export const TREND_DAYS = [7, 30, 90] as const;

export const trendSchema = z.object({
  commodity: z.string().trim().min(1).max(150),
  state: optionalText(100),
  district: optionalText(100),
  market: optionalText(150),
  days: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30),
});
export type TrendInput = z.input<typeof trendSchema>;

/** Read a filter object from the URL (?state=..&commodity=..). Invalid values are dropped. */
export function parseSearchParams<S extends z.ZodType>(schema: S, params: URLSearchParams) {
  const raw = Object.fromEntries(params.entries());
  const res = schema.safeParse(raw);
  return res.success ? res.data : schema.safeParse({}).data;
}

/** Write a filter object back to a query string, skipping empty values. */
export function toSearchParams(values: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  return sp.toString();
}
