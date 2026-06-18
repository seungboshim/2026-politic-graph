// src/components/ui/AppHeader.tsx — 터미널풍 슬림 상단바(전역)
import Link from 'next/link';
export default function AppHeader() {
  return (
    <header className="border-b border-border px-[18px] py-3 font-mono text-label01 text-foreground-subtle">
      <Link href="/" className="hover:text-foreground-secondary"><span className="text-success">●</span> politic-graph</Link>
    </header>
  );
}
