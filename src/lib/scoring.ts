// src/lib/scoring.ts — 순수 채점 수학. /src/data의 콘텐츠를 import하지 않는다(주입식).
import { AXES, AxisId, Option, Question, UserState } from '@/data/schema';

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
