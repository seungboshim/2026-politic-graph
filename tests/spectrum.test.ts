import { describe, expect, test } from 'vitest';
import { leanOf, accentStops, accentGradient } from '@/lib/spectrum';
import { initialState } from '@/lib/scoring';
import type { UserState } from '@/data/schema';

function withAxes(a: Partial<UserState['axes']>): UserState {
  const s = initialState();
  Object.assign(s.axes, a);
  return s;
}

describe('spectrum', () => {
  test('leanOf = (econ+social+security)/3', () => {
    expect(leanOf(withAxes({ econ: -60, social: -30, security: -30 }))).toBe(-40);
    expect(leanOf(withAxes({ econ: 60, social: 60, security: 60 }))).toBe(60);
  });
  test('좌향(≤-30) → blue→violet, 우향(≥30) → violet→red, 중도 → 별도 중간톤', () => {
    expect(accentStops(-50, 'fill')).toEqual(['#2f6fe6', '#8b5cf6']);
    expect(accentStops(50, 'fill')).toEqual(['#8b5cf6', '#e8434b']);
    expect(accentStops(0, 'fill')[0]).not.toBe('#2f6fe6');
  });
  test('text tier는 밝은 토큰', () => {
    expect(accentStops(-50, 'text')).toEqual(['#6aa3ff', '#b794f6']);
    expect(accentStops(50, 'text')).toEqual(['#b794f6', '#ff7b82']);
  });
  test('accentGradient는 css linear-gradient 문자열', () => {
    expect(accentGradient(-50, 'text')).toBe('linear-gradient(92deg, #6aa3ff, #b794f6)');
  });
});
