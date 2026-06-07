# 정치성향 테스트 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 적응형 분기 질문(17~19문항)으로 13개 한국 정치성향 유형 + 가장 가까운 실명 정치인을 알려주고, 결과 뱃지 댓글창과 통계를 제공하는 웹 테스트.

**Architecture:** 콘텐츠(질문·유형·정치인)는 `/src/data`의 TS 데이터 파일, 채점·분기는 `/src/lib`의 순수 함수. 진행 중 채점은 클라이언트, 최종 제출 시 서버가 같은 엔진으로 재계산 후 Supabase Postgres에 저장. 페르소나 골든 테스트가 데이터 튜닝의 회귀 방지선.

**Tech Stack:** Next.js (App Router) + TypeScript + Tailwind, Supabase Postgres + Drizzle ORM (postgres-js), Vitest, Playwright.

**스펙:** `docs/superpowers/specs/2026-06-08-political-test-design.md`

---

## 파일 구조

```
src/
  data/
    schema.ts        ← 도메인 타입 (축, 스탠스, 질문, 유형, 정치인)
    questions.ts     ← 전체 질문 + 분기 메타데이터
    types.ts         ← 13개 유형
    politicians.ts   ← 정치인 25명
    moderation.ts    ← 금칙어
  lib/
    scoring.ts       ← 순수 채점 수학 (데이터 import 없음, 주입식)
    engine.ts        ← 데이터 연결: replay, 라우팅, getNextQuestion, computeResult
  db/
    schema.ts        ← Drizzle 테이블 (results, comments)
    client.ts        ← postgres-js 연결
  app/
    layout.tsx, page.tsx, not-found.tsx
    test/page.tsx    ← 질문 플로우 (클라이언트)
    r/[id]/page.tsx  ← 결과 + 댓글
    r/[id]/opengraph-image.tsx
    stats/page.tsx
    actions.ts       ← server actions
  components/
    ResultView.tsx, RadarChart.tsx, Comments.tsx
tests/
  scoring.test.ts, engine.test.ts, data.test.ts, personas.test.ts
e2e/
  smoke.spec.ts
```

**용어 고정 (전 태스크 공통):**
- 축 ID: `econ`(+시장/−분배), `social`(+전통/−다양성), `security`(+강경/−화해), `trust`(+신뢰/−불신), `gender`(+반페미/−페미), `engage`(+고관여/−무관심). 범위 −100~+100.
- 스탠스: `impeach`(`'pro' | 'antiMild' | 'yoonAgain'`), `fraud`/`leejm`/`prosec`(0~100, 기준값 50에서 델타 누적). `leejm`: 0=강성친명, 100=비명. `prosec`: 0=온건, 100=강경. `fraud`: 0=배척, 100=수용.
- 유형 ID 13개: `nl-jusa`, `pd-labor`, `postmodern-left`, `hard-leejm`, `prosec-reform`, `moderate-lib`, `young-merit`, `prag-con`, `pro-impeach-con`, `anti-impeach-main`, `plaza-right`, `cynic`, `apathy`.

---

### Task 1: 프로젝트 스캐폴드 + Vitest

**Files:**
- Create: Next.js 스캐폴드 전체, `vitest.config.ts`, `.env.example`
- Modify: `package.json` (scripts)

- [ ] **Step 1: create-next-app 실행** (docs/가 있으면 거부하므로 잠시 치움)

```bash
cd /Users/seungboshim/Projects/personal/politic-graph
mv docs ../politic-graph-docs-tmp
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --turbopack --use-npm --yes
mv ../politic-graph-docs-tmp docs
```

Expected: 스캐폴드 생성, `src/app` 존재. (.git은 create-next-app이 허용함. 만약 git 초기화 관련 경고가 나오면 무시)

- [ ] **Step 2: 의존성 설치**

```bash
npm i drizzle-orm postgres
npm i -D vitest drizzle-kit @playwright/test
```

- [ ] **Step 3: vitest 설정 + 스크립트**

`vitest.config.ts` 생성:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: { include: ['tests/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
```

`package.json`의 scripts에 추가: `"test": "vitest run"`, `"test:watch": "vitest"`, `"db:push": "drizzle-kit push"`.

`.env.example` 생성:

```
DATABASE_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
IP_SALT=any-random-string
```

- [ ] **Step 4: 빌드·테스트 명령 동작 확인**

Run: `npm run test`
Expected: "No test files found" (에러 아님 — vitest가 passWithNoTests 아니어도 exit code 1일 수 있음. 그 경우 `vitest.config.ts` test에 `passWithNoTests: true` 추가)

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: Next.js 스캐폴드 + Vitest/Drizzle/Playwright 설정"
```

---

### Task 2: 도메인 타입

**Files:**
- Create: `src/data/schema.ts`

- [ ] **Step 1: 타입 정의 작성**

```ts
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
```

- [ ] **Step 2: 타입체크 + Commit**

Run: `npx tsc --noEmit`
Expected: 에러 없음

```bash
git add src/data/schema.ts && git commit -m "feat: 도메인 타입 정의"
```

---

### Task 3: 채점 — 답변 적용 (TDD)

**Files:**
- Create: `src/lib/scoring.ts`, `tests/scoring.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// tests/scoring.test.ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- tests/scoring.test.ts`
Expected: FAIL — `Cannot find module '@/lib/scoring'`

- [ ] **Step 3: 구현**

```ts
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
```

- [ ] **Step 4: 통과 확인 + Commit**

Run: `npm run test -- tests/scoring.test.ts`
Expected: PASS (4 tests)

```bash
git add src/lib/scoring.ts tests/scoring.test.ts && git commit -m "feat: 채점 엔진 - 답변 적용"
```

---

### Task 4: 채점 — 거리·유사도·매칭 (TDD)

**Files:**
- Modify: `src/lib/scoring.ts`, `tests/scoring.test.ts`

- [ ] **Step 1: 실패하는 테스트 추가** (`tests/scoring.test.ts`에 append)

```ts
import { distance, matchPoliticians, matchType, similarity } from '@/lib/scoring';
import type { PoliticalType, Politician, UserState } from '@/data/schema';

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
    { id: 'a', name: 'A', camp: '좌파', tagline: '', description: '', keywords: [], vector: tv({ econ: -80 }) },
    { id: 'b', name: 'B', camp: '우파', tagline: '', description: '', keywords: [], vector: tv({ econ: 80 }) },
  ];

  test('matchType은 최근접 유형을 고른다', () => {
    expect(matchType(stateWith({ econ: -60 }), types).id).toBe('a');
  });

  test('weights 덮어쓰기가 판별을 바꾼다', () => {
    // econ만으론 b에 가깝지만, a가 trust에 가중치 3을 걸면 trust가 지배
    const types2: PoliticalType[] = [
      { ...types[0], vector: tv({ econ: -20, trust: -90 }), weights: { trust: 3 } },
      { ...types[1], vector: tv({ econ: 20, trust: 80 }) },
    ];
    const s = stateWith({ econ: 30, trust: -80 });
    expect(matchType(s, types2).id).toBe('a');
  });

  const pols: Politician[] = [
    { id: 'p1', name: 'P1', party: 'X', vector: tv({ econ: -70, engage: 90 }, { fraud: 5, leejm: 20, prosec: 80, impeach: 'pro' }) },
    { id: 'p2', name: 'P2', party: 'Y', vector: tv({ econ: 60, engage: 90 }, { fraud: 5, leejm: 95, prosec: 20, impeach: 'pro' }) },
  ];

  test('matchPoliticians: 정렬 + engage 제외 + 유사도', () => {
    const s = stateWith({ econ: -50, engage: -90 }); // engage가 포함되면 둘 다 멀어짐
    const top = matchPoliticians(s, pols, 2);
    expect(top[0].politicianId).toBe('p1');
    expect(top[0].similarity).toBeGreaterThan(top[1].similarity);
    expect(top[0].similarity).toBeGreaterThan(70); // engage 제외 덕에 높아야 함
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- tests/scoring.test.ts`
Expected: FAIL — `distance is not a function` 류

- [ ] **Step 3: 구현** (`src/lib/scoring.ts`에 append)

```ts
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
  if (wsum === 0) return 1; // 답한 차원이 없으면 비교 불능 → 최대 거리
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
```

- [ ] **Step 4: 통과 확인 + Commit**

Run: `npm run test -- tests/scoring.test.ts`
Expected: PASS (전체)

```bash
git add -A && git commit -m "feat: 채점 엔진 - 거리/유사도/매칭"
```

---

### Task 5: 유형 데이터 13개

**Files:**
- Create: `src/data/types.ts`, `tests/data.test.ts`

- [ ] **Step 1: 유형 데이터 작성** (벡터는 초안 — Task 9 페르소나 테스트가 튜닝 기준)

```ts
// src/data/types.ts
import { PoliticalType } from './schema';

export const TYPES: PoliticalType[] = [
  {
    id: 'nl-jusa', name: 'NL 자주파', camp: '좌파',
    tagline: '분단이 모든 문제의 뿌리라고 믿는 사람',
    description: '한반도 문제의 근원을 외세와 분단에서 찾는다. 반미·자주·통일이 핵심 의제이고, 국가보안법 폐지를 오래된 숙제로 여긴다. 노동 의제에도 적극적이지만 우선순위는 민족 문제다.',
    keywords: ['#반미자주', '#통일우선', '#국보법폐지'],
    vector: { axes: { econ: -80, social: -40, security: -85, trust: -40, gender: -35, engage: 80 }, leejm: 55, prosec: 80 },
    weights: { security: 2 },
  },
  {
    id: 'pd-labor', name: 'PD 노동좌파', camp: '좌파',
    tagline: '계급이 먼저다. 나머지는 그 다음',
    description: '불평등과 노동 문제를 정치의 중심에 둔다. 민주당은 자본의 정당이라 보고, 진보정당의 독자 노선을 지지한다. NL의 민족주의에는 비판적이다.',
    keywords: ['#노동중심', '#반자본', '#불평등'],
    vector: { axes: { econ: -90, social: -50, security: -35, trust: -30, gender: -50, engage: 80 }, leejm: 65, prosec: 75 },
    weights: { econ: 2 },
  },
  {
    id: 'postmodern-left', name: '포스트모던 진보', camp: '좌파',
    tagline: '차별금지법 없는 민주주의는 미완성',
    description: '젠더·소수자·기후가 핵심 의제다. 거대 양당 모두 낡았다고 보지만, 사회적 소수자 의제에서는 타협하지 않는다. 올드 레프트의 마초성도 불편하다.',
    keywords: ['#차별금지법', '#젠더', '#기후위기'],
    vector: { axes: { econ: -60, social: -85, security: -35, trust: -10, gender: -90, engage: 75 }, leejm: 70, prosec: 60 },
    weights: { gender: 2, social: 1.5 },
  },
  {
    id: 'hard-leejm', name: '강성 친명 개혁파', camp: '중도좌',
    tagline: '개혁의 칼을 쥐었으면 끝까지 휘둘러야',
    description: '이재명 정부의 성공이 곧 개혁의 성공이라 믿는다. 검찰·사법·언론 개혁은 타협 없이 밀어붙여야 하고, 내부 비판자는 한가하다고 느낀다. 행동하는 지지층.',
    keywords: ['#이재명정부', '#사법개혁', '#검찰개혁'],
    vector: { axes: { econ: -50, social: -20, security: -35, trust: -25, gender: -10, engage: 90 }, leejm: 5, prosec: 90 },
    weights: { leejm: 2.5, prosec: 1.5 },
  },
  {
    id: 'prosec-reform', name: '검찰개혁 운동파', camp: '중도좌',
    tagline: '검찰 해체 전까지 이 싸움은 안 끝났다',
    description: '검찰 권력 해체가 한국 정치의 제1과제다. 윤석열 정권의 청산이 곧 정의 회복이라 보고, 친문 정서가 남아 있다. 이재명 정부엔 조건부 지지.',
    keywords: ['#검찰해체', '#윤석열청산', '#친문정서'],
    vector: { axes: { econ: -45, social: -35, security: -30, trust: -45, gender: -25, engage: 85 }, leejm: 35, prosec: 100 },
    weights: { prosec: 2.5 },
  },
  {
    id: 'moderate-lib', name: '온건 자유주의', camp: '중도좌',
    tagline: '개혁은 좋은데, 좀 차분하게 합시다',
    description: '민주당계 가치에 동의하지만 강성 팬덤 정치가 불편하다. 제도와 절차를 중시하고, 급진보다 점진을 선호한다. 비명계·제3지대에 마음이 간 적이 있다.',
    keywords: ['#합리적중도', '#제도권안정'],
    vector: { axes: { econ: -25, social: -10, security: -10, trust: 45, gender: -5, engage: 60 }, leejm: 80, prosec: 35 },
    weights: { leejm: 2, trust: 1.5 },
  },
  {
    id: 'young-merit', name: '청년 능력주의 보수', camp: '중도우',
    tagline: '공정한 경쟁, 그 이상도 이하도 바라지 않는다',
    description: '시장과 경쟁을 신뢰하고 할당제 같은 인위적 보정을 역차별로 본다. 페미니즘에 비판적이지만 태극기 부대와도 거리가 멀다. 낡은 보수가 아닌 새 보수를 원한다.',
    keywords: ['#능력주의', '#반페미', '#작은정부'],
    vector: { axes: { econ: 60, social: 5, security: 40, trust: 30, gender: 80, engage: 70 }, impeach: 'pro', fraud: 5 },
    weights: { gender: 2.5 },
  },
  {
    id: 'prag-con', name: '중도실용 보수', camp: '중도우',
    tagline: '이념은 됐고, 일 잘하는 쪽이 내 편',
    description: '먹고사는 문제가 이념보다 앞선다. 보수에 가깝지만 진영 논리가 과열되면 발을 뺀다. 외연 확장과 수도권 실용주의에 끌린다.',
    keywords: ['#수도권실용', '#외연확장', '#탈이념'],
    vector: { axes: { econ: 40, social: 10, security: 40, trust: 55, gender: 10, engage: 55 }, impeach: 'pro', fraud: 5 },
  },
  {
    id: 'pro-impeach-con', name: '찬탄 개혁보수', camp: '우파',
    tagline: '보수를 살리려면 광장과 결별해야 한다',
    description: '계엄과 탄핵 국면에서 헌정 질서를 택했다. 보수의 가치는 지키되 부정선거론·아스팔트 우파와는 선을 그어야 보수가 산다고 믿는다.',
    keywords: ['#보수재건', '#법치', '#광장과거리두기'],
    vector: { axes: { econ: 50, social: 30, security: 60, trust: 65, gender: 25, engage: 75 }, impeach: 'pro', fraud: 5 },
    weights: { impeach: 2.5, trust: 1.5 },
  },
  {
    id: 'anti-impeach-main', name: '반탄 당권 주류', camp: '우파',
    tagline: '탄핵은 잘못됐지만, 싸움은 제도 안에서',
    description: '탄핵에 반대했고 지금도 부당했다고 본다. 다만 부정선거론 같은 장외 노선보다는 당을 중심으로 야당 투쟁을 해야 한다는 입장. 현 국민의힘 주류 정서.',
    keywords: ['#반탄', '#야당투쟁', '#당정쇄신'],
    vector: { axes: { econ: 50, social: 55, security: 65, trust: 25, gender: 35, engage: 80 }, impeach: 'antiMild', fraud: 35 },
    weights: { impeach: 2.5 },
  },
  {
    id: 'plaza-right', name: '광장 우파', camp: '우파',
    tagline: '제도가 썩었으면 광장으로 나가는 수밖에',
    description: '탄핵은 무효이고 선거는 의심스럽다. 제도권 정치 전체를 불신하며 광장과 유튜브가 진짜 여론이라 믿는다. 윤어게인·부정선거 진상규명이 시대적 사명.',
    keywords: ['#부정선거', '#윤어게인', '#광화문'],
    vector: { axes: { econ: 45, social: 85, security: 80, trust: -70, gender: 55, engage: 95 }, impeach: 'yoonAgain', fraud: 95 },
    weights: { fraud: 2.5, impeach: 2, trust: 1.5 },
  },
  {
    id: 'cynic', name: '무당층 회의파', camp: '비이념',
    tagline: '둘 다 싫다는 게 왜 의견이 아닌가',
    description: '정치에 관심이 없는 게 아니다. 지금의 정치가 싫은 거다. 거대 양당 모두 기득권이라 보고, 찍을 곳이 없어서 안 찍는다. 성향은 있지만 소속은 거부한다.',
    keywords: ['#둘다싫어', '#정치혐오'],
    vector: { axes: { econ: 0, social: 0, security: 0, trust: -45, gender: 5, engage: 45 } },
    weights: { trust: 2, engage: 1.5 },
  },
  {
    id: 'apathy', name: '무관심층', camp: '비이념',
    tagline: '그 시간에 내 인생 챙기는 게 낫다',
    description: '정치 뉴스는 피곤하고, 누가 되든 내 삶은 비슷하다고 느낀다. 투표는 할 때도 있고 안 할 때도 있다. 정치보다 중요한 게 많은 사람.',
    keywords: ['#먹고살기바쁨'],
    vector: { axes: { econ: 0, social: 0, security: 0, trust: 0, gender: 0, engage: -80 } },
    weights: { engage: 3 },
  },
];

export const TYPE_MAP: Record<string, PoliticalType> = Object.fromEntries(TYPES.map((t) => [t.id, t]));
```

- [ ] **Step 2: 검증 테스트 작성**

```ts
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
```

- [ ] **Step 3: 테스트 통과 확인 + Commit**

Run: `npm run test -- tests/data.test.ts`
Expected: PASS

```bash
git add -A && git commit -m "feat: 13개 정치성향 유형 데이터"
```

---

### Task 6: 정치인 데이터 25명

**Files:**
- Create: `src/data/politicians.ts`
- Modify: `tests/data.test.ts`

- [ ] **Step 1: 정치인 데이터 작성**

⚠️ 벡터 값은 공개 발언·표결 기반 **초안**이며 페르소나 테스트(Task 9)와 사용자 검수로 조정한다. `evidence`는 선택 필드 — 대표 사례 2건만 채우고 나머지는 생략.

```ts
// src/data/politicians.ts
import { Politician } from './schema';

// engage는 정치인 매칭에서 제외되지만 스키마 일관성을 위해 80 고정.
const E = 80;

export const POLITICIANS: Politician[] = [
  // ─ 진보·민주 진영
  { id: 'lee-jm', name: '이재명', party: '더불어민주당', vector: { axes: { econ: -55, social: -20, security: -35, trust: -10, gender: -10, engage: E }, impeach: 'pro', fraud: 0, leejm: 0, prosec: 75 } },
  { id: 'jung-cr', name: '정청래', party: '더불어민주당', vector: { axes: { econ: -50, social: -25, security: -40, trust: -30, gender: -15, engage: E }, impeach: 'pro', fraud: 0, leejm: 5, prosec: 90 } },
  { id: 'park-cd', name: '박찬대', party: '더불어민주당', vector: { axes: { econ: -50, social: -20, security: -35, trust: -20, gender: -10, engage: E }, impeach: 'pro', fraud: 0, leejm: 10, prosec: 80 } },
  { id: 'cho-k', name: '조국', party: '조국혁신당', vector: { axes: { econ: -45, social: -40, security: -30, trust: -40, gender: -30, engage: E }, impeach: 'pro', fraud: 0, leejm: 30, prosec: 100 } },
  { id: 'kim-dy', name: '김동연', party: '더불어민주당', vector: { axes: { econ: -25, social: -15, security: -10, trust: 40, gender: -10, engage: E }, impeach: 'pro', fraud: 0, leejm: 70, prosec: 40 } },
  { id: 'kim-ks', name: '김경수', party: '더불어민주당', vector: { axes: { econ: -40, social: -25, security: -30, trust: 30, gender: -20, engage: E }, impeach: 'pro', fraud: 0, leejm: 55, prosec: 55 } },
  { id: 'lim-js', name: '임종석', party: '더불어민주당', vector: { axes: { econ: -40, social: -25, security: -50, trust: 20, gender: -15, engage: E }, impeach: 'pro', fraud: 0, leejm: 65, prosec: 50 } },
  { id: 'lee-ny', name: '이낙연', party: '새로운미래', vector: { axes: { econ: -20, social: 0, security: -15, trust: 50, gender: -5, engage: E }, impeach: 'pro', fraud: 0, leejm: 90, prosec: 30 } },
  // ─ 진보정당
  { id: 'kwon-yg', name: '권영국', party: '민주노동당', vector: { axes: { econ: -85, social: -55, security: -45, trust: -35, gender: -55, engage: E }, impeach: 'pro', fraud: 0, leejm: 60, prosec: 85 } },
  { id: 'kim-jy', name: '김재연', party: '진보당', vector: { axes: { econ: -80, social: -45, security: -75, trust: -45, gender: -45, engage: E }, impeach: 'pro', fraud: 0, leejm: 50, prosec: 85 } },
  { id: 'jang-hy', name: '장혜영', party: '전 정의당', vector: { axes: { econ: -65, social: -80, security: -40, trust: -15, gender: -85, engage: E }, impeach: 'pro', fraud: 0, leejm: 70, prosec: 60 } },
  // ─ 제3지대·중도
  { id: 'lee-js', name: '이준석', party: '개혁신당', vector: { axes: { econ: 60, social: 10, security: 45, trust: 25, gender: 75, engage: E }, impeach: 'pro', fraud: 5, leejm: 95, prosec: 20 } },
  { id: 'chun-hr', name: '천하람', party: '개혁신당', vector: { axes: { econ: 50, social: -5, security: 35, trust: 30, gender: 60, engage: E }, impeach: 'pro', fraud: 5, leejm: 90, prosec: 25 } },
  { id: 'ahn-cs', name: '안철수', party: '국민의힘', vector: { axes: { econ: 35, social: 5, security: 40, trust: 55, gender: 10, engage: E }, impeach: 'pro', fraud: 5, leejm: 85, prosec: 25 } },
  { id: 'oh-sh', name: '오세훈', party: '국민의힘', vector: { axes: { econ: 45, social: 25, security: 50, trust: 50, gender: 20, engage: E }, impeach: 'pro', fraud: 5, leejm: 90, prosec: 15 } },
  { id: 'yoo-sm', name: '유승민', party: '국민의힘', vector: { axes: { econ: 30, social: 20, security: 55, trust: 60, gender: 10, engage: E }, impeach: 'pro', fraud: 0, leejm: 85, prosec: 20 } },
  // ─ 보수 진영
  {
    id: 'han-dh', name: '한동훈', party: '국민의힘',
    vector: { axes: { econ: 50, social: 30, security: 60, trust: 65, gender: 25, engage: E }, impeach: 'pro', fraud: 5, leejm: 95, prosec: 10 },
    evidence: [{ tag: 'impeach', value: '찬탄', source: '2024-12 계엄 직후 탄핵 찬성 입장 표명' }],
  },
  { id: 'jang-dh', name: '장동혁', party: '국민의힘', vector: { axes: { econ: 50, social: 50, security: 65, trust: 30, gender: 35, engage: E }, impeach: 'antiMild', fraud: 30, leejm: 95, prosec: 10 } },
  { id: 'na-kw', name: '나경원', party: '국민의힘', vector: { axes: { econ: 45, social: 60, security: 65, trust: 25, gender: 40, engage: E }, impeach: 'antiMild', fraud: 35, leejm: 95, prosec: 10 } },
  { id: 'yoon-sh', name: '윤상현', party: '국민의힘', vector: { axes: { econ: 45, social: 55, security: 70, trust: 15, gender: 35, engage: E }, impeach: 'antiMild', fraud: 50, leejm: 95, prosec: 5 } },
  { id: 'kim-ms', name: '김문수', party: '국민의힘', vector: { axes: { econ: 55, social: 75, security: 75, trust: 10, gender: 45, engage: E }, impeach: 'antiMild', fraud: 55, leejm: 95, prosec: 5 } },
  { id: 'hong-jp', name: '홍준표', party: '무소속', vector: { axes: { econ: 60, social: 55, security: 70, trust: 40, gender: 50, engage: E }, impeach: 'antiMild', fraud: 10, leejm: 90, prosec: 15 } },
  // ─ 광장 우파
  {
    id: 'hwang-ka', name: '황교안', party: '무소속',
    vector: { axes: { econ: 50, social: 80, security: 80, trust: -60, gender: 50, engage: E }, impeach: 'yoonAgain', fraud: 95, leejm: 100, prosec: 0 },
    evidence: [{ tag: 'fraud', value: '수용', source: '부정선거 의혹 제기 활동 지속(2020~)' }],
  },
  { id: 'jeon-hg', name: '전한길', party: '자유통일당', vector: { axes: { econ: 40, social: 75, security: 75, trust: -75, gender: 55, engage: E }, impeach: 'yoonAgain', fraud: 100, leejm: 100, prosec: 0 } },
  { id: 'jeon-kh', name: '전광훈', party: '자유통일당', vector: { axes: { econ: 35, social: 95, security: 85, trust: -70, gender: 70, engage: E }, impeach: 'yoonAgain', fraud: 95, leejm: 100, prosec: 0 } },
];

export const POLITICIAN_MAP: Record<string, Politician> = Object.fromEntries(POLITICIANS.map((p) => [p.id, p]));
```

- [ ] **Step 2: 검증 테스트 추가** (`tests/data.test.ts`에 append)

```ts
import { POLITICIANS } from '@/data/politicians';

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
```

- [ ] **Step 3: 통과 확인 + Commit**

Run: `npm run test -- tests/data.test.ts`
Expected: PASS

```bash
git add -A && git commit -m "feat: 정치인 25명 데이터 (벡터 초안)"
```

---

### Task 7: 질문 데이터 전체

**Files:**
- Create: `src/data/questions.ts`
- Modify: `tests/data.test.ts`

- [ ] **Step 1: 질문 데이터 작성**

```ts
// src/data/questions.ts
import { AxisId, Branch, Question } from './schema';

/** 5점 리커트 헬퍼. mag>0이면 '매우 동의'가 +mag. */
const likert = (
  id: string, phase: 1 | 2 | 3, text: string, axis: AxisId, mag: number,
  extra: Partial<Question> = {},
): Question => ({
  id, phase, text,
  options: [
    { label: '매우 동의', axes: { [axis]: mag } },
    { label: '동의하는 편', axes: { [axis]: Math.round(mag / 2) } },
    { label: '보통 / 잘 모르겠다', axes: { [axis]: 0 } }, // answered 표시를 위해 0 델타 명시
    { label: '비동의하는 편', axes: { [axis]: -Math.round(mag / 2) } },
    { label: '매우 비동의', axes: { [axis]: -mag } },
  ],
  ...extra,
});

// ───────────────────────── Phase 1 (전원 공통, 9문항)
export const PHASE1: Question[] = [
  likert('q1', 1, '부유층과 대기업에 세금을 더 걷어 복지를 늘려야 한다.', 'econ', -40),
  likert('q2', 1, '정부 규제는 시장의 발목을 잡을 때가 더 많다.', 'econ', 35),
  likert('q3', 1, '차별금지법, 이제는 제정해야 한다.', 'social', -40),
  {
    id: 'q4', phase: 1, text: '명절에 친척 어른이 "요즘 세상은 너무 문란해졌어, 옛날이 좋았지"라고 한다. 나는…',
    options: [
      { label: '맞는 말씀이다. 전통과 질서가 무너지고 있다', axes: { social: 35 } },
      { label: '그런가보다 하고 넘긴다', axes: { social: 5 } },
      { label: '"세상이 변한 건데요" 하고 한마디 한다', axes: { social: -20 } },
      { label: '그 "옛날"이 누구에게 좋았는지 따져 묻고 싶다', axes: { social: -40 } },
    ],
  },
  likert('q5', 1, '북한은 대화 상대가 아니라 안보 위협이다.', 'security', 40),
  likert('q6', 1, '선거관리위원회·법원 같은 국가기관은 대체로 믿을 만하다.', 'trust', 40),
  {
    id: 'q7', phase: 1, text: '온라인에서 "한국은 여전히 여성차별 사회다"라는 글을 봤다. 나는…',
    options: [
      { label: '동의한다. 구조적 차별은 여전하다', axes: { gender: -40 } },
      { label: '일부 맞지만 과장됐다', axes: { gender: -5 } },
      { label: '이제는 역차별이 더 문제다', axes: { gender: 35 } },
      { label: '남녀 갈라치기 자체가 지겹다', axes: { gender: 10, engage: -10 } },
    ],
  },
  {
    id: 'q8', phase: 1, text: '정치 뉴스, 얼마나 챙겨보나?',
    options: [
      { label: '거의 실시간. 커뮤니티·유튜브까지 본다', axes: { engage: 45 } },
      { label: '주요 뉴스는 챙겨본다', axes: { engage: 15 } },
      { label: '큰일 터졌을 때만', axes: { engage: -25 } },
      { label: '일부러 안 본다. 피곤하다', axes: { engage: -55 } },
    ],
  },
  {
    id: 'q9', phase: 1, text: '내일이 총선이라면, 그나마 마음이 가는 쪽은?',
    options: [
      { label: '더불어민주당', routeBonus: -25, axes: { engage: 5 } },
      { label: '조국혁신당·진보당 등 범진보 정당', routeBonus: -25, axes: { econ: -10 } },
      { label: '국민의힘', routeBonus: 25, axes: { engage: 5 } },
      { label: '개혁신당', routeBonus: 10, axes: { gender: 10 } },
      { label: '자유통일당 등 그 외 우파 정당', routeBonus: 25, axes: { social: 15, trust: -10 } },
      { label: '없다 / 모르겠다', routeBonus: 0, axes: { trust: -10 } },
    ],
  },
];

// ───────────────────────── Phase 2 — 좌향 (6문항)
export const LEFT: Question[] = [
  {
    id: 'l1', phase: 2, branch: 'left', text: '이재명 대통령, 국정운영을 잘하고 있다.',
    options: [
      { label: '매우 동의', leejm: -45 },
      { label: '동의하는 편', leejm: -20 },
      { label: '보통', leejm: 0 },
      { label: '비동의하는 편', leejm: 25 },
      { label: '매우 비동의', leejm: 45 },
    ],
  },
  {
    id: 'l2', phase: 2, branch: 'left', text: '검찰 권력은 아직도 너무 세다. 더 강하게 개혁해야 한다.',
    options: [
      { label: '매우 동의. 해체 수준으로', prosec: 45, axes: { trust: -10 } },
      { label: '동의하는 편', prosec: 20 },
      { label: '보통', prosec: 0 },
      { label: '이미 충분하다', prosec: -20 },
      { label: '개혁이라는 이름의 보복이다', prosec: -45, axes: { trust: 10 } },
    ],
  },
  {
    id: 'l3', phase: 2, branch: 'left', text: '당 지도부를 공개 비판하는 민주당 의원을 보면…',
    options: [
      { label: '내부총질이다. 지금은 단결할 때', leejm: -25, axes: { engage: 10 } },
      { label: '비판도 필요하지만 시기가 안 좋다', leejm: -5 },
      { label: '건강한 다양성이다', leejm: 20 },
      { label: '그 의원이 차라리 낫다', leejm: 35 },
    ],
  },
  {
    id: 'l4', phase: 2, branch: 'left', text: '내 마음에 가장 가까운 의제는?',
    options: [
      { label: '자주외교·남북관계 개선', axes: { security: -40 } },
      { label: '노동권·불평등 해소', axes: { econ: -35 } },
      { label: '성평등·소수자 인권', axes: { gender: -35, social: -25 } },
      { label: '기후위기 대응', axes: { social: -20, econ: -15 } },
      { label: '이재명 정부의 성공', leejm: -20, axes: { engage: 10 } },
      { label: '이념보다 민생·실용', axes: { trust: 15 } },
    ],
  },
  likert('l5', 2, '민주당은 페미니즘 이슈에 더 적극적이어야 한다.', 'gender', -35, { branch: 'left' }),
  {
    id: 'l6', phase: 2, branch: 'left', text: '총선에서 우리 지역 민주당 후보가 영 별로라면…',
    options: [
      { label: '그래도 민주당. 1번 사수', leejm: -20 },
      { label: '진보당·노동당 등 진보정당에 투표', axes: { econ: -25, social: -15 } },
      { label: '인물 보고 제3지대도 가능', leejm: 20, axes: { trust: 10 } },
      { label: '그날 기분에 따라', axes: { engage: -20 } },
    ],
  },
];

// ───────────────────────── Phase 2 — 우향 (관문 1 + 분기 2~3 + 공통 3)
export const RIGHT_GATE: Question = {
  id: 'r1', phase: 2, branch: 'right', text: '윤석열 전 대통령 탄핵, 지금 어떻게 평가하나?',
  options: [
    { label: '계엄은 잘못이었고, 탄핵은 불가피했다', impeach: 'pro', axes: { trust: 10 } },
    { label: '아쉽지만 헌재 결정은 존중한다. 이제 미래로', impeach: 'antiMild' },
    { label: '탄핵은 무효다. 윤 대통령은 돌아와야 한다', impeach: 'yoonAgain', axes: { trust: -20 } },
    { label: '잘 모르겠다 / 판단 유보', axes: { engage: -10 } },
  ],
};

export const RIGHT_ANTI: Question[] = [
  {
    id: 'r2', phase: 2, branch: 'rightAnti', text: '부정선거 의혹, 어떻게 보나?',
    options: [
      { label: '근거 없는 음모론이다', fraud: -40, axes: { trust: 10 } },
      { label: '의심스러운 대목이 있다. 검증은 필요하다', fraud: 15, axes: { trust: -10 } },
      { label: '사실상 확신한다. 진상규명이 최우선이다', fraud: 45, axes: { trust: -30 } },
    ],
  },
  {
    id: 'r3', phase: 2, branch: 'rightAnti', text: '광화문 집회에 대해 나는…',
    options: [
      { label: '참여한다 / 참여하고 싶다', axes: { engage: 25, social: 15 }, fraud: 10 },
      { label: '마음은 같지만 방식은 부담스럽다', axes: { social: 5 } },
      { label: '그런 방식은 보수에 해롭다', axes: { social: -10 }, fraud: -15 },
    ],
  },
];

export const RIGHT_PRO: Question[] = [
  {
    id: 'r2p', phase: 2, branch: 'rightPro', text: '태극기·광화문 세력과 보수의 관계, 어때야 하나?',
    options: [
      { label: '함께 가야 할 우군이다', axes: { social: 25, trust: -15 } },
      { label: '전략적으로만 함께한다', axes: { social: 10 } },
      { label: '선을 그어야 보수가 산다', axes: { trust: 20, social: -10 } },
    ],
  },
];

export const RIGHT_COMMON: Question[] = [
  {
    id: 'r4', phase: 2, branch: 'right', text: '경제를 살리려면?',
    options: [
      { label: '감세와 규제 완화가 우선', axes: { econ: 35 } },
      { label: '재정을 풀어서라도 경기 부양', axes: { econ: -10 } },
      { label: '공정한 시장 질서 확립이 먼저', axes: { econ: 5, trust: 10 } },
      { label: '복지 확대도 병행해야', axes: { econ: -25 } },
    ],
  },
  {
    id: 'r5', phase: 2, branch: 'right', text: '여성가족부 부활 같은 젠더 이슈에서 나는…',
    options: [
      { label: '반페미 기조가 맞다', axes: { gender: 40 } },
      { label: '역차별 시정은 필요하나 표현은 신중히', axes: { gender: 15 } },
      { label: '성평등 정책 자체는 필요하다', axes: { gender: -20 } },
      { label: '관심 없는 주제다', axes: { engage: -15 } },
    ],
  },
  {
    id: 'r6', phase: 2, branch: 'right', text: '국민의힘에 대해 솔직히 말하면…',
    options: [
      { label: '내 당이다. 비판도 안에서 한다', axes: { engage: 15 } },
      { label: '지지하지만 한심할 때가 많다', axes: { trust: -5 } },
      { label: '보수 가치는 지지하지만 당은 글쎄', axes: { trust: 5 } },
      { label: '당보다 인물과 운동이 중요하다', axes: { engage: 10, trust: -15 } },
    ],
  },
];

// ───────────────────────── Phase 2 — 중도 (6문항)
export const CENTER: Question[] = [
  {
    id: 'c1', phase: 2, branch: 'center', text: '선거날의 나는…',
    options: [
      { label: '무조건 투표한다', axes: { engage: 30 } },
      { label: '괜찮은 후보가 있으면 한다', axes: { engage: 5 } },
      { label: '잘 안 가게 된다', axes: { engage: -30 } },
      { label: '정치 얘기 자체가 싫다', axes: { engage: -50 } },
    ],
  },
  {
    id: 'c2', phase: 2, branch: 'center', text: '거대 양당이 싫다면, 그 이유는?',
    options: [
      { label: '다 기득권이다. 그놈이 그놈', axes: { trust: -35 } },
      { label: '무능해서. 일을 못한다', axes: { trust: -15 } },
      { label: '진영싸움에 민생이 없다', axes: { trust: -20 } },
      { label: '싫다기보다 관심이 없다', axes: { engage: -30 } },
    ],
  },
  {
    id: 'c3', phase: 2, branch: 'center', text: '여성할당제·청년할당제 같은 제도는…',
    options: [
      { label: '역차별이다. 능력대로 뽑아야 한다', axes: { gender: 35, econ: 15 } },
      { label: '취지는 알지만 부작용이 크다', axes: { gender: 15 } },
      { label: '아직 필요한 보정장치다', axes: { gender: -25 } },
      { label: '관심 없는 주제다', axes: { engage: -15 } },
    ],
  },
  {
    id: 'c4', phase: 2, branch: 'center', text: '지지 정당 없이 사는 이유에 가장 가까운 것은?',
    options: [
      { label: '정책 보고 그때그때 고른다', axes: { trust: 10, engage: 15 } },
      { label: '찍을 데가 없다', axes: { trust: -25 } },
      { label: '정치가 내 삶을 못 바꾼다', axes: { trust: -20, engage: -25 } },
      { label: '원래 무리 짓는 게 싫다', axes: { trust: -5 } },
    ],
  },
  {
    id: 'c5', phase: 2, branch: 'center', text: '세금과 복지, 굳이 고르라면?',
    options: [
      { label: '세금 줄이고 각자 알아서', axes: { econ: 35 } },
      { label: '지금 수준 유지', axes: { econ: 5 } },
      { label: '세금 더 내도 복지 확대', axes: { econ: -35 } },
      { label: '모르겠다', axes: { engage: -10 } },
    ],
  },
  {
    id: 'c6', phase: 2, branch: 'center', text: '정치인에게 제일 중요한 자질은?',
    options: [
      { label: '유능함. 결과로 말하라', axes: { trust: 5, engage: 10 } },
      { label: '도덕성', axes: { trust: 15 } },
      { label: '소신과 이념', axes: { engage: 20 } },
      { label: '우리 동네를 챙기는 것', axes: { engage: -10 } },
    ],
  },
];

// ───────────────────────── Phase 2 — 무관심 트랙 (3문항)
export const APATHY: Question[] = [
  {
    id: 'a1', phase: 2, branch: 'apathy', text: '정치 얘기가 싫은 이유는?',
    options: [
      { label: '맨날 싸움만 해서', axes: { trust: -20 } },
      { label: '내 삶과 상관없어서', axes: { engage: -25 } },
      { label: '너무 어려워서', axes: { engage: -15 } },
      { label: '사실 아주 싫진 않다', axes: { engage: 15 } },
    ],
  },
  {
    id: 'a2', phase: 2, branch: 'apathy', text: '그래도 투표는…',
    options: [
      { label: '한다. 의무니까', axes: { engage: 20 } },
      { label: '할 때도 있다', axes: { engage: 0 } },
      { label: '거의 안 한다', axes: { engage: -25 } },
    ],
  },
  {
    id: 'a3', phase: 2, branch: 'apathy', text: '뉴스에서 그나마 눈이 가는 주제는?',
    options: [
      { label: '부동산·경제', axes: { econ: 10 } },
      { label: '사건사고', axes: { engage: 0 } },
      { label: '연예·스포츠', axes: { engage: -10 } },
      { label: '대선 같은 정치 빅이벤트는 본다', axes: { engage: 15 } },
    ],
  },
];

// ───────────────────────── Phase 3 — 확정 심화 풀 (6문항, 3개 선택됨)
export const PHASE3_POOL: Question[] = [
  likert('p1', 3, '부동산 보유세는 더 강화해야 한다.', 'econ', -35, { target: 'econ' }),
  likert('p2', 3, '국가보안법은 폐지해야 한다.', 'social', -35, { target: 'social' }),
  likert('p3', 3, '우리나라 선거 시스템은 세계적으로 공정한 편이다.', 'trust', 35, { target: 'trust' }),
  likert('p4', 3, '페미니즘은 결국 평등을 위한 운동이다.', 'gender', -35, { target: 'gender' }),
  likert('p5', 3, '주한미군은 단계적으로 줄여나가야 한다.', 'security', -35, { target: 'security' }),
  likert('p6', 3, '법원 판결은 대체로 공정하다.', 'trust', 30, { target: 'trust' }),
];

export const ALL_QUESTIONS: Question[] = [
  ...PHASE1, ...LEFT, RIGHT_GATE, ...RIGHT_ANTI, ...RIGHT_PRO, ...RIGHT_COMMON, ...CENTER, ...APATHY, ...PHASE3_POOL,
];
export const QUESTION_MAP: Record<string, Question> = Object.fromEntries(ALL_QUESTIONS.map((q) => [q.id, q]));
export const ROUTER_QUESTION_ID = 'q9';
```

- [ ] **Step 2: 검증 테스트 추가** (`tests/data.test.ts`에 append)

```ts
import { ALL_QUESTIONS, PHASE1, PHASE3_POOL } from '@/data/questions';

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
```

- [ ] **Step 3: 통과 확인 + Commit**

Run: `npm run test -- tests/data.test.ts`
Expected: PASS

```bash
git add -A && git commit -m "feat: 질문 데이터 전체 (Phase 1~3 + 분기)"
```

---

### Task 8: 엔진 — replay·라우팅·다음 질문 (TDD)

**Files:**
- Create: `src/lib/engine.ts`, `tests/engine.test.ts`

핵심 규칙:
- 라우팅은 **Phase 1 답변만으로** 계산해 고정 (Phase 2 답이 라우트를 흔들지 않게).
- Phase 3 선택은 **Phase 1+2 답변까지의 상태**로 고정 (Phase 3 답이 선택 집합을 흔들지 않게).
- `engage ≤ -50`(Phase 1 기준)이면 무관심 트랙.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// tests/engine.test.ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- tests/engine.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현**

```ts
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
    .map((q) => ({ q, diff: Math.abs(t1.vector.axes[q.target!] - t2.vector.axes[q.target!]) }))
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

export function computeResult(answers: Answer[]): TestResult {
  const state = replay(answers); // 존재하지 않는 질문이면 여기서 throw
  const type = matchType(state, TYPES);
  const top = matchPoliticians(state, POLITICIANS, 3);
  return { typeId: type.id, state, top };
}
```

- [ ] **Step 4: 통과 확인 + Commit**

Run: `npm run test -- tests/engine.test.ts`
Expected: PASS. (라우트 임계값 ±18로 좌/우/중도 케이스가 안 갈리면 테스트가 아니라 **q1~q9 델타 합을 다시 계산**해서 LEFT_P1/RIGHT_P1 인덱스 또는 임계값을 조정)

```bash
git add -A && git commit -m "feat: 엔진 - 라우팅/적응형 다음 질문/결과 계산"
```

---

### Task 9: 페르소나 골든 테스트 13종

**Files:**
- Create: `tests/personas.test.ts`

이 테스트가 **데이터 튜닝의 기준**이다. 실패하면 엔진이 아니라 보통 데이터(유형 벡터, 가중치, 질문 델타)를 고친다.

- [ ] **Step 1: 페르소나 테스트 작성**

```ts
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
      l1: 3, l2: 1, l3: 3, l4: 1, l5: 0, l6: 1,
      p1: 0, p2: 1, p3: 3, p4: 0, p5: 1, p6: 3,
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
      l1: 0, l2: 0, l3: 0, l4: 4, l5: 2, l6: 0,
      p1: 1, p2: 1, p3: 1, p4: 2, p5: 2, p6: 4,
    });
    expectType(r, 'hard-leejm');
    expect(r.top[0].politicianId).toBe('lee-jm');
  });

  test('검찰개혁 운동파 → prosec-reform, 조국 top3', () => {
    const r = run({
      q1: 1, q2: 3, q3: 0, q4: 2, q5: 3, q6: 4, q7: 1, q8: 0, q9: 1,
      l1: 1, l2: 0, l3: 1, l4: 4, l5: 1, l6: 0,
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
      // 라우트가 right로 갈 수 있으므로 right 분기 답도 정의
      r1: 0, r2p: 2, r4: 0, r5: 0, r6: 3,
      // center로 갈 경우 대비
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
```

- [ ] **Step 2: 실행 → 실패 시 튜닝 루프**

Run: `npm run test -- tests/personas.test.ts`

**실패는 예상된 작업이다.** 실패한 페르소나마다:
1. 테스트 출력에서 실제 매칭된 유형/정치인을 확인 (`expectTop3`의 메시지에 top3가 찍힘. 유형 디버깅엔 테스트에 임시 `console.log(r.typeId, r.state.axes, r.state.stances)` 추가)
2. 원인 판단 우선순위: ① 유형 벡터가 페르소나의 도달 가능한 상태와 동떨어짐 → `types.ts` 수정 ② 경쟁 유형과 변별이 안 됨 → 해당 유형 `weights` 조정 ③ 질문 델타가 약함 → `questions.ts` 델타 조정 ④ 페르소나 답 자체가 유형과 어긋남 → 테스트의 choices 수정
3. **engine/scoring 코드는 건드리지 않는다** (Task 3·4·8 테스트가 보증)

전부 통과할 때까지 반복. 13개 모두 PASS가 이 태스크의 완료 조건.

- [ ] **Step 3: 전체 테스트 + Commit**

Run: `npm run test`
Expected: 전체 PASS

```bash
git add -A && git commit -m "test: 13유형 페르소나 골든 테스트 + 데이터 튜닝"
```

---

### Task 10: Supabase + Drizzle

**Files:**
- Create: `src/db/schema.ts`, `src/db/client.ts`, `drizzle.config.ts`, `.env.local`(수동)

- [ ] **Step 1: ⚠️ 사람 체크포인트 — Supabase 프로젝트**

사용자에게 요청: [supabase.com](https://supabase.com)에서 프로젝트 생성 → Settings > Database > Connection string의 **Session pooler URI**를 `.env.local`의 `DATABASE_URL`로. `IP_SALT`엔 아무 랜덤 문자열. (`.env.local`은 .gitignore에 이미 포함됨 — 커밋 금지)

- [ ] **Step 2: Drizzle 스키마 + 클라이언트**

```ts
// src/db/schema.ts
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const results = pgTable('results', {
  id: uuid('id').defaultRandom().primaryKey(),
  typeId: text('type_id').notNull(),
  vector: jsonb('vector').notNull(),           // UserState
  topPoliticians: jsonb('top_politicians').notNull(), // MatchResult[]
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  resultId: uuid('result_id').references(() => results.id).notNull(),
  nickname: text('nickname').notNull(),
  passwordHash: text('password_hash').notNull(),
  body: text('body').notNull(),
  ipHash: text('ip_hash').notNull(),
  deleted: boolean('deleted').default(false).notNull(),
  reportCount: integer('report_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

```ts
// src/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client);
```

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

- [ ] **Step 3: 마이그레이션 푸시 + 확인**

Run: `npm run db:push` (drizzle-kit이 .env.local을 못 읽으면 `DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d= -f2-) npm run db:push`)
Expected: `results`, `comments` 테이블 생성. Supabase 대시보드 Table Editor에서 확인.

- [ ] **Step 4: Commit**

```bash
git add src/db drizzle.config.ts && git commit -m "feat: Drizzle 스키마 + Supabase 연결"
```

---

### Task 11: Server Actions — 결과 저장·조회

**Files:**
- Create: `src/app/actions.ts`

- [ ] **Step 1: 구현**

```ts
// src/app/actions.ts
'use server';

import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { headers } from 'next/headers';
import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { comments, results } from '@/db/schema';
import { computeResult } from '@/lib/engine';
import { QUESTION_MAP } from '@/data/questions';
import { BANNED_WORDS } from '@/data/moderation';
import type { Answer, MatchResult, UserState } from '@/data/schema';

// ── 결과
export async function submitTest(answers: Answer[]): Promise<{ ok: true; id: string } | { ok: false }> {
  try {
    if (!Array.isArray(answers) || answers.length === 0 || answers.length > 30) return { ok: false };
    for (const a of answers) {
      const q = QUESTION_MAP[a.questionId];
      if (!q || !Number.isInteger(a.optionIndex) || !q.options[a.optionIndex]) return { ok: false };
    }
    const r = computeResult(answers); // 서버 재계산 (조작 방지)
    const [row] = await db
      .insert(results)
      .values({ typeId: r.typeId, vector: r.state, topPoliticians: r.top })
      .returning({ id: results.id });
    return { ok: true, id: row.id };
  } catch {
    return { ok: false }; // DB 장애 → 클라이언트가 로컬 결과로 강등
  }
}

export interface StoredResult {
  id: string;
  typeId: string;
  state: UserState;
  top: MatchResult[];
  samePct: number; // 같은 유형 비율 %
}

export async function getResult(id: string): Promise<StoredResult | null> {
  try {
    const [row] = await db.select().from(results).where(eq(results.id, id));
    if (!row) return null;
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(results);
    const [{ same }] = await db
      .select({ same: sql<number>`count(*)::int` })
      .from(results)
      .where(eq(results.typeId, row.typeId));
    return {
      id: row.id,
      typeId: row.typeId,
      state: row.vector as UserState,
      top: row.topPoliticians as MatchResult[],
      samePct: total > 0 ? Math.round((same / total) * 1000) / 10 : 100,
    };
  } catch {
    return null;
  }
}
```

(댓글 액션은 Task 14에서 같은 파일에 추가)

`src/data/moderation.ts` 생성:

```ts
// src/data/moderation.ts — 금칙어. 운영하며 확장.
export const BANNED_WORDS: string[] = ['시발', '씨발', '병신', '좆'];
```

- [ ] **Step 2: 타입체크 + Commit**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (BANNED_WORDS는 Task 14 전까지 미사용 — eslint unused 경고가 나면 import 줄을 Task 14로 미룬다)

```bash
git add -A && git commit -m "feat: 결과 저장/조회 server actions"
```

---

### Task 12: 테스트 플로우 UI

**Files:**
- Create: `src/app/test/page.tsx`
- Modify: `src/app/globals.css` (스캐폴드 기본 유지)

- [ ] **Step 1: 구현**

```tsx
// src/app/test/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { computeResult, estimateTotal, getNextQuestion } from '@/lib/engine';
import { submitTest } from '@/app/actions';
import type { Answer, TestResult } from '@/data/schema';
import ResultView from '@/components/ResultView';

const STORAGE_KEY = 'pg_progress';

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [localResult, setLocalResult] = useState<TestResult | null>(null); // DB 강등 시
  const restored = useRef(false);

  // 새로고침 복원
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setAnswers(JSON.parse(saved));
    } catch { /* 무시 */ }
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch { /* 무시 */ }
  }, [answers]);

  const question = getNextQuestion(answers);

  async function finish(final: Answer[]) {
    setSubmitting(true);
    const res = await submitTest(final);
    sessionStorage.removeItem(STORAGE_KEY);
    if (res.ok) {
      try { localStorage.setItem('pg_result_id', res.id); } catch { /* 무시 */ }
      router.push(`/r/${res.id}`);
    } else {
      setLocalResult(computeResult(final)); // 우아한 강등: 저장 실패해도 결과는 보여줌
      setSubmitting(false);
    }
  }

  function answer(optionIndex: number) {
    const next = [...answers, { questionId: question!.id, optionIndex }];
    if (getNextQuestion(next) === null) void finish(next);
    else setAnswers(next);
  }

  if (localResult) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          일시적인 오류로 결과를 저장하지 못했어요. 결과는 아래에서 확인할 수 있지만 링크 공유와 댓글은 불가합니다.
        </p>
        <ResultView typeId={localResult.typeId} state={localResult.state} top={localResult.top} />
      </main>
    );
  }

  if (submitting || !question) {
    return <main className="flex min-h-screen items-center justify-center text-zinc-500">결과 계산 중…</main>;
  }

  const total = estimateTotal(answers);
  const progress = Math.min(99, Math.round((answers.length / total) * 100));

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-zinc-500">
          <span>Q{answers.length + 1}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-200">
          <div className="h-1.5 rounded-full bg-zinc-900 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h1 className="mb-8 text-xl font-bold leading-relaxed">{question.text}</h1>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            data-testid="option"
            onClick={() => answer(i)}
            className="rounded-xl border border-zinc-200 px-5 py-4 text-left transition hover:border-zinc-900 hover:bg-zinc-50"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {answers.length > 0 && (
        <button
          onClick={() => setAnswers(answers.slice(0, -1))}
          className="mt-8 self-start text-sm text-zinc-400 hover:text-zinc-600"
        >
          ← 이전 질문으로
        </button>
      )}
    </main>
  );
}
```

뒤로가기는 마지막 답을 pop — replay 기반이라 이후 상태는 자동 재계산된다.

- [ ] **Step 2: ResultView·RadarChart 스텁 없이는 빌드가 깨지므로 Task 13의 컴포넌트를 먼저 만들거나, 이 시점에서는 아래 최소 버전을 생성**

```tsx
// src/components/ResultView.tsx — Task 13에서 완성. 일단 최소 버전.
import type { MatchResult, UserState } from '@/data/schema';
import { TYPE_MAP } from '@/data/types';

export default function ResultView({ typeId, state, top }: { typeId: string; state: UserState; top: MatchResult[] }) {
  const type = TYPE_MAP[typeId];
  return <div>{type?.name}</div>;
}
```

- [ ] **Step 3: 빌드 + 수동 확인 + Commit**

Run: `npm run build`
Expected: 성공

Run: `npm run dev` 후 http://localhost:3000/test 에서 3~4문항 클릭, 새로고침 복원·이전 버튼 동작 확인.

```bash
git add -A && git commit -m "feat: 테스트 플로우 UI (적응형 진행/복원/뒤로가기)"
```

---

### Task 13: 결과 페이지 + 레이더 차트 + OG

**Files:**
- Create: `src/app/r/[id]/page.tsx`, `src/app/r/[id]/opengraph-image.tsx`, `src/components/RadarChart.tsx`, `src/app/not-found.tsx`
- Modify: `src/components/ResultView.tsx` (완성), `src/app/layout.tsx` (메타데이터)

- [ ] **Step 1: RadarChart**

```tsx
// src/components/RadarChart.tsx — 6축 레이더. -100~100 → 0~1 반지름.
import { AXES, AxisId } from '@/data/schema';

const LABELS: Record<AxisId, string> = {
  econ: '시장', social: '전통', security: '안보강경', trust: '제도신뢰', gender: '반페미', engage: '정치관여',
};

export default function RadarChart({ axes }: { axes: Record<AxisId, number> }) {
  const cx = 150, cy = 150, R = 110;
  const pt = (i: number, r: number) => {
    const ang = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r] as const;
  };
  const poly = AXES.map((a, i) => pt(i, ((axes[a] + 100) / 200) * R).join(',')).join(' ');
  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-sm">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={AXES.map((_, i) => pt(i, R * f).join(',')).join(' ')}
          fill="none" stroke="#e4e4e7" strokeWidth="1" />
      ))}
      {AXES.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e4e4e7" strokeWidth="1" />;
      })}
      <polygon points={poly} fill="rgba(24,24,27,0.15)" stroke="#18181b" strokeWidth="2" />
      {AXES.map((a, i) => {
        const [x, y] = pt(i, R + 22);
        return (
          <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-zinc-500 text-[11px]">
            {LABELS[a]}
          </text>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: ResultView 완성**

```tsx
// src/components/ResultView.tsx
import type { MatchResult, UserState } from '@/data/schema';
import { TYPE_MAP } from '@/data/types';
import { POLITICIAN_MAP } from '@/data/politicians';
import RadarChart from './RadarChart';

const NO_MATCH_TYPES = new Set(['cynic', 'apathy']);

export default function ResultView({
  typeId, state, top, samePct,
}: { typeId: string; state: UserState; top: MatchResult[]; samePct?: number }) {
  const type = TYPE_MAP[typeId];
  if (!type) return null;
  const soft = NO_MATCH_TYPES.has(typeId);

  return (
    <div className="flex flex-col gap-10">
      <section className="text-center">
        <p className="text-sm text-zinc-500">{type.camp}</p>
        <h1 className="mt-1 text-3xl font-extrabold" data-testid="type-name">{type.name}</h1>
        <p className="mt-2 text-zinc-600">“{type.tagline}”</p>
        <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-left leading-relaxed text-zinc-700">{type.description}</p>
        <p className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-zinc-500">
          {type.keywords.map((k) => <span key={k} className="rounded-full bg-zinc-100 px-3 py-1">{k}</span>)}
        </p>
        {samePct !== undefined && (
          <p className="mt-4 text-sm text-zinc-500">전체 응답자 중 <b>{samePct}%</b>가 당신과 같은 유형이에요</p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">{soft ? '그나마 가까운 정치인' : '나와 가장 가까운 정치인'}</h2>
        <ol className="flex flex-col gap-3">
          {top.map((m, i) => {
            const p = POLITICIAN_MAP[m.politicianId];
            if (!p) return null;
            return (
              <li key={m.politicianId} className="flex items-center justify-between rounded-xl border border-zinc-200 px-5 py-4">
                <span>
                  <b className="mr-2">{i + 1}위 {p.name}</b>
                  <span className="text-sm text-zinc-500">{p.party}</span>
                  {p.evidence?.length ? (
                    <details className="mt-1 text-xs text-zinc-500">
                      <summary className="cursor-pointer">태깅 근거</summary>
                      <ul className="mt-1 list-disc pl-4">
                        {p.evidence.map((e, j) => <li key={j}>{e.tag}: {e.value} — {e.source}</li>)}
                      </ul>
                    </details>
                  ) : null}
                </span>
                <b className="text-xl">{m.similarity}%</b>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">내 성향 프로필</h2>
        <RadarChart axes={state.axes} />
      </section>
    </div>
  );
}
```

- [ ] **Step 3: 결과 페이지 + 메타데이터 + not-found**

```tsx
// src/app/r/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResult } from '@/app/actions';
import { TYPE_MAP } from '@/data/types';
import ResultView from '@/components/ResultView';
import Comments from '@/components/Comments';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const r = await getResult(id);
  const name = r ? TYPE_MAP[r.typeId]?.name : undefined;
  return {
    title: name ? `나는 "${name}" | 정치성향 테스트` : '정치성향 테스트',
    description: '17문항으로 알아보는 나의 정치 유형과 가장 가까운 정치인',
  };
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  const r = await getResult(id);
  if (!r) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <ResultView typeId={r.typeId} state={r.state} top={r.top} samePct={r.samePct} />
      <div className="mt-10 flex justify-center gap-3">
        <Link href="/test" className="rounded-xl border border-zinc-300 px-5 py-3 text-sm">나도 테스트하기</Link>
        <Link href="/stats" className="rounded-xl border border-zinc-300 px-5 py-3 text-sm">전체 통계 보기</Link>
      </div>
      <Comments resultId={r.id} />
    </main>
  );
}
```

```tsx
// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-zinc-500">결과를 찾을 수 없어요.</p>
      <Link href="/test" className="rounded-xl bg-zinc-900 px-6 py-3 text-white">테스트 하러 가기</Link>
    </main>
  );
}
```

`src/app/layout.tsx`의 metadata를 수정: `title: '정치성향 테스트 — 나와 가장 가까운 정치인은?'`, `description: '17문항으로 알아보는 세분화된 나의 정치 유형'`.

(Comments 컴포넌트는 Task 14에서 작성 — 이 시점엔 빌드를 위해 빈 스텁 생성:)

```tsx
// src/components/Comments.tsx — Task 14에서 완성
export default function Comments({ resultId }: { resultId: string }) {
  return null;
}
```

- [ ] **Step 4: OG 이미지** (폰트 다운로드 후 동적 생성)

```bash
curl -L -o src/app/r/\[id\]/Pretendard-Bold.otf "https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/public/static/Pretendard-Bold.otf"
```

```tsx
// src/app/r/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getResult } from '@/app/actions';
import { TYPE_MAP } from '@/data/types';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getResult(id);
  const type = r ? TYPE_MAP[r.typeId] : undefined;
  const font = await fetch(new URL('./Pretendard-Bold.otf', import.meta.url)).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#18181b', color: 'white',
        fontFamily: 'Pretendard',
      }}>
        <div style={{ fontSize: 36, color: '#a1a1aa' }}>정치성향 테스트</div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 24 }}>{type?.name ?? '나의 정치 유형은?'}</div>
        {type && <div style={{ fontSize: 40, color: '#d4d4d8', marginTop: 20 }}>“{type.tagline}”</div>}
      </div>
    ),
    { ...size, fonts: [{ name: 'Pretendard', data: font, weight: 700 }] },
  );
}
```

- [ ] **Step 5: 빌드 + 수동 확인 + Commit**

Run: `npm run build` → 성공.
`npm run dev`에서 테스트 완주 → `/r/[id]` 결과 확인, `/r/없는id` → 404 확인. 브라우저로 `/r/[실제id]/opengraph-image` 접근해 이미지 렌더 확인.

```bash
git add -A && git commit -m "feat: 결과 페이지 + 레이더 차트 + OG 이미지"
```

---

### Task 14: 댓글 시스템

**Files:**
- Modify: `src/app/actions.ts` (댓글 액션 추가), `src/components/Comments.tsx` (완성)

- [ ] **Step 1: 댓글 server actions** (`src/app/actions.ts`에 append)

```ts
// ── 댓글
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pw, salt, 32).toString('hex')}`;
}

function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(pw, salt, 32);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return sha256(ip + (process.env.IP_SALT ?? ''));
}

export interface CommentView {
  id: string;
  nickname: string;
  body: string;
  createdAt: string;
  badge: { typeName: string; politicianName: string; similarity: number } | null;
}

export async function addComment(input: {
  resultId: string; nickname: string; password: string; body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const nickname = input.nickname.trim();
  const body = input.body.trim();
  if (nickname.length < 1 || nickname.length > 12) return { ok: false, error: '닉네임은 1~12자' };
  if (input.password.length < 4) return { ok: false, error: '비밀번호는 4자 이상' };
  if (body.length < 1 || body.length > 500) return { ok: false, error: '내용은 1~500자' };
  if (BANNED_WORDS.some((w) => body.includes(w) || nickname.includes(w))) {
    return { ok: false, error: '금칙어가 포함되어 있어요' };
  }
  try {
    const [resultRow] = await db.select({ id: results.id }).from(results).where(eq(results.id, input.resultId));
    if (!resultRow) return { ok: false, error: '테스트 결과가 필요해요' };

    const ipHash = await clientIpHash();
    const oneMinAgo = new Date(Date.now() - 60_000);
    const [{ recent }] = await db
      .select({ recent: sql<number>`count(*)::int` })
      .from(comments)
      .where(and(eq(comments.ipHash, ipHash), gt(comments.createdAt, oneMinAgo)));
    if (recent >= 3) return { ok: false, error: '너무 빨라요. 잠시 후 다시 시도해주세요' };

    await db.insert(comments).values({
      resultId: input.resultId, nickname, body,
      passwordHash: hashPassword(input.password), ipHash,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: '일시적인 오류로 댓글을 등록하지 못했어요' };
  }
}

export async function deleteComment(id: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const [row] = await db.select().from(comments).where(eq(comments.id, id));
    if (!row || row.deleted) return { ok: false, error: '댓글이 없어요' };
    if (!verifyPassword(password, row.passwordHash)) return { ok: false, error: '비밀번호가 달라요' };
    await db.update(comments).set({ deleted: true }).where(eq(comments.id, id));
    return { ok: true };
  } catch {
    return { ok: false, error: '일시적인 오류' };
  }
}

export async function reportComment(id: string): Promise<{ ok: boolean }> {
  try {
    await db.update(comments).set({ reportCount: sql`${comments.reportCount} + 1` }).where(eq(comments.id, id));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function listComments(): Promise<CommentView[]> {
  try {
    const rows = await db
      .select({
        id: comments.id, nickname: comments.nickname, body: comments.body,
        createdAt: comments.createdAt, typeId: results.typeId, topPoliticians: results.topPoliticians,
      })
      .from(comments)
      .leftJoin(results, eq(comments.resultId, results.id))
      .where(eq(comments.deleted, false))
      .orderBy(desc(comments.createdAt))
      .limit(100);

    const { TYPE_MAP } = await import('@/data/types');
    const { POLITICIAN_MAP } = await import('@/data/politicians');
    return rows.map((r) => {
      const top = (r.topPoliticians as MatchResult[] | null)?.[0];
      const typeName = r.typeId ? TYPE_MAP[r.typeId]?.name : undefined;
      const pol = top ? POLITICIAN_MAP[top.politicianId] : undefined;
      return {
        id: r.id, nickname: r.nickname, body: r.body, createdAt: r.createdAt.toISOString(),
        badge: typeName && pol && top ? { typeName, politicianName: pol.name, similarity: top.similarity } : null,
      };
    });
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Comments 컴포넌트 완성**

```tsx
// src/components/Comments.tsx
'use client';

import { useEffect, useState } from 'react';
import { addComment, deleteComment, listComments, reportComment, type CommentView } from '@/app/actions';

export default function Comments({ resultId }: { resultId: string }) {
  const [items, setItems] = useState<CommentView[]>([]);
  const [canWrite, setCanWrite] = useState(false);
  const [myResultId, setMyResultId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const id = localStorage.getItem('pg_result_id');
      setMyResultId(id);
      setCanWrite(!!id);
    } catch { setCanWrite(false); }
    void listComments().then(setItems);
  }, []);

  async function submit() {
    if (!myResultId) return;
    setBusy(true);
    setError('');
    const res = await addComment({ resultId: myResultId, nickname, password, body });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? '실패'); return; }
    setBody('');
    setItems(await listComments());
  }

  async function remove(id: string) {
    const pw = prompt('댓글 비밀번호를 입력하세요');
    if (!pw) return;
    const res = await deleteComment(id, pw);
    if (!res.ok) { alert(res.error); return; }
    setItems(await listComments());
  }

  async function report(id: string) {
    await reportComment(id);
    alert('신고가 접수됐어요');
  }

  return (
    <section className="mt-14">
      <h2 className="mb-4 text-lg font-bold">광장 댓글 <span className="text-sm font-normal text-zinc-400">— 모든 유형이 모이는 곳</span></h2>

      {canWrite ? (
        <div className="mb-6 rounded-xl border border-zinc-200 p-4">
          <div className="mb-2 flex gap-2">
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임"
              maxLength={12} className="w-32 rounded-lg border border-zinc-200 px-3 py-2 text-sm" data-testid="comment-nickname" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호"
              type="password" className="w-32 rounded-lg border border-zinc-200 px-3 py-2 text-sm" data-testid="comment-password" />
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="내 유형 뱃지를 달고 한마디"
            maxLength={500} rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" data-testid="comment-body" />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          <button onClick={submit} disabled={busy}
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50" data-testid="comment-submit">
            등록
          </button>
        </div>
      ) : (
        <p className="mb-6 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          댓글은 테스트를 완료한 사람만 쓸 수 있어요. (시크릿 모드에서는 작성이 불가합니다)
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {items.map((c) => (
          <li key={c.id} className="rounded-xl border border-zinc-100 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm">
              {c.badge && (
                <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs text-white">
                  {c.badge.typeName} · {c.badge.politicianName} {c.badge.similarity}%
                </span>
              )}
              <b>{c.nickname}</b>
              <span className="text-xs text-zinc-400">{new Date(c.createdAt).toLocaleString('ko-KR')}</span>
            </div>
            <p className="whitespace-pre-line text-zinc-700">{c.body}</p>
            <div className="mt-2 flex gap-3 text-xs text-zinc-400">
              <button onClick={() => remove(c.id)} className="hover:text-zinc-600">삭제</button>
              <button onClick={() => report(c.id)} className="hover:text-red-500">신고</button>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-zinc-400">아직 댓글이 없어요. 첫 댓글의 주인공이 되어보세요.</p>}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: 수동 검증 + Commit**

`npm run dev`에서: 테스트 완주 → 결과 페이지에서 댓글 작성(뱃지 표시 확인) → 틀린 비번 삭제 실패 → 맞는 비번 삭제 성공 → 1분에 4개 연속 작성 시 차단 확인. localStorage의 `pg_result_id` 삭제 후 새로고침 → 작성 폼 대신 안내문 확인.

```bash
git add -A && git commit -m "feat: 뱃지 댓글 시스템 (작성/삭제/신고/속도제한)"
```

---

### Task 15: 통계 페이지 + 랜딩

**Files:**
- Create: `src/app/stats/page.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 통계 페이지**

```tsx
// src/app/stats/page.tsx
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { results } from '@/db/schema';
import { TYPE_MAP } from '@/data/types';
import { POLITICIAN_MAP } from '@/data/politicians';

export const revalidate = 60;

async function getStats() {
  try {
    const byType = await db
      .select({ typeId: results.typeId, count: sql<number>`count(*)::int` })
      .from(results).groupBy(results.typeId).orderBy(sql`count(*) desc`);
    const byPol = await db
      .select({ polId: sql<string>`top_politicians->0->>'politicianId'`, count: sql<number>`count(*)::int` })
      .from(results).groupBy(sql`top_politicians->0->>'politicianId'`).orderBy(sql`count(*) desc`);
    const total = byType.reduce((s, r) => s + r.count, 0);
    return { byType, byPol, total };
  } catch {
    return null;
  }
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-extrabold">전체 통계</h1>
      {!stats || stats.total === 0 ? (
        <p className="text-zinc-500">아직 집계할 데이터가 없어요.</p>
      ) : (
        <>
          <p className="mb-6 text-sm text-zinc-500">총 {stats.total.toLocaleString()}명 참여 · 1분마다 갱신</p>
          <section className="mb-10">
            <h2 className="mb-3 text-lg font-bold">유형 분포</h2>
            {stats.byType.map((r) => {
              const pct = Math.round((r.count / stats.total) * 1000) / 10;
              return (
                <div key={r.typeId} className="mb-2">
                  <div className="mb-0.5 flex justify-between text-sm">
                    <span>{TYPE_MAP[r.typeId]?.name ?? r.typeId}</span><span className="text-zinc-500">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100">
                    <div className="h-2 rounded-full bg-zinc-800" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold">가장 많이 매칭된 정치인 (1위 기준)</h2>
            <ol className="flex flex-col gap-1 text-sm">
              {stats.byPol.slice(0, 10).map((r, i) => (
                <li key={r.polId ?? i} className="flex justify-between rounded-lg bg-zinc-50 px-4 py-2">
                  <span>{i + 1}. {POLITICIAN_MAP[r.polId]?.name ?? '?'}</span>
                  <span className="text-zinc-500">{r.count}명</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
      <div className="mt-10 text-center">
        <Link href="/test" className="rounded-xl bg-zinc-900 px-6 py-3 text-white">나도 테스트하기</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 랜딩 페이지** (`src/app/page.tsx` 전체 교체)

```tsx
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { results } from '@/db/schema';

export const revalidate = 60;

async function participantCount(): Promise<number | null> {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(results);
    return count;
  } catch {
    return null;
  }
}

export default async function Home() {
  const count = await participantCount();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-zinc-500">17문항 · 3분</p>
      <h1 className="mt-3 max-w-xl text-4xl font-extrabold leading-tight">
        나의 정치 유형,<br />그리고 나와 가장 가까운 정치인은?
      </h1>
      <p className="mt-4 max-w-md text-zinc-600">
        좌우 하나의 축으로는 알 수 없는 당신의 진짜 좌표. 13가지 유형 중 당신은 어디에?
      </p>
      <Link href="/test" data-testid="start"
        className="mt-8 rounded-2xl bg-zinc-900 px-10 py-4 text-lg font-bold text-white transition hover:bg-zinc-700">
        테스트 시작하기
      </Link>
      {count !== null && count > 0 && (
        <p className="mt-4 text-sm text-zinc-400">지금까지 {count.toLocaleString()}명이 참여했어요</p>
      )}
      <p className="mt-10 max-w-md text-xs leading-relaxed text-zinc-400">
        결과는 익명으로 저장되며 개인을 식별하는 정보는 수집하지 않습니다.
        정치인 매칭은 공개 발언·표결 기록 기반의 참고용 추정입니다.
      </p>
    </main>
  );
}
```

- [ ] **Step 3: 빌드 + 수동 확인 + Commit**

Run: `npm run build` → 성공. `/`와 `/stats` 확인.

```bash
git add -A && git commit -m "feat: 랜딩 + 통계 페이지"
```

---

### Task 16: E2E 스모크 + 최종 검증

**Files:**
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`

- [ ] **Step 1: Playwright 설정**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true },
});
```

```bash
npx playwright install chromium
```

- [ ] **Step 2: 스모크 테스트** (DATABASE_URL 필요 — .env.local 설정 전제)

```ts
// e2e/smoke.spec.ts
import { expect, test } from '@playwright/test';

test('완주 → 결과 → 댓글 작성', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('start').click();

  // 항상 첫 번째 선택지를 클릭해 완주
  for (let i = 0; i < 25; i += 1) {
    const options = page.getByTestId('option');
    if ((await options.count()) === 0) break; // 결과 페이지 도착
    await options.first().click();
  }

  await expect(page.getByTestId('type-name')).toBeVisible({ timeout: 15_000 });

  // 댓글 작성 (방금 완주했으므로 localStorage에 결과 ID 있음)
  await page.getByTestId('comment-nickname').fill('스모크');
  await page.getByTestId('comment-password').fill('1234');
  await page.getByTestId('comment-body').fill('E2E 스모크 테스트 댓글');
  await page.getByTestId('comment-submit').click();
  await expect(page.getByText('E2E 스모크 테스트 댓글')).toBeVisible();
});
```

- [ ] **Step 3: 실행**

Run: `npx playwright test`
Expected: PASS

- [ ] **Step 4: 최종 검증**

```bash
npm run test        # 단위 테스트 전체 PASS
npm run build       # 빌드 성공
npx tsc --noEmit    # 타입 에러 없음
```

수동 체크리스트:
- [ ] 무관심 답변(q8 마지막 선택지)으로 짧은 트랙 진입 확인
- [ ] 우향→반탄 경로에서 부정선거 질문 노출 확인
- [ ] 카톡 미리보기용: `/r/[id]` 의 OG 이미지 응답 확인
- [ ] Supabase 대시보드에서 results/comments 행 확인 (모더레이션 동선 확인)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "test: E2E 스모크 + 최종 검증"
```

---

## 배포 (계획 외 후속 작업)

MVP 완성 후 `vercel` 연결 → 환경변수(DATABASE_URL, IP_SALT) 등록 → 배포. 이 플랜의 범위에는 포함하지 않는다.

## 데이터 면책 노트

정치인 벡터·유형 설명은 **공개 자료 기반 추정 초안**이다. 출시 전 사용자(프로젝트 오너)가 `src/data/politicians.ts`와 `src/data/types.ts`를 직접 검수하는 단계를 거칠 것. 특히 `fraud`(부정선거론)·`impeach`(탄핵) 태그는 실명 정치인에게 민감하므로 evidence를 최대한 채울 것.
