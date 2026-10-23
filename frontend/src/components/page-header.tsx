import type { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  aside,
}: {
  title: string;
  subtitle?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 pt-6 pb-5 md:flex-row md:items-end md:justify-between md:pt-10">
      <div className="max-w-2xl">
        <h1 className="font-bold text-3xl text-primary md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
      </div>
      {aside}
    </div>
  );
}
