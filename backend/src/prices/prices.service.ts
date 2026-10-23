import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import { MandiPrice } from './mandi-price.entity.js';
import type {
  CompareQueryDto,
  CompareResultDto,
  LocationFilterDto,
  OverviewDto,
  PopularQueryDto,
  PopularResultDto,
  PriceDto,
  PricePageDto,
  PriceQueryDto,
  SortOption,
  TrendQueryDto,
  TrendResultDto,
} from './prices.dto.js';

type QB = SelectQueryBuilder<MandiPrice>;

const SORTS: Record<SortOption, [string, 'ASC' | 'DESC'][]> = {
  commodity: [
    ['p.commodity', 'ASC'],
    ['p.modalPrice', 'ASC'],
  ],
  market: [
    ['p.market', 'ASC'],
    ['p.commodity', 'ASC'],
  ],
  price_low: [['p.modalPrice', 'ASC']],
  price_high: [['p.modalPrice', 'DESC']],
};

const round = (n: unknown) => Math.round(Number(n ?? 0));

/** Escape % and _ so user text is matched literally in ILIKE. */
const likeEscape = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

@Injectable()
export class PricesService {
  constructor(@InjectRepository(MandiPrice) private readonly repo: Repository<MandiPrice>) {}

  /* ---------------- filter helpers ---------------- */

  private applyLocation(qb: QB, f: LocationFilterDto & { commodity?: string }): QB {
    if (f.state) qb.andWhere('p.state = :state', { state: f.state });
    if (f.district) qb.andWhere('p.district = :district', { district: f.district });
    if (f.market) qb.andWhere('p.market = :market', { market: f.market });
    if (f.commodity) qb.andWhere('p.commodity = :commodity', { commodity: f.commodity });
    return qb;
  }

  /** Latest day that has data for these filters (data is not published every day). */
  private async latestDate(f: LocationFilterDto & { commodity?: string }): Promise<string | null> {
    const qb = this.applyLocation(this.repo.createQueryBuilder('p'), f).select('MAX(p.arrival_date)', 'max');
    const row = await qb.getRawOne<{ max: string | null }>();
    return row?.max ?? null;
  }

  private toDto(p: MandiPrice): PriceDto {
    return {
      id: String(p.id),
      state: p.state,
      district: p.district,
      market: p.market,
      commodity: p.commodity,
      variety: p.variety,
      grade: p.grade,
      arrivalDate: p.arrivalDate,
      minPrice: Number(p.minPrice),
      maxPrice: Number(p.maxPrice),
      modalPrice: Number(p.modalPrice),
    };
  }

  /* ---------------- endpoints ---------------- */

  async list(q: PriceQueryDto): Promise<PricePageDto> {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const date = q.date ?? (await this.latestDate(q));
    if (!date) return { items: [], total: 0, page, pageSize, totalPages: 0, date: null };

    const qb = this.applyLocation(this.repo.createQueryBuilder('p'), q).andWhere('p.arrival_date = :date', {
      date,
    });
    if (q.q) {
      qb.andWhere("(p.commodity ILIKE :q ESCAPE '\\' OR p.market ILIKE :q ESCAPE '\\')", {
        q: `%${likeEscape(q.q)}%`,
      });
    }
    const [first, ...rest] = SORTS[q.sort ?? 'commodity'];
    qb.orderBy(first[0], first[1]);
    for (const [col, dir] of rest) qb.addOrderBy(col, dir);
    qb.addOrderBy('p.id', 'ASC'); // stable paging

    const [rows, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: rows.map((r) => this.toDto(r)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      date,
    };
  }

  async compare(q: CompareQueryDto): Promise<CompareResultDto> {
    const filter = { commodity: q.commodity, state: q.state };
    const date = q.date ?? (await this.latestDate(filter));
    if (!date) return { commodity: q.commodity, date: null, stats: null, items: [] };

    const base = () =>
      this.applyLocation(this.repo.createQueryBuilder('p'), filter).andWhere('p.arrival_date = :date', {
        date,
      });

    const [rows, stats] = await Promise.all([
      base().orderBy('p.modalPrice', 'ASC').addOrderBy('p.market', 'ASC').take(300).getMany(),
      base()
        .select('COUNT(DISTINCT p.market)', 'marketCount')
        .addSelect('MIN(p.modal_price)', 'lowest')
        .addSelect('MAX(p.modal_price)', 'highest')
        .addSelect('AVG(p.modal_price)', 'average')
        .getRawOne<Record<string, string>>(),
    ]);

    return {
      commodity: q.commodity,
      date,
      items: rows.map((r) => this.toDto(r)),
      stats:
        rows.length && stats
          ? {
              marketCount: Number(stats.marketCount),
              lowest: round(stats.lowest),
              highest: round(stats.highest),
              average: round(stats.average),
            }
          : null,
    };
  }

  async trend(q: TrendQueryDto): Promise<TrendResultDto> {
    const end = await this.latestDate(q);
    if (!end) return { commodity: q.commodity, points: [], changePercent: null };
    const days = q.days ?? 30;

    const rows = await this.applyLocation(this.repo.createQueryBuilder('p'), q)
      .andWhere('p.arrival_date > (CAST(:end AS date) - CAST(:days AS int))', { end, days })
      .andWhere('p.arrival_date <= :end', { end })
      .select('p.arrival_date', 'date')
      .addSelect('AVG(p.modal_price)', 'modalPrice')
      .addSelect('MIN(p.min_price)', 'minPrice')
      .addSelect('MAX(p.max_price)', 'maxPrice')
      .addSelect('COUNT(DISTINCT p.market)', 'markets')
      .groupBy('p.arrival_date')
      .orderBy('p.arrival_date', 'ASC')
      .getRawMany<Record<string, string>>();

    const points = rows.map((r) => ({
      date: String(r.date),
      modalPrice: round(r.modalPrice),
      minPrice: round(r.minPrice),
      maxPrice: round(r.maxPrice),
      markets: Number(r.markets),
    }));
    const firstP = points[0]?.modalPrice;
    const lastP = points.at(-1)?.modalPrice;
    const changePercent =
      points.length > 1 && firstP ? Math.round(((Number(lastP) - firstP) / firstP) * 1000) / 10 : null;

    return { commodity: q.commodity, points, changePercent };
  }

  async popular(q: PopularQueryDto): Promise<PopularResultDto> {
    const date = await this.latestDate({ state: q.state });
    if (!date) return { date: null, items: [] };

    const rows = await this.applyLocation(this.repo.createQueryBuilder('p'), { state: q.state })
      .andWhere('p.arrival_date = :date', { date })
      .select('p.commodity', 'commodity')
      .addSelect('COUNT(DISTINCT p.market)', 'markets')
      .addSelect('AVG(p.modal_price)', 'avg')
      .addSelect('MIN(p.modal_price)', 'min')
      .addSelect('MAX(p.modal_price)', 'max')
      .groupBy('p.commodity')
      .orderBy('COUNT(DISTINCT p.market)', 'DESC')
      .addOrderBy('p.commodity', 'ASC')
      .limit(q.limit ?? 8)
      .getRawMany<Record<string, string>>();

    return {
      date,
      items: rows.map((r) => ({
        commodity: r.commodity,
        markets: Number(r.markets),
        avgModalPrice: round(r.avg),
        minModalPrice: round(r.min),
        maxModalPrice: round(r.max),
      })),
    };
  }

  async overview(): Promise<OverviewDto> {
    const latestDate = await this.latestDate({});
    const all = await this.repo
      .createQueryBuilder('p')
      .select('COUNT(*)', 'total')
      .getRawOne<{ total: string }>();
    if (!latestDate) {
      return {
        latestDate: null,
        totalRecords: Number(all?.total ?? 0),
        recordsOnLatestDate: 0,
        states: 0,
        markets: 0,
        commodities: 0,
      };
    }
    const today = await this.repo
      .createQueryBuilder('p')
      .where('p.arrival_date = :d', { d: latestDate })
      .select('COUNT(*)', 'rows')
      .addSelect('COUNT(DISTINCT p.state)', 'states')
      .addSelect('COUNT(DISTINCT (p.state, p.market))', 'markets')
      .addSelect('COUNT(DISTINCT p.commodity)', 'commodities')
      .getRawOne<Record<string, string>>();
    return {
      latestDate,
      totalRecords: Number(all?.total ?? 0),
      recordsOnLatestDate: Number(today?.rows ?? 0),
      states: Number(today?.states ?? 0),
      markets: Number(today?.markets ?? 0),
      commodities: Number(today?.commodities ?? 0),
    };
  }

  /* ---------------- dropdown lists ---------------- */

  async distinct(
    column: 'state' | 'district' | 'market' | 'commodity',
    f: LocationFilterDto,
  ): Promise<string[]> {
    const rows = await this.applyLocation(this.repo.createQueryBuilder('p'), f)
      .select(`p.${column}`, 'v')
      .distinct(true)
      .orderBy('v', 'ASC')
      .getRawMany<{ v: string }>();
    return rows.map((r) => r.v).filter(Boolean);
  }
}
