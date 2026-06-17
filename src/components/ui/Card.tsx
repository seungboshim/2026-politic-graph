export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={['rounded-xl border border-border bg-surface p-[18px]', className].join(' ')}>{children}</div>;
}
