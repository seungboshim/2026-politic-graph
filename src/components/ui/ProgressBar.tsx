export default function ProgressBar({ value, gradient }: { value: number; gradient: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundImage: gradient }} />
    </div>
  );
}
