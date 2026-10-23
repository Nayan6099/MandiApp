'use client';

import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';

function Message({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed bg-card px-6 py-12 text-center">
      <Icon className="mb-3 size-8 text-muted-foreground" aria-hidden />
      <p className="font-medium">{title}</p>
      {hint ? <p className="mt-1 max-w-md text-muted-foreground text-sm">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return <Message icon={Inbox} title={title} hint={hint} />;
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useT();
  return (
    <div role="alert">
      <Message
        icon={AlertTriangle}
        title={t('common.loadError')}
        action={
          onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              {t('common.retry')}
            </Button>
          ) : null
        }
      />
    </div>
  );
}
