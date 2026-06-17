export default function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-border-strong bg-surface-raised px-2.5 py-1 text-label01 text-foreground-secondary">{children}</span>;
}
