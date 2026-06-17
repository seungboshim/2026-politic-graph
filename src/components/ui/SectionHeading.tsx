export default function SectionHeading({ children, accentColor = '#6aa3ff' }: { children: React.ReactNode; accentColor?: string }) {
  return (
    <h2 className="mb-3.5 text-heading02 font-bold tracking-[-0.02em]">
      <span className="font-mono font-normal" style={{ color: accentColor }}>&gt; </span>
      {children}
    </h2>
  );
}
