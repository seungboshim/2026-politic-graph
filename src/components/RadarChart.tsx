// src/components/RadarChart.tsx — 6축 레이더. -100~100 → 0~1 반지름.
import { AXES, AxisId } from '@/data/schema';

const LABELS: Record<AxisId, string> = {
  econ: '시장', social: '전통', security: '안보강경', trust: '제도신뢰', gender: '반페미', engage: '정치관여',
};

export default function RadarChart({ axes }: { axes: Record<AxisId, number> }) {
  const cx = 150, cy = 150, R = 110;
  const pt = (i: number, r: number) => {
    const ang = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r] as const;
  };
  const poly = AXES.map((a, i) => pt(i, ((axes[a] + 100) / 200) * R).join(',')).join(' ');
  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-sm">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={AXES.map((_, i) => pt(i, R * f).join(',')).join(' ')}
          fill="none" stroke="#e4e4e7" strokeWidth="1" />
      ))}
      {AXES.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e4e4e7" strokeWidth="1" />;
      })}
      <polygon points={poly} fill="rgba(24,24,27,0.15)" stroke="#18181b" strokeWidth="2" />
      {AXES.map((a, i) => {
        const [x, y] = pt(i, R + 22);
        return (
          <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-zinc-500 text-[11px]">
            {LABELS[a]}
          </text>
        );
      })}
    </svg>
  );
}
