// src/lib/engine.ts — 데이터와 채점을 연결하는 레이어
import { Answer, Branch, Question, TestResult, UserState } from '@/data/schema';
import {
  APATHY, CENTER, LEFT, PHASE1, PHASE3_POOL, QUESTION_MAP,
  RIGHT_ANTI, RIGHT_COMMON, RIGHT_GATE, RIGHT_PRO, ROUTER_QUESTION_ID,
} from '@/data/questions';
import { TYPES } from '@/data/types';
import { POLITICIANS } from '@/data/politicians';
import { applyAnswer, distance, initialState, matchPoliticians, matchType } from './scoring';

export function replay(answers: Answer[]): UserState {
  let s = initialState();
  for (const a of answers) {
    const q = QUESTION_MAP[a.questionId];
    if (!q) throw new Error(`unknown question: ${a.questionId}`);
    s = applyAnswer(s, q, a.optionIndex);
  }
  return s;
}

const phase1Only = (answers: Answer[]) => answers.filter((a) => QUESTION_MAP[a.questionId]?.phase === 1);

export function computeRoute(answers: Answer[]): Branch {
  const p1 = phase1Only(answers);
  const s = replay(p1);
  if (s.axes.engage <= -50) return 'apathy';
  const router = p1.find((a) => a.questionId === ROUTER_QUESTION_ID);
  const bonus = router ? (QUESTION_MAP[ROUTER_QUESTION_ID].options[router.optionIndex].routeBonus ?? 0) : 0;
  const composite = (s.axes.econ + s.axes.social + s.axes.security) / 3 + bonus;
  if (composite <= -18) return 'left';
  if (composite >= 18) return 'right';
  return 'center';
}

function phase2Sequence(route: Branch, answers: Answer[]): Question[] {
  if (route === 'apathy') return APATHY;
  if (route === 'left') return LEFT;
  if (route === 'center') return CENTER;
  // right: r1 관문 → 탄핵 스탠스에 따라 분기
  const r1 = answers.find((a) => a.questionId === 'r1');
  if (!r1) return [RIGHT_GATE];
  const stance = QUESTION_MAP['r1'].options[r1.optionIndex].impeach; // undefined = 유보
  const factionSeq = stance === 'antiMild' || stance === 'yoonAgain' ? RIGHT_ANTI : RIGHT_PRO;
  return [RIGHT_GATE, ...factionSeq, ...RIGHT_COMMON];
}

/** Phase3 질문 3개: phase1+2 시점의 최근접 유형 2개를 가장 잘 가르는 축의 질문 */
function phase3Picks(answers: Answer[]): Question[] {
  const upTo2 = answers.filter((a) => QUESTION_MAP[a.questionId]?.phase !== 3);
  const s = replay(upTo2);
  const ranked = [...TYPES]
    .map((t) => ({ t, d: distance(s, t.vector, { includeEngage: true, weights: t.weights }) }))
    .sort((a, b) => a.d - b.d);
  const [t1, t2] = [ranked[0].t, ranked[1].t];
  return [...PHASE3_POOL]
    .map((q) => ({ q, diff: Math.abs((t1.vector.axes[q.target!] ?? 0) - (t2.vector.axes[q.target!] ?? 0)) }))
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 3)
    .map(({ q }) => q);
}

export function getNextQuestion(answers: Answer[]): Question | null {
  const answered = new Set(answers.map((a) => a.questionId));
  for (const q of PHASE1) if (!answered.has(q.id)) return q;
  const route = computeRoute(answers);
  for (const q of phase2Sequence(route, answers)) if (!answered.has(q.id)) return q;
  if (route === 'apathy') return null; // 무관심 트랙은 Phase3 없음
  for (const q of phase3Picks(answers)) if (!answered.has(q.id)) return q;
  return null;
}

/** 진행바용 예상 총 문항 수 */
export function estimateTotal(answers: Answer[]): number {
  if (answers.length < PHASE1.length) return 18;
  return computeRoute(answers) === 'apathy' ? 12 : 18;
}

// 진영 스코핑: 라우팅된 진영의 후보 유형 중에서만 최종 유형을 고른다.
// 전역 매칭 시 강성 우파가 무당층(cynic)으로, 온건 좌파가 NL로 새는 문제를 막는다.
// cynic/apathy(스탠스 차원 없음)는 center/apathy 진영에서만 후보가 된다.
export const BRANCH_TYPES: Record<Branch, string[]> = {
  left: ['nl-jusa', 'pd-labor', 'hard-leejm', 'prosec-reform', 'moderate-lib'],
  right: ['young-merit', 'prag-con', 'pro-impeach-con', 'anti-impeach-main', 'plaza-right'],
  center: ['moderate-lib', 'prag-con', 'young-merit', 'cynic'],
  apathy: ['apathy'],
};

export function computeResult(answers: Answer[]): TestResult {
  const state = replay(answers); // 존재하지 않는 질문이면 여기서 throw
  const route = computeRoute(answers);
  const ids = new Set(BRANCH_TYPES[route]);
  const candidates = TYPES.filter((t) => ids.has(t.id));
  const type = matchType(state, candidates);
  const top = matchPoliticians(state, POLITICIANS, 3);
  return { typeId: type.id, state, top };
}
