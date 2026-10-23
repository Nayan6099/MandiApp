'use client';

import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import { cn } from '@/lib/utils';
import { savedKey, useSaved } from '@/stores/saved';

interface Props {
  commodity: string;
  market: string;
  district: string;
  state: string;
  className?: string;
}

export function SaveButton({ commodity, market, district, state, className }: Props) {
  const { t } = useT();
  const key = savedKey({ commodity, market, state });
  const isSaved = useSaved((s) => s.items.some((i) => savedKey(i) === key));
  const toggle = useSaved((s) => s.toggle);
  const label = `${isSaved ? t('saved.remove') : t('saved.save')}: ${commodity}, ${market}`;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-pressed={isSaved}
      aria-label={label}
      title={label}
      onClick={() => toggle({ commodity, market, district, state })}
      className={cn('shrink-0 text-muted-foreground', isSaved && 'text-accent-ink', className)}
    >
      <Star className={cn('size-5', isSaved && 'fill-accent stroke-accent-ink')} aria-hidden />
    </Button>
  );
}
