export default function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-[5px] border border-border bg-surface-raised px-1.5 py-0.5 text-label01 text-foreground-subtle">{children}</span>;
}
