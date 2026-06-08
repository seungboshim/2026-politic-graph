// src/lib/scoring.ts — 순수 채점 수학. /src/data의 콘텐츠를 import하지 않는다(주입식).
import {
  AXES, AxisId, DimId, ImpeachStance, MatchResult, Option, PoliticalType,
  Politician, Question, TargetVector, UserState,
} from '@/data/schema';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function initialState(): UserState {
  const axes = Object.fromEntries(AXES.map((a) => [a, 0])) as Record<AxisId, number>;
  const axisAnswered = Object.fromEntries(AXES.map((a) => [a, false])) as Record<AxisId, boolean>;
  return { axes, axisAnswered, stances: {} };
}

export function applyAnswer(state: UserState, question: Question, optionIndex: number): UserState {
  const opt: Option | undefined = question.options[optionIndex];
  if (!opt) throw new Error(`invalid option ${optionIndex} for ${question.id}`);
  const next: UserState = {
    axes: { ...state.axes },
    axisAnswered: { ...state.axisAnswered },
    stances: { ...state.stances },
  };
  for (const [axis, delta] of Object.entries(opt.axes ?? {})) {
    const a = axis as AxisId;
    next.axes[a] = clamp(next.axes[a] + (delta as number), -100, 100);
    next.axisAnswered[a] = true;
  }
  if (opt.impeach) next.stances.impeach = opt.impeach;
  for (const key of ['fraud', 'leejm', 'prosec'] as const) {
    const delta = opt[key];
    if (delta !== undefined) next.stances[key] = clamp((next.stances[key] ?? 50) + delta, 0, 100);
  }
  return next;
}

const IMPEACH_DIST: Record<ImpeachStance, Record<ImpeachStance, number>> = {
  pro: { pro: 0, antiMild: 0.6, yoonAgain: 1 },
  antiMild: { pro: 0.6, antiMild: 0, yoonAgain: 0.4 },
  yoonAgain: { pro: 1, antiMild: 0.4, yoonAgain: 0 },
};

export const DEFAULT_WEIGHTS: Record<DimId, number> = {
  econ: 1, social: 1, security: 1, trust: 1, gender: 1, engage: 1,
  impeach: 2, fraud: 1.5, leejm: 1.5, prosec: 1.5,
};

export interface DistanceOpts {
  includeEngage?: boolean; // 기본 true. 정치인 매칭은 false
  weights?: Partial<Record<DimId, number>>;
}

/** 정규화 거리 0~1. 사용자가 답한 차원 ∩ 타깃이 가진 차원만 사용. */
export function distance(state: UserState, target: TargetVector, opts: DistanceOpts = {}): number {
  const { includeEngage = true } = opts;
  const w = { ...DEFAULT_WEIGHTS, ...opts.weights };
  let sum = 0;
  let wsum = 0;
  for (const axis of AXES) {
    if (!state.axisAnswered[axis]) continue;
    if (axis === 'engage' && !includeEngage) continue;
    const d = (state.axes[axis] - target.axes[axis]) / 200; // 0~1
    sum += w[axis] * d * d;
    wsum += w[axis];
  }
  if (state.stances.impeach && target.impeach) {
    const d = IMPEACH_DIST[state.stances.impeach][target.impeach];
    sum += w.impeach * d * d;
    wsum += w.impeach;
  }
  for (const key of ['fraud', 'leejm', 'prosec'] as const) {
    const u = state.stances[key];
    const t = target[key];
    if (u === undefined || t === undefined) continue;
    const d = (u - t) / 100;
    sum += w[key] * d * d;
    wsum += w[key];
  }
  if (wsum === 0) return 0; // 비교 가능한 차원이 없으면 거리 0 (구별 불가)
  return Math.sqrt(sum / wsum);
}

export const similarity = (dNorm: number): number => Math.min(97, Math.round((1 - dNorm) * 100));

export function matchType(state: UserState, types: PoliticalType[]): PoliticalType {
  let best = types[0];
  let bestD = Infinity;
  for (const t of types) {
    const d = distance(state, t.vector, { includeEngage: true, weights: t.weights });
    if (d < bestD) { bestD = d; best = t; }
  }
  return best;
}

export function matchPoliticians(state: UserState, pols: Politician[], n = 3): MatchResult[] {
  return pols
    .map((p) => ({ politicianId: p.id, d: distance(state, p.vector, { includeEngage: false }) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map(({ politicianId, d }) => ({ politicianId, similarity: similarity(d) }));
}
