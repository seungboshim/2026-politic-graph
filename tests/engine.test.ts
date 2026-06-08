import { describe, expect, test } from 'vitest';
import { computeResult, computeRoute, getNextQuestion, replay } from '@/lib/engine';
import { PHASE1, QUESTION_MAP } from '@/data/questions';
import type { Answer } from '@/data/schema';

/** PHASE1을 주어진 인덱스로 답한 Answer 배열 */
const phase1Answers = (idx: Record<string, number>): Answer[] =>
  PHASE1.map((q) => ({ questionId: q.id, optionIndex: idx[q.id] ?? 2 }));

// 좌향: q1 매우동의(econ-40), q3 매우동의(social-40), q5 매우비동의(security-40), q9 민주당
const LEFT_P1 = { q1: 0, q3: 0, q5: 4, q8: 1, q9: 0 };
// 우향: q1 매우비동의(econ+40), q3 매우비동의(social+40), q5 매우동의(security+40), q9 국민의힘
const RIGHT_P1 = { q1: 4, q3: 4, q5: 0, q8: 1, q9: 2 };
// 중도: 전부 보통 + q9 없음
const CENTER_P1 = { q8: 1, q9: 5 };
// 무관심: q8 '일부러 안 본다'(engage-55)
const APATHY_P1 = { q8: 3, q9: 5 };

describe('computeRoute', () => {
  test('좌향', () => expect(computeRoute(phase1Answers(LEFT_P1))).toBe('left'));
  test('우향', () => expect(computeRoute(phase1Answers(RIGHT_P1))).toBe('right'));
  test('중도', () => expect(computeRoute(phase1Answers(CENTER_P1))).toBe('center'));
  test('무관심 (engage ≤ -50 우선)', () => expect(computeRoute(phase1Answers(APATHY_P1))).toBe('apathy'));
});

describe('getNextQuestion', () => {
  test('Phase1을 순서대로 소진', () => {
    expect(getNextQuestion([])!.id).toBe('q1');
    const a: Answer[] = [{ questionId: 'q1', optionIndex: 2 }];
    expect(getNextQuestion(a)!.id).toBe('q2');
  });

  test('우향 → r1이 첫 Phase2 질문, 반탄이면 r2(부정선거)로', () => {
    const a = phase1Answers(RIGHT_P1);
    expect(getNextQuestion(a)!.id).toBe('r1');
    a.push({ questionId: 'r1', optionIndex: 1 }); // antiMild
    expect(getNextQuestion(a)!.id).toBe('r2');
  });

  test('우향 → 찬탄이면 r2p로', () => {
    const a = phase1Answers(RIGHT_P1);
    a.push({ questionId: 'r1', optionIndex: 0 }); // pro
    expect(getNextQuestion(a)!.id).toBe('r2p');
  });

  test('무관심 트랙은 a1→a2→a3 후 종료(null)', () => {
    const a = phase1Answers(APATHY_P1);
    expect(getNextQuestion(a)!.id).toBe('a1');
    a.push({ questionId: 'a1', optionIndex: 1 }, { questionId: 'a2', optionIndex: 2 }, { questionId: 'a3', optionIndex: 2 });
    expect(getNextQuestion(a)).toBeNull();
  });

  test('좌향 완주: phase2 6문항 + phase3 3문항 후 종료', () => {
    const a = phase1Answers(LEFT_P1);
    let q;
    const seen: string[] = [];
    while ((q = getNextQuestion(a))) {
      seen.push(q.id);
      a.push({ questionId: q.id, optionIndex: 0 });
    }
    expect(seen.filter((id) => QUESTION_MAP[id].phase === 2).length).toBe(6);
    expect(seen.filter((id) => QUESTION_MAP[id].phase === 3).length).toBe(3);
  });

  test('Phase3 선택은 답변이 추가돼도 고정 (안정성)', () => {
    const a = phase1Answers(LEFT_P1);
    let q;
    while ((q = getNextQuestion(a)) && QUESTION_MAP[q.id].phase !== 3) {
      a.push({ questionId: q.id, optionIndex: 0 });
    }
    const firstPick = q!.id;
    a.push({ questionId: q!.id, optionIndex: 4 }); // 극단적으로 답해도
    const next = getNextQuestion(a)!;
    expect(next.id).not.toBe(firstPick); // 같은 질문 반복 없음
    expect(QUESTION_MAP[next.id].phase).toBe(3);
  });
});

describe('computeResult', () => {
  test('결과에 typeId, top3, state가 있다', () => {
    const a = phase1Answers(LEFT_P1);
    let q;
    while ((q = getNextQuestion(a))) a.push({ questionId: q.id, optionIndex: 0 });
    const r = computeResult(a);
    expect(r.typeId).toBeTruthy();
    expect(r.top.length).toBe(3);
    expect(r.top[0].similarity).toBeGreaterThan(r.top[2].similarity - 1);
  });

  test('잘못된 답(없는 질문)은 throw', () => {
    expect(() => computeResult([{ questionId: 'nope', optionIndex: 0 }])).toThrow();
  });
});
