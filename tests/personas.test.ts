// tests/personas.test.ts
import { describe, expect, test } from 'vitest';
import { computeResult, getNextQuestion } from '@/lib/engine';
import type { Answer } from '@/data/schema';

/** choices: 질문ID → 선택지 인덱스. 엔진이 묻는 질문에만 답한다. */
function run(choices: Record<string, number>) {
  const answers: Answer[] = [];
  let q;
  while ((q = getNextQuestion(answers))) {
    const idx = choices[q.id];
    if (idx === undefined) throw new Error(`persona has no choice for ${q.id}`);
    answers.push({ questionId: q.id, optionIndex: idx });
  }
  return computeResult(answers);
}

const expectType = (r: ReturnType<typeof run>, typeId: string) => expect(r.typeId).toBe(typeId);
const expectTop3 = (r: ReturnType<typeof run>, polId: string) =>
  expect(r.top.map((m) => m.politicianId), `top3=${JSON.stringify(r.top)}`).toContain(polId);

// 리커트 인덱스: 0 매우동의 / 1 동의 / 2 보통 / 3 비동의 / 4 매우비동의
// phase3 풀(p1~p6)은 어떤 3개가 선택될지 모르므로 전부 정의한다.

describe('페르소나 골든 테스트', () => {
  test('NL 자주파 → nl-jusa, 김재연 top3', () => {
    const r = run({
      q1: 0, q2: 4, q3: 0, q4: 3, q5: 4, q6: 4, q7: 0, q8: 0, q9: 1,
      l1: 1, l2: 0, l3: 2, l4: 0, l5: 1, l6: 1,
      p1: 0, p2: 0, p3: 3, p4: 1, p5: 0, p6: 3,
    });
    expectType(r, 'nl-jusa');
    expectTop3(r, 'kim-jy');
  });

  test('PD 노동좌파 → pd-labor, 권영국 top3', () => {
    const r = run({
      q1: 0, q2: 4, q3: 0, q4: 3, q5: 3, q6: 3, q7: 0, q8: 1, q9: 1,
      l1: 3, l2: 1, l3: 3, l4: 1, l5: 2, l6: 1,
      p1: 0, p2: 1, p3: 3, p4: 2, p5: 1, p6: 3,
    });
    expectType(r, 'pd-labor');
    expectTop3(r, 'kwon-yg');
  });

  test('포스트모던 진보 → postmodern-left, 장혜영 top3', () => {
    const r = run({
      q1: 1, q2: 3, q3: 0, q4: 3, q5: 3, q6: 2, q7: 0, q8: 1, q9: 1,
      l1: 3, l2: 1, l3: 2, l4: 2, l5: 0, l6: 1,
      p1: 1, p2: 1, p3: 2, p4: 0, p5: 2, p6: 2,
    });
    expectType(r, 'postmodern-left');
    expectTop3(r, 'jang-hy');
  });

  test('강성 친명 → hard-leejm, 이재명 1위', () => {
    const r = run({
      q1: 1, q2: 3, q3: 1, q4: 2, q5: 3, q6: 3, q7: 1, q8: 0, q9: 0,
      l1: 0, l2: 1, l3: 0, l4: 4, l5: 2, l6: 0,
      p1: 1, p2: 1, p3: 1, p4: 2, p5: 2, p6: 4,
    });
    expectType(r, 'hard-leejm');
    expect(r.top[0].politicianId).toBe('lee-jm');
  });

  test('검찰개혁 운동파 → prosec-reform, 조국 top3', () => {
    const r = run({
      q1: 1, q2: 3, q3: 0, q4: 2, q5: 3, q6: 4, q7: 1, q8: 0, q9: 1,
      l1: 1, l2: 0, l3: 1, l4: 3, l5: 1, l6: 2,
      p1: 1, p2: 1, p3: 2, p4: 1, p5: 2, p6: 4,
    });
    expectType(r, 'prosec-reform');
    expectTop3(r, 'cho-k');
  });

  test('온건 자유주의 → moderate-lib, 김동연 또는 이낙연 top3', () => {
    const r = run({
      q1: 1, q2: 2, q3: 1, q4: 2, q5: 2, q6: 0, q7: 1, q8: 1, q9: 0,
      l1: 3, l2: 3, l3: 3, l4: 5, l5: 2, l6: 2,
      p1: 1, p2: 2, p3: 1, p4: 1, p5: 2, p6: 1,
    });
    expectType(r, 'moderate-lib');
    const ids = r.top.map((m) => m.politicianId);
    expect(ids.some((id) => id === 'kim-dy' || id === 'lee-ny'), JSON.stringify(ids)).toBe(true);
  });

  test('청년 능력주의 → young-merit, 이준석 1위', () => {
    const r = run({
      q1: 3, q2: 1, q3: 2, q4: 2, q5: 1, q6: 1, q7: 2, q8: 0, q9: 3,
      r1: 0, r2p: 2, r4: 0, r5: 0, r6: 3,
      c1: 0, c2: 2, c3: 0, c4: 0, c5: 0, c6: 0,
      p1: 3, p2: 2, p3: 1, p4: 4, p5: 3, p6: 1,
    });
    expectType(r, 'young-merit');
    expect(r.top[0].politicianId).toBe('lee-js');
  });

  test('중도실용 보수 → prag-con, 안철수 top3', () => {
    const r = run({
      q1: 2, q2: 1, q3: 2, q4: 1, q5: 1, q6: 0, q7: 1, q8: 1, q9: 5,
      c1: 0, c2: 2, c3: 1, c4: 0, c5: 1, c6: 0,
      r1: 0, r2p: 2, r4: 2, r5: 1, r6: 2,
      p1: 2, p2: 2, p3: 0, p4: 2, p5: 3, p6: 0,
    });
    expectType(r, 'prag-con');
    expectTop3(r, 'ahn-cs');
  });

  test('찬탄 개혁보수 → pro-impeach-con, 한동훈 1위', () => {
    const r = run({
      q1: 3, q2: 1, q3: 3, q4: 1, q5: 0, q6: 0, q7: 1, q8: 0, q9: 2,
      r1: 0, r2p: 2, r4: 0, r5: 1, r6: 0,
      p1: 3, p2: 3, p3: 0, p4: 3, p5: 4, p6: 0,
    });
    expectType(r, 'pro-impeach-con');
    expect(r.top[0].politicianId).toBe('han-dh');
  });

  test('반탄 당권 주류 → anti-impeach-main, 장동혁 또는 나경원 top3', () => {
    const r = run({
      q1: 3, q2: 1, q3: 4, q4: 0, q5: 0, q6: 1, q7: 2, q8: 0, q9: 2,
      r1: 1, r2: 1, r3: 1, r4: 0, r5: 1, r6: 0,
      p1: 4, p2: 4, p3: 1, p4: 3, p5: 4, p6: 1,
    });
    expectType(r, 'anti-impeach-main');
    const ids = r.top.map((m) => m.politicianId);
    expect(ids.some((id) => id === 'jang-dh' || id === 'na-kw'), JSON.stringify(ids)).toBe(true);
  });

  test('광장 우파 → plaza-right, 전한길·황교안·전광훈 중 1위', () => {
    const r = run({
      q1: 2, q2: 1, q3: 4, q4: 0, q5: 0, q6: 4, q7: 2, q8: 0, q9: 4,
      r1: 2, r2: 2, r3: 0, r4: 0, r5: 0, r6: 3,
      p1: 4, p2: 4, p3: 4, p4: 4, p5: 4, p6: 4,
    });
    expectType(r, 'plaza-right');
    expect(['jeon-hg', 'hwang-ka', 'jeon-kh']).toContain(r.top[0].politicianId);
  });

  test('무당층 회의파 → cynic', () => {
    const r = run({
      q1: 2, q2: 2, q3: 2, q4: 1, q5: 1, q6: 3, q7: 3, q8: 1, q9: 5,
      c1: 1, c2: 0, c3: 1, c4: 1, c5: 1, c6: 1,
      p1: 2, p2: 2, p3: 3, p4: 2, p5: 2, p6: 3,
    });
    expectType(r, 'cynic');
  });

  test('무관심층 → apathy (짧은 트랙)', () => {
    const r = run({
      q1: 2, q2: 2, q3: 2, q4: 1, q5: 2, q6: 2, q7: 3, q8: 3, q9: 5,
      a1: 1, a2: 2, a3: 2,
    });
    expectType(r, 'apathy');
  });
});
