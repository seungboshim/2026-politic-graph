import { describe, expect, test } from 'vitest';
import { avatarInnerSvg, AVATAR_VIEWBOX, type AvatarOpts } from '@/lib/avatar';

const base: AvatarOpts = { sex: 'm', hair: 'down', hairColor: 'black', glasses: false, party: '더불어민주당' };

describe('avatarInnerSvg', () => {
  test('rect 마크업 문자열을 반환한다', () => {
    const s = avatarInnerSvg(base);
    expect(s).toContain('<rect');
    expect(s.length).toBeGreaterThan(100);
  });
  test('정당색(넥타이)이 출력에 포함된다', () => {
    expect(avatarInnerSvg(base)).toContain('#003B96');
    expect(avatarInnerSvg({ ...base, party: '국민의힘' })).toContain('#E61E2B');
  });
  test('안경 옵션이 안경테(검정 #15151c)를 추가한다', () => {
    expect(avatarInnerSvg({ ...base, glasses: false })).not.toContain('#15151c');
    expect(avatarInnerSvg({ ...base, glasses: true })).toContain('#15151c');
  });
  test('미등록 정당은 폴백 회색(#808080)', () => {
    expect(avatarInnerSvg({ ...base, party: '없는당' })).toContain('#808080');
  });
  test('viewBox 상수 노출', () => {
    expect(AVATAR_VIEWBOX).toBe('-1 -1 22 22');
  });
});
