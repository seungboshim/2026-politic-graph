import { describe, expect, test } from 'vitest';
import { makeNick } from '@/lib/nick';

describe('makeNick', () => {
  test('{nickLabel}_{토큰앞4자}', () => {
    expect(makeNick('강성친명', 'a3f9c1d2-xxxx')).toBe('강성친명_a3f9');
  });
  test('토큰이 짧아도 안전', () => {
    expect(makeNick('중도', 'ab')).toBe('중도_ab');
  });
  test('nickLabel 공백 제거', () => {
    expect(makeNick('강성 친명', 'a3f9zzzz')).toBe('강성친명_a3f9');
  });
});
