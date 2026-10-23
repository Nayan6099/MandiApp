/** A simple balance-scale mark (mandi weighing) on field green, with a mustard pan. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-hidden>
      <rect width="40" height="40" rx="10" fill="var(--primary)" />
      <path d="M20 9v20" stroke="var(--primary-foreground)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 14h20" stroke="var(--primary-foreground)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M14 30h12" stroke="var(--primary-foreground)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 14l-4 8h8z" fill="var(--accent)" />
      <path d="M30 14l-4 8h8z" fill="var(--accent)" />
      <circle cx="20" cy="9" r="2" fill="var(--accent)" />
    </svg>
  );
}
