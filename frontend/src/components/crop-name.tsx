'use client';

import { useT } from '@/i18n/use-t';
import { cn } from '@/lib/utils';

/** Local crop name on top (when we have one), the official English name under it. */
export function CropName({ name, className }: { name: string; className?: string }) {
  const { crop, locale } = useT();
  const local = crop(name);
  if (!local) return <span className={cn('font-semibold', className)}>{name}</span>;
  return (
    <span className={cn('flex flex-col', className)}>
      <span className="font-semibold" lang={locale}>
        {local}
      </span>
      <span className="text-muted-foreground text-xs" lang="en">
        {name}
      </span>
    </span>
  );
}

/** Plain-text version for dropdowns/search: "प्याज (Onion)". */
export function useCropLabel() {
  const { crop } = useT();
  return (name: string) => {
    const local = crop(name);
    return local ? `${local} (${name})` : name;
  };
}
