export default function Eyebrow({ children, accentColor = '#6aa3ff' }: { children: React.ReactNode; accentColor?: string }) {
  return (
    <p className="font-mono text-label02 text-foreground-subtle">
      <span style={{ color: accentColor }}>// </span>{children}
    </p>
  );
}
