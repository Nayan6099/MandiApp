import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type SyncStatus = 'running' | 'success' | 'failed';

/** One row per sync run, so we can show "last updated" and debug failures. */
@Entity({ name: 'sync_logs' })
@Index('idx_sync_started', ['startedAt'])
export class SyncLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt: Date | null;

  @Column({ type: 'varchar', length: 20 })
  status: SyncStatus;

  @Column({ name: 'records_fetched', type: 'int', default: 0 })
  recordsFetched: number;

  @Column({ name: 'records_saved', type: 'int', default: 0 })
  recordsSaved: number;

  @Column({ type: 'text', nullable: true })
  message: string | null;
}
