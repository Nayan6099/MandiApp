'use client';

import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/utils';

function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('inline-flex w-fit items-center rounded-md border bg-card p-0.5', className)}
      {...props}
    />
  );
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'inline-flex h-8 min-w-12 cursor-pointer items-center justify-center rounded-[5px] px-3 font-medium text-muted-foreground text-sm outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
