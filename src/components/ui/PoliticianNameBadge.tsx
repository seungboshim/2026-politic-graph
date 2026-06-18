export default function PoliticianNameBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="absolute -bottom-1.5 -right-1.5 whitespace-nowrap rounded-full border bg-surface px-1.5 py-0.5 text-[9px] leading-tight text-foreground-secondary"
      style={{ borderColor: color }}
    >{name}</span>
  );
}
