import { describe, expect, test } from 'vitest';
import { PARTY_COLORS, partyColor, shade } from '@/lib/parties';

describe('parties', () => {
  test('10개 정당 등록', () => {
    expect(Object.keys(PARTY_COLORS).length).toBe(10);
    expect(PARTY_COLORS['더불어민주당']).toBe('#003B96');
    expect(PARTY_COLORS['국민의힘']).toBe('#E61E2B');
  });
  test('미등록 정당 폴백', () => {
    expect(partyColor('없는당')).toBe('#808080');
    expect(partyColor('개혁신당')).toBe('#FF7210');
  });
  test('shade 음수=어둡게, 클램프', () => {
    expect(shade('#000000', -50)).toBe('#000000');
    expect(shade('#ffffff', 50)).toBe('#ffffff');
    expect(shade('#808080', 16)).toBe('#909090');
  });
});
