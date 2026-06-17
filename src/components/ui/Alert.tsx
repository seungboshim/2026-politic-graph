export default function Alert({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-warning/40 bg-warning/10 px-3.5 py-3 text-body02 text-warning">{children}</p>;
}
