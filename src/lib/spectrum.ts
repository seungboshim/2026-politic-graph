// src/lib/spectrum.ts — 좌우 정치 스펙트럼 액센트(순수).
import type { UserState } from '@/data/schema';

export function leanOf(state: UserState): number {
  return (state.axes.econ + state.axes.social + state.axes.security) / 3;
}

const FILL = { blue: '#2f6fe6', violet: '#8b5cf6', red: '#e8434b', midA: '#5f6fe6', midB: '#b15cc0' };
const TEXT = { blue: '#6aa3ff', violet: '#b794f6', red: '#ff7b82', midA: '#8fa3ff', midB: '#d49be0' };

export function accentStops(lean: number, tier: 'fill' | 'text'): [string, string] {
  const c = tier === 'text' ? TEXT : FILL;
  if (lean <= -30) return [c.blue, c.violet];
  if (lean >= 30) return [c.violet, c.red];
  return [c.midA, c.midB];
}

export function accentGradient(lean: number, tier: 'fill' | 'text'): string {
  const [a, b] = accentStops(lean, tier);
  return `linear-gradient(92deg, ${a}, ${b})`;
}
