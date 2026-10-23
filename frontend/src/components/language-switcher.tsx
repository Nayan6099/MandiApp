'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isLocale, LOCALES } from '@/i18n/config';
import { useT } from '@/i18n/use-t';
import { usePreferences } from '@/stores/preferences';

export function LanguageSwitcher() {
  const { t, locale } = useT();
  const setLocale = usePreferences((s) => s.setLocale);
  const current = LOCALES.find((l) => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" aria-label={t('lang.label')}>
          <Languages aria-hidden />
          <span>{current?.native}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{t('lang.label')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(v) => {
            if (isLocale(v)) setLocale(v);
          }}
        >
          {LOCALES.map((l) => (
            <DropdownMenuRadioItem key={l.code} value={l.code} lang={l.code} className="text-base">
              {l.native}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
