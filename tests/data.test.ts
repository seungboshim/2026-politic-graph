// tests/data.test.ts
import { describe, expect, test } from 'vitest';
import { TYPES } from '@/data/types';
import { AXES } from '@/data/schema';

describe('TYPES 데이터 검증', () => {
  test('13개 유형, id 유일', () => {
    expect(TYPES.length).toBe(13);
    expect(new Set(TYPES.map((t) => t.id)).size).toBe(13);
  });

  test('모든 축 값이 -100~100, 모든 축 존재', () => {
    for (const t of TYPES) {
      for (const a of AXES) {
        const v = t.vector.axes[a];
        expect(v, `${t.id}.${a}`).toBeGreaterThanOrEqual(-100);
        expect(v, `${t.id}.${a}`).toBeLessThanOrEqual(100);
      }
    }
  });

  test('스탠스 값이 0~100', () => {
    for (const t of TYPES) {
      for (const k of ['fraud', 'leejm', 'prosec'] as const) {
        const v = t.vector[k];
        if (v !== undefined) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(100); }
      }
    }
  });

  test('이름/설명/태그라인 비어있지 않음', () => {
    for (const t of TYPES) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.tagline.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(20);
    }
  });
});
