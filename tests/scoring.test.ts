import { describe, expect, test } from 'vitest';
import { applyAnswer, initialState } from '@/lib/scoring';
import type { Question } from '@/data/schema';

const q: Question = {
  id: 'tq1', phase: 1, text: 't',
  options: [
    { label: 'a', axes: { econ: -40, trust: 10 } },
    { label: 'b', impeach: 'antiMild', fraud: 15 },
    { label: 'c', axes: { econ: -80 } },
  ],
};

describe('applyAnswer', () => {
  test('축 델타를 누적하고 answered 표시', () => {
    const s = applyAnswer(initialState(), q, 0);
    expect(s.axes.econ).toBe(-40);
    expect(s.axes.trust).toBe(10);
    expect(s.axisAnswered.econ).toBe(true);
    expect(s.axisAnswered.gender).toBe(false);
  });

  test('축은 -100~100으로 클램프', () => {
    let s = applyAnswer(initialState(), q, 2);
    s = applyAnswer(s, q, 2);
    expect(s.axes.econ).toBe(-100);
  });

  test('impeach는 설정, fraud는 기준 50에서 델타', () => {
    const s = applyAnswer(initialState(), q, 1);
    expect(s.stances.impeach).toBe('antiMild');
    expect(s.stances.fraud).toBe(65);
  });

  test('원본 state를 변경하지 않는다 (순수 함수)', () => {
    const init = initialState();
    applyAnswer(init, q, 0);
    expect(init.axes.econ).toBe(0);
  });
});
