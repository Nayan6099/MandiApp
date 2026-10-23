'use client';

import { useGetSyncStatus } from '@/api/generated/endpoints/sync/sync';
import { useIsClient } from '@/hooks/use-is-client';
import { useT } from '@/i18n/use-t';
import { cn } from '@/lib/utils';

/** Small "Updated 23 Oct, 2:10 pm" note, so users know how fresh the data is. */
export function SyncBadge({ className }: { className?: string }) {
  const { t, date } = useT();
  const isClient = useIsClient();
  const { data } = useGetSyncStatus();
  if (!isClient || !data) return null;

  const text = !data.apiKeyConfigured
    ? t('sync.off')
    : data.lastSuccessAt
      ? t('sync.updated', {
          time: date(data.lastSuccessAt, {
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
          }),
        })
      : null;
  if (!text) return null;

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-muted-foreground text-xs', className)}>
      <span
        className={cn('size-2 rounded-full', data.apiKeyConfigured ? 'bg-down' : 'bg-muted-foreground')}
        aria-hidden
      />
      {text}
    </span>
  );
}
