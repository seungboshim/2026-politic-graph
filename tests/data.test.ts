// tests/data.test.ts
import { describe, expect, test } from 'vitest';
import { TYPES } from '@/data/types';
import { AXES } from '@/data/schema';
import { POLITICIANS } from '@/data/politicians';
import { ALL_QUESTIONS, PHASE1, PHASE3_POOL } from '@/data/questions';

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

describe('POLITICIANS 데이터 검증', () => {
  test('25명, id 유일', () => {
    expect(POLITICIANS.length).toBe(25);
    expect(new Set(POLITICIANS.map((p) => p.id)).size).toBe(25);
  });

  test('정치인은 모든 스탠스를 가진다', () => {
    for (const p of POLITICIANS) {
      expect(p.vector.impeach, p.id).toBeDefined();
      expect(p.vector.fraud, p.id).toBeDefined();
      expect(p.vector.leejm, p.id).toBeDefined();
      expect(p.vector.prosec, p.id).toBeDefined();
    }
  });

  test('축·스탠스 값 범위', () => {
    for (const p of POLITICIANS) {
      for (const a of AXES) {
        expect(Math.abs(p.vector.axes[a]), `${p.id}.${a}`).toBeLessThanOrEqual(100);
      }
      for (const k of ['fraud', 'leejm', 'prosec'] as const) {
        expect(p.vector[k]!).toBeGreaterThanOrEqual(0);
        expect(p.vector[k]!).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('QUESTIONS 데이터 검증', () => {
  test('id 유일', () => {
    expect(new Set(ALL_QUESTIONS.map((q) => q.id)).size).toBe(ALL_QUESTIONS.length);
  });

  test('Phase1은 9문항, 라우터 질문 포함', () => {
    expect(PHASE1.length).toBe(9);
    expect(PHASE1.some((q) => q.options.some((o) => o.routeBonus !== undefined))).toBe(true);
  });

  test('모든 선택지는 2개 이상, 델타 절대값 ≤ 60', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(2);
      for (const o of q.options) {
        for (const v of Object.values(o.axes ?? {})) expect(Math.abs(v as number), q.id).toBeLessThanOrEqual(60);
        for (const k of ['fraud', 'leejm', 'prosec'] as const) {
          if (o[k] !== undefined) expect(Math.abs(o[k]!), q.id).toBeLessThanOrEqual(60);
        }
      }
    }
  });

  test('Phase3 풀은 전부 target 축을 가진다', () => {
    for (const q of PHASE3_POOL) expect(q.target, q.id).toBeDefined();
  });
});

describe('디자인 시스템 스키마 검증', () => {
  test('모든 유형은 nickLabel(1~8자, 공백 없음)을 가진다', () => {
    for (const t of TYPES) {
      expect(t.nickLabel, t.id).toBeTruthy();
      expect(t.nickLabel.length).toBeLessThanOrEqual(8);
      expect(t.nickLabel).not.toMatch(/\s/);
    }
  });
  test('모든 정치인은 face를 가진다', () => {
    for (const p of POLITICIANS) {
      expect(['m', 'f']).toContain(p.face.sex);
      expect(['up', 'down', 'bob']).toContain(p.face.hair);
      expect(['black', 'silver']).toContain(p.face.hairColor);
      expect(typeof p.face.glasses).toBe('boolean');
    }
  });
});
