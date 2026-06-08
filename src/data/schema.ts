// src/data/schema.ts — 도메인 타입. 런타임 로직 없음.

export const AXES = ['econ', 'social', 'security', 'trust', 'gender', 'engage'] as const;
export type AxisId = (typeof AXES)[number];

export type ImpeachStance = 'pro' | 'antiMild' | 'yoonAgain';
export type StanceId = 'impeach' | 'fraud' | 'leejm' | 'prosec';
export type DimId = AxisId | StanceId;

export type Branch = 'left' | 'center' | 'right' | 'apathy';

export interface Option {
  label: string;
  axes?: Partial<Record<AxisId, number>>; // 델타
  impeach?: ImpeachStance;                // 설정 (마지막 답이 이김)
  fraud?: number;                         // 델타 (기준 50)
  leejm?: number;
  prosec?: number;
  routeBonus?: number;                    // 라우터 질문 전용
}

export interface Question {
  id: string;
  phase: 1 | 2 | 3;
  branch?: Branch | 'rightAnti' | 'rightPro'; // phase 2 전용
  target?: AxisId;                            // phase 3 전용: 어떤 축을 가르는 질문인가
  text: string;
  options: Option[];
}

export interface UserState {
  axes: Record<AxisId, number>;
  axisAnswered: Record<AxisId, boolean>;
  stances: { impeach?: ImpeachStance; fraud?: number; leejm?: number; prosec?: number };
}

export interface TargetVector {
  axes: Record<AxisId, number>;
  impeach?: ImpeachStance;
  fraud?: number;
  leejm?: number;
  prosec?: number;
}

export interface PoliticalType {
  id: string;
  name: string;
  camp: '좌파' | '중도좌' | '중도우' | '우파' | '비이념';
  tagline: string;
  description: string;
  keywords: string[];
  vector: TargetVector;
  weights?: Partial<Record<DimId, number>>; // 이 유형 판별 시 기본 가중치 덮어쓰기
}

export interface Evidence {
  tag: DimId;
  value: string;
  source: string;
  url?: string;
}

export interface Politician {
  id: string;
  name: string;
  party: string;
  vector: TargetVector; // 정치인은 모든 스탠스 보유
  evidence?: Evidence[];
}

export interface Answer {
  questionId: string;
  optionIndex: number;
}

export interface MatchResult {
  politicianId: string;
  similarity: number; // 0~97
}

export interface TestResult {
  typeId: string;
  state: UserState;
  top: MatchResult[];
}
