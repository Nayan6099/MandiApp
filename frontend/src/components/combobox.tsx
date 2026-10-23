'use client';

import { Check, ChevronsUpDown, X } from 'lucide-react';
import { type ReactNode, useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useT } from '@/i18n/use-t';
import { cn } from '@/lib/utils';

interface ComboboxProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  options: string[];
  placeholder: string;
  /** Shown as the first option; picking it clears the value. Omit to make the field required. */
  allLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  /** Optional nicer label per option (e.g. local crop name). Searching still uses the English value. */
  renderOption?: (value: string) => ReactNode;
  className?: string;
}

/** A dropdown you can type into — needed because some states have 100+ mandis. */
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  allLabel,
  loading,
  disabled,
  invalid,
  id,
  renderOption,
  className,
}: ComboboxProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const listId = useId();

  // Fast memory filter capped at 60 items to keep Radix popover & cmdk responsive
  const maxItems = 60;
  const filtered = useMemo<{ items: string[]; total: number }>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return { items: options.slice(0, maxItems), total: options.length };
    const matches: string[] = [];
    for (const opt of options) {
      const label = typeof renderOption?.(opt) === 'string' ? (renderOption(opt) as string) : '';
      if (opt.toLowerCase().includes(q) || label?.toLowerCase().includes(q)) {
        matches.push(opt);
      }
    }
    return { items: matches.slice(0, maxItems), total: matches.length };
  }, [options, search, renderOption]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className={cn('relative', className)}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-invalid={invalid || undefined}
            disabled={disabled || loading}
            className={cn(
              'h-11 w-full justify-between bg-card px-3 font-normal text-base md:text-sm',
              !value && 'text-muted-foreground',
              value && allLabel && 'pr-16',
            )}
          >
            <span className="truncate text-left">
              {value ? (renderOption?.(value) ?? value) : (allLabel ?? placeholder)}
            </span>
            <ChevronsUpDown className="opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        {value && allLabel && !disabled ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-1/2 right-8 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t('common.clear')}
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t('common.searchList')} value={search} onValueChange={setSearch} />
          <CommandList id={listId}>
            {filtered.items.length === 0 && !allLabel ? (
              <CommandEmpty>{t('common.nothingFound')}</CommandEmpty>
            ) : null}
            <CommandGroup>
              {allLabel && !search ? (
                <CommandItem
                  value={`__all__ ${allLabel}`}
                  onSelect={() => {
                    onChange(undefined);
                    handleOpenChange(false);
                  }}
                >
                  <Check className={cn(value ? 'opacity-0' : 'opacity-100')} aria-hidden />
                  {allLabel}
                </CommandItem>
              ) : null}
              {filtered.items.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onChange(opt);
                    handleOpenChange(false);
                  }}
                >
                  <Check className={cn(value === opt ? 'opacity-100' : 'opacity-0')} aria-hidden />
                  <span className="truncate">{renderOption?.(opt) ?? opt}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {filtered.total > maxItems ? (
              <div className="border-t px-3 py-2 text-center text-muted-foreground text-xs">
                +{filtered.total - maxItems} {t('common.searchList')}
              </div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
