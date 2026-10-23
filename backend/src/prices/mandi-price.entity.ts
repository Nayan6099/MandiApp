import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

/** Postgres returns NUMERIC as string; convert it back to a JS number. */
const numeric = {
  to: (v?: number | null) => v,
  from: (v?: string | null) => (v === null || v === undefined ? null : Number(v)),
};

/**
 * One price row = one commodity + variety + grade in one mandi on one day.
 * Prices are in Rupees per Quintal (100 kg), exactly as Agmarknet publishes them.
 */
@Entity({ name: 'mandi_prices' })
@Unique('uq_mandi_price_row', ['state', 'district', 'market', 'commodity', 'variety', 'grade', 'arrivalDate'])
@Index('idx_price_commodity_date', ['commodity', 'arrivalDate'])
@Index('idx_price_location', ['state', 'district', 'market'])
@Index('idx_price_date', ['arrivalDate'])
export class MandiPrice {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 150 })
  market: string;

  @Column({ type: 'varchar', length: 150 })
  commodity: string;

  @Column({ type: 'varchar', length: 150, default: '' })
  variety: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  grade: string;

  /** Stored as DATE, read back as 'YYYY-MM-DD'. */
  @Column({ name: 'arrival_date', type: 'date' })
  arrivalDate: string;

  @Column({ name: 'min_price', type: 'numeric', precision: 12, scale: 2, transformer: numeric })
  minPrice: number;

  @Column({ name: 'max_price', type: 'numeric', precision: 12, scale: 2, transformer: numeric })
  maxPrice: number;

  @Column({ name: 'modal_price', type: 'numeric', precision: 12, scale: 2, transformer: numeric })
  modalPrice: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
