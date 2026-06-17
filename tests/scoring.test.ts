import { describe, expect, test } from 'vitest';
import { applyAnswer, initialState } from '@/lib/scoring';
import { distance, matchPoliticians, matchType, similarity } from '@/lib/scoring';
import type { Question } from '@/data/schema';
import type { PoliticalType, Politician, UserState } from '@/data/schema';

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

function stateWith(axes: Partial<Record<string, number>>, stances: UserState['stances'] = {}): UserState {
  const s = initialState();
  for (const [k, v] of Object.entries(axes)) {
    s.axes[k as keyof typeof s.axes] = v as number;
    s.axisAnswered[k as keyof typeof s.axisAnswered] = true;
  }
  s.stances = stances;
  return s;
}

const tv = (axes: Record<string, number>, rest: object = {}) =>
  ({ axes: { econ: 0, social: 0, security: 0, trust: 0, gender: 0, engage: 0, ...axes }, ...rest }) as never;

describe('distance', () => {
  test('동일 벡터는 거리 0', () => {
    const s = stateWith({ econ: 50 });
    expect(distance(s, tv({ econ: 50 }))).toBe(0);
  });

  test('답하지 않은 축은 무시한다', () => {
    const s = stateWith({ econ: 50 }); // social 미응답
    const near = tv({ econ: 50, social: 100 });
    expect(distance(s, near)).toBe(0);
  });

  test('impeach 거리 행렬: pro↔yoonAgain(1.0) > pro↔antiMild(0.6)', () => {
    const s = stateWith({}, { impeach: 'pro' });
    const dMild = distance(s, tv({}, { impeach: 'antiMild' }));
    const dYoon = distance(s, tv({}, { impeach: 'yoonAgain' }));
    expect(dYoon).toBeGreaterThan(dMild);
    expect(dYoon).toBe(1); // 유일 차원이 최대 거리면 정규화 결과 1
  });

  test('includeEngage=false면 engage 축 무시', () => {
    const s = stateWith({ engage: -80 });
    expect(distance(s, tv({ engage: 80 }), { includeEngage: false })).toBe(0);
  });
});

describe('similarity / match', () => {
  test('similarity는 97을 넘지 않는다', () => {
    expect(similarity(0)).toBe(97);
    expect(similarity(1)).toBe(0);
  });

  const types: PoliticalType[] = [
    { id: 'a', name: 'A', nickLabel: 'A', camp: '좌파', tagline: '', description: '', keywords: [], vector: tv({ econ: -80 }) },
    { id: 'b', name: 'B', nickLabel: 'B', camp: '우파', tagline: '', description: '', keywords: [], vector: tv({ econ: 80 }) },
  ];

  test('matchType은 최근접 유형을 고른다', () => {
    expect(matchType(stateWith({ econ: -60 }), types).id).toBe('a');
  });

  test('weights 덮어쓰기가 판별을 바꾼다', () => {
    const types2: PoliticalType[] = [
      { ...types[0], vector: tv({ econ: -20, trust: -90 }), weights: { trust: 3 } },
      { ...types[1], vector: tv({ econ: 20, trust: 80 }) },
    ];
    const s = stateWith({ econ: 30, trust: -80 });
    expect(matchType(s, types2).id).toBe('a');
  });

  const testFace = { sex: 'm' as const, hair: 'up' as const, hairColor: 'black' as const, glasses: false };
  const pols: Politician[] = [
    { id: 'p1', name: 'P1', party: 'X', vector: tv({ econ: -70, engage: 90 }, { fraud: 5, leejm: 20, prosec: 80, impeach: 'pro' }), face: testFace },
    { id: 'p2', name: 'P2', party: 'Y', vector: tv({ econ: 60, engage: 90 }, { fraud: 5, leejm: 95, prosec: 20, impeach: 'pro' }), face: testFace },
  ];

  test('matchPoliticians: 정렬 + engage 제외 + 유사도', () => {
    const s = stateWith({ econ: -50, engage: -90 }); // engage가 포함되면 둘 다 멀어짐
    const top = matchPoliticians(s, pols, 2);
    expect(top[0].politicianId).toBe('p1');
    expect(top[0].similarity).toBeGreaterThan(top[1].similarity);
    expect(top[0].similarity).toBeGreaterThan(70); // engage 제외 덕에 높아야 함
  });
});
