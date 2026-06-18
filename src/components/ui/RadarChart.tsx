// src/components/ui/RadarChart.tsx — 6축, 다크 + 스펙트럼 그라디언트 채움.
import { AXES, type AxisId } from '@/data/schema';
import { accentStops } from '@/lib/spectrum';

const LABELS: Record<AxisId, string> = {
  econ: '시장', social: '전통', security: '안보', trust: '신뢰', gender: '반페미', engage: '관여',
};

export default function RadarChart({ axes, lean }: { axes: Record<AxisId, number>; lean: number }) {
  const cx = 125, cy = 120, R = 82;
  const [a, b] = accentStops(lean, 'fill');
  const pt = (i: number, r: number) => {
    const ang = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r] as const;
  };
  const poly = AXES.map((ax, i) => pt(i, ((axes[ax] + 100) / 200) * R).join(',')).join(' ');
  return (
    <svg viewBox="0 0 250 240" className="w-full max-w-[260px]">
      <defs>
        <linearGradient id="pg-radar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} stopOpacity="0.35" />
          <stop offset="1" stopColor={b} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {[0.33, 0.66, 1].map((f) => (
        <polygon key={f} points={AXES.map((_, i) => pt(i, R * f).join(',')).join(' ')} fill="none" stroke="#262626" strokeWidth="1" />
      ))}
      {AXES.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#262626" strokeWidth="1" />; })}
      <polygon points={poly} fill="url(#pg-radar)" stroke={a} strokeWidth="2" />
      {AXES.map((ax, i) => { const [x, y] = pt(i, R + 16); return (
        <text key={ax} x={x} y={y} fill="#737373" fontSize="10" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">{LABELS[ax]}</text>
      ); })}
    </svg>
  );
}
