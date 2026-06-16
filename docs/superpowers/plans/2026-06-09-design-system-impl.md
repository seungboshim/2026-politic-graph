# 디자인 시스템 적용 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 정치성향 테스트 앱에 디자인 시스템(다크 전용 · BookkGothic 토큰 · neutral 팔레트 · 좌우 정치 스펙트럼 액센트 · 20px 픽셀 아바타 컴포넌트 · 터미널 라벨)과 스키마 변경(정당 9종 색맵 · 정치인 face/tags · 유형 nickLabel · 댓글 신원모델 = 랜덤닉 + localStorage 토큰)을 적용한다. **콘텐츠 값(질문 문구·벡터·정치인 태그 내용)은 이번 범위 밖** — 기존 데이터로 동작하게 두고 이후 별도 사이클에서 채운다.

**Architecture:** 콘텐츠/로직 분리(`/src/data` 값, `/src/lib` 순수함수)는 유지·강화. 토큰은 `globals.css`의 Tailwind v4 `@theme`에 한 겹으로 모으고 컴포넌트는 시맨틱 토큰만 참조(raw hex 금지). 아바타·스펙트럼·정당색·랜덤닉은 순수 함수(TDD)로 두고, 페이지는 새 컴포넌트로 마크업만 교체한다. 채점/엔진/매칭 로직은 불변.

**Tech Stack:** Next.js 16 (App Router) · Tailwind v4 (`@theme`) · TypeScript · Drizzle/Postgres · Vitest. 폰트 BookkGothic(Light/Bold) self-host.

**스펙:** `docs/superpowers/specs/2026-06-09-design-system-design.md`

---

## 파일 구조

```
public/fonts/                 BookkGothic_Light.ttf, BookkGothic_Bold.ttf  (신규 복사)
src/app/globals.css           ← 다크 전용 토큰(@theme) + @font-face 전면 교체
src/app/layout.tsx            ← Geist 제거, lang ko, AvatarDefs 1회 삽입
src/lib/
  parties.ts                  ← PARTY_COLORS(9) + partyColor() + shade()           [신규, TDD]
  spectrum.ts                 ← leanOf() + accentStops()/accentGradient()          [신규, TDD]
  avatar.ts                   ← avatarInnerSvg(opts) 픽셀 아바타 빌더              [신규, TDD]
  nick.ts                     ← makeNick(nickLabel, token)                          [신규, TDD]
src/components/ui/
  AvatarDefs.tsx              ← 공유 흰 아웃라인 SVG 필터(1회)
  PixelAvatar.tsx             ← <svg> 래퍼 (avatarInnerSvg 사용)
  Button.tsx Chip.tsx Tag.tsx ProgressBar.tsx Card.tsx
  SectionHeading.tsx Eyebrow.tsx Alert.tsx PoliticianNameBadge.tsx
  RadarChart.tsx              ← 기존 src/components/RadarChart.tsx 이전+재단장
src/data/schema.ts            ← Politician.face/tags, PoliticalType.nickLabel 추가
src/data/types.ts             ← 13유형에 nickLabel 추가 (값은 잠정)
src/data/politicians.ts       ← 25명에 face 추가, evidence 제거, tags?(빈 채로)
src/db/schema.ts              ← comments: passwordHash 제거 → ownerHash 추가
src/app/actions.ts            ← 댓글 액션 신원모델 교체
src/components/ResultView.tsx Comments.tsx  ← 재단장
src/app/{page,test/page,stats/page,r/[id]/page,r/[id]/opengraph-image}.tsx ← 재단장
tests/  parties/spectrum/avatar/nick .test.ts  +  data.test.ts(nickLabel/face 검증 추가)
```

**전역 토큰·시그니처 고정(전 태스크 공통):**
- 시맨틱 색 토큰: `background #0a0a0a · surface #171717 · surface-raised #262626 · border #262626 · border-strong #404040 · foreground #f5f5f5 · foreground-secondary #a3a3a3 · foreground-subtle #737373 · foreground-faint #525252 · success #34d399 · warning #fcd34d · danger #ef4444`.
- 스펙트럼: fill `spectrum-blue #2f6fe6 · spectrum-violet #8b5cf6 · spectrum-red #e8434b`, text `spectrum-blue-text #6aa3ff · spectrum-violet-text #b794f6 · spectrum-red-text #ff7b82`.
- 타이포 토큰(`text-*`): display01 2rem / display02 1.5rem / heading01 1rem / heading02 .8125rem / body01 .9375rem / body02 .8125rem / label01 .6875rem / label02 .6875rem. 굵기는 `font-bold`(700)·기본(400)만. 자간: body 기본 -0.02em, display는 `tracking-[-0.03em]`.
- 정당 9종: 더불어민주당 #003B96 · 국민의힘 #E61E2B · 개혁신당 #FF7210 · 조국혁신당 #0073CF · 진보당 #D6001C · 정의당 #FFED00 · 새로운미래 #45BABD · 자유통일당 #E33334 · 무소속 #808080.
- 아바타 옵션: `{ sex:'m'|'f', hair:'up'|'down'|'bob', hairColor:'black'|'silver', glasses:boolean, party:string }`. viewBox `-1 -1 22 22`. 공유 필터 id `pg-avatar-outline`.

---

### Task 1: 폰트 + 토큰 + 레이아웃 (다크 전용 전환)

**Files:**
- Create: `public/fonts/BookkGothic_Light.ttf`, `public/fonts/BookkGothic_Bold.ttf`
- Modify(전면 교체): `src/app/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1: 폰트 복사**

```bash
cd /Users/seungboshim/Projects/personal/politic-graph
mkdir -p public/fonts
cp /Users/seungboshim/Projects/work/unboxx/inboxx-app/public/fonts/BookkGothic_Light.ttf public/fonts/
cp /Users/seungboshim/Projects/work/unboxx/inboxx-app/public/fonts/BookkGothic_Bold.ttf public/fonts/
ls -la public/fonts/   # 두 파일 ~2.3MB씩 확인
```

- [ ] **Step 2: `src/app/globals.css` 전체 교체**

```css
@import "tailwindcss";

@font-face {
  font-family: "BookkGothic";
  src: url("/fonts/BookkGothic_Light.ttf") format("truetype");
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: "BookkGothic";
  src: url("/fonts/BookkGothic_Bold.ttf") format("truetype");
  font-weight: 700; font-style: normal; font-display: swap;
}

@theme {
  --color-background: #0a0a0a;
  --color-surface: #171717;
  --color-surface-raised: #262626;
  --color-border: #262626;
  --color-border-strong: #404040;
  --color-foreground: #f5f5f5;
  --color-foreground-secondary: #a3a3a3;
  --color-foreground-subtle: #737373;
  --color-foreground-faint: #525252;
  --color-success: #34d399;
  --color-warning: #fcd34d;
  --color-danger: #ef4444;

  --color-spectrum-blue: #2f6fe6;
  --color-spectrum-violet: #8b5cf6;
  --color-spectrum-red: #e8434b;
  --color-spectrum-blue-text: #6aa3ff;
  --color-spectrum-violet-text: #b794f6;
  --color-spectrum-red-text: #ff7b82;

  --font-sans: "BookkGothic", ui-monospace, system-ui, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, monospace;

  --text-display01: 2rem;
  --text-display02: 1.5rem;
  --text-heading01: 1rem;
  --text-heading02: 0.8125rem;
  --text-body01: 0.9375rem;
  --text-body02: 0.8125rem;
  --text-label01: 0.6875rem;
  --text-label02: 0.6875rem;
}

html { color-scheme: dark; }
body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
  letter-spacing: -0.02em;
  -webkit-font-smoothing: antialiased;
}
/* 픽셀 아바타 선명 렌더 */
svg.pg-pixel { image-rendering: pixelated; }
```

- [ ] **Step 3: `src/app/layout.tsx` 전체 교체** (Geist 제거, lang ko, AvatarDefs 1회 삽입)

```tsx
import type { Metadata } from "next";
import "./globals.css";
import AvatarDefs from "@/components/ui/AvatarDefs";

export const metadata: Metadata = {
  title: "정치성향 테스트 — 나와 가장 가까운 정치인은?",
  description: "18문항 내외로 알아보는 세분화된 나의 정치 유형",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AvatarDefs />
        {children}
      </body>
    </html>
  );
}
```

NOTE: 이 시점엔 `AvatarDefs`/`AppHeader`가 없어 빌드가 깨진다. `AvatarDefs`는 Task 2에서 완성하므로 임시 스텁을, `AppHeader`는 의존성이 없으므로 완성본을 만든다:

```tsx
// src/components/ui/AvatarDefs.tsx — Task 2에서 완성. 임시 스텁.
export default function AvatarDefs() { return null; }
```

```tsx
// src/components/ui/AppHeader.tsx — 터미널풍 슬림 상단바(전역)
import Link from 'next/link';
export default function AppHeader() {
  return (
    <header className="border-b border-border px-[18px] py-3 font-mono text-label01 text-foreground-subtle">
      <Link href="/" className="hover:text-foreground-secondary"><span className="text-success">●</span> politic-graph</Link>
    </header>
  );
}
```

레이아웃에서 `AppHeader`를 `AvatarDefs` 아래, `{children}` 위에 렌더한다(위 layout.tsx 코드의 body 안에 `<AppHeader />` 추가). 즉 body는:
```tsx
<body className="min-h-full flex flex-col bg-background text-foreground">
  <AvatarDefs />
  <AppHeader />
  {children}
</body>
```
그리고 상단에 `import AppHeader from "@/components/ui/AppHeader";` 추가.

- [ ] **Step 4: 검증**

Run: `cd /Users/seungboshim/Projects/personal/politic-graph && npm run build`
Expected: 빌드 성공(라이트 잔재 경고 없음). `npx tsc --noEmit` 에러 없음.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(design): 다크 전용 토큰 + BookkGothic 폰트 + 레이아웃 전환"
```

---

### Task 2: 아바타 빌더 + PixelAvatar + AvatarDefs (TDD)

**Files:**
- Create: `src/lib/avatar.ts`, `tests/avatar.test.ts`, `src/components/ui/PixelAvatar.tsx`
- Modify(스텁→완성): `src/components/ui/AvatarDefs.tsx`
- 의존: `src/lib/parties.ts`의 `partyColor`/`shade` (Task 3). 순환을 피하려 avatar.ts는 정당색을 **인자로 주입받지 않고** parties에서 import하므로, **Task 3을 먼저 하거나** 이 Task에서 parties.ts도 함께 생성한다. → 본 Task에서 `parties.ts`를 먼저 만든다(아래 Step 0).

- [ ] **Step 0: `src/lib/parties.ts` 생성** (Task 3에서 테스트 추가)

```ts
// src/lib/parties.ts
export const PARTY_COLORS: Record<string, string> = {
  '더불어민주당': '#003B96',
  '국민의힘': '#E61E2B',
  '개혁신당': '#FF7210',
  '조국혁신당': '#0073CF',
  '진보당': '#D6001C',
  '정의당': '#FFED00',
  '새로운미래': '#45BABD',
  '자유통일당': '#E33334',
  '무소속': '#808080',
};

/** 미등록 정당은 무소속 회색으로 폴백 */
export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? '#808080';
}

/** hex 명도 가감 (−255~255). 넥타이 매듭 음영 등에 사용 */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
```

- [ ] **Step 1: 실패 테스트 작성 `tests/avatar.test.ts`**

```ts
import { describe, expect, test } from 'vitest';
import { avatarInnerSvg, AVATAR_VIEWBOX, type AvatarOpts } from '@/lib/avatar';

const base: AvatarOpts = { sex: 'm', hair: 'down', hairColor: 'black', glasses: false, party: '더불어민주당' };

describe('avatarInnerSvg', () => {
  test('rect 마크업 문자열을 반환한다', () => {
    const s = avatarInnerSvg(base);
    expect(s).toContain('<rect');
    expect(s.length).toBeGreaterThan(100);
  });
  test('정당색(넥타이)이 출력에 포함된다', () => {
    expect(avatarInnerSvg(base)).toContain('#003B96');           // 더불어민주당
    expect(avatarInnerSvg({ ...base, party: '국민의힘' })).toContain('#E61E2B');
  });
  test('안경 옵션이 안경테(검정 #15151c)를 추가한다', () => {
    expect(avatarInnerSvg({ ...base, glasses: false })).not.toContain('#15151c');
    expect(avatarInnerSvg({ ...base, glasses: true })).toContain('#15151c');
  });
  test('미등록 정당은 폴백 회색(#808080)', () => {
    expect(avatarInnerSvg({ ...base, party: '없는당' })).toContain('#808080');
  });
  test('viewBox 상수 노출', () => {
    expect(AVATAR_VIEWBOX).toBe('-1 -1 22 22');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- tests/avatar.test.ts` → FAIL (모듈 없음)

- [ ] **Step 3: `src/lib/avatar.ts` 구현** (확정 아바타 아트: 20px 그리드, 세로 눈/안경 1×1, 여성 긴머리 채움)

```ts
// src/lib/avatar.ts — 픽셀 아바타 빌더(순수). 흰 아웃라인은 공유 SVG 필터(AvatarDefs)가 담당.
import { partyColor, shade } from './parties';

export interface AvatarOpts {
  sex: 'm' | 'f';
  hair: 'up' | 'down' | 'bob';
  hairColor: 'black' | 'silver';
  glasses: boolean;
  party: string;
}

export const AVATAR_VIEWBOX = '-1 -1 22 22';

const SK = '#ecbf8a', SKS = '#cf9460', MOUTH = '#a8623f', LIP = '#cc6f68', EYE = '#13131a',
  FRAME = '#15151c', SHIRT = '#eef2f8', SUIT = '#222b38', LAPEL = '#33414f';
const HAIR = { black: { b: '#1c1c24', h: '#3a3a46' }, silver: { b: '#c2c8d0', h: '#e8ecf0' } };

const px = (x: number, y: number, w: number, h: number, f: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" shape-rendering="crispEdges"/>`;

export function avatarInnerSvg(o: AvatarOpts): string {
  const tie = partyColor(o.party), tieD = shade(tie, -40);
  const H = HAIR[o.hairColor], hb = H.b, hh = H.h;
  const fx = o.sex === 'f' ? 6 : 5, fw = o.sex === 'f' ? 8 : 10, fc = 10;
  const faceH = o.sex === 'f' ? 8 : 9, li = fx - 1, ri = fx + fw;
  const femaleSide = o.sex === 'f' && o.hair !== 'up';
  let k = px(1, 16, 18, 4, SUIT) + px(fc - 4, 16, 2, 1, LAPEL) + px(fc - 3, 17, 1, 3, LAPEL)
    + px(fc + 2, 16, 2, 1, LAPEL) + px(fc + 2, 17, 1, 3, LAPEL) + px(fc - 3, 16, 6, 1, SHIRT) + px(fc - 1, 17, 2, 1, SHIRT);
  const nT = 5 + faceH + 1; k += px(fc - 1, nT, 2, 16 - nT, SKS);
  if (o.hair === 'bob') {
    k += px(li, 2, fw + 2, 3, hb) + px(li - 1, 4, 2, 10, hb) + px(ri, 4, 2, 10, hb)
      + px(li - 2, 7, 1, 5, hb) + px(ri + 1, 7, 1, 5, hb) + px(fx, 13, 1, 1, hb) + px(fx + fw - 1, 13, 1, 1, hb);
  } else if (o.hair === 'down') {
    if (o.sex === 'f') {
      k += px(li, 3, fw + 2, 3, hb) + px(li, 5, 1, 13, hb) + px(ri, 5, 1, 13, hb)
        + px(li - 1, 6, 1, 9, hb) + px(ri + 1, 6, 1, 9, hb) + px(fx, 14, 3, 3, hb) + px(fc + 1, 14, 3, 3, hb);
    } else {
      k += px(fx, 3, fw, 3, hb) + px(li, 5, 1, 7, hb) + px(ri, 5, 1, 7, hb);
    }
  } else { // up
    k += px(fx + 1, 2, fw - 2, 1, hb) + px(fx, 3, fw, 2, hb) + px(li, 5, 1, 3, hb) + px(ri, 5, 1, 3, hb);
  }
  k += px(fx, 5, fw, faceH, SK) + px(fx + 1, 5 + faceH, fw - 2, 1, SK);
  if (!femaleSide) k += px(fx - 1, 9, 1, 2, SK) + px(fx + fw, 9, 1, 2, SK);
  if (o.hair !== 'up') k += px(fx, 4, fw, 1, hb) + px(fx, 5, fw, 1, hb) + px(fx + 1, 4, fw - 2, 1, hh);
  else k += px(fx + 1, 5, fw - 2, 1, hb) + px(fx + 1, 2, fw - 3, 1, hh);
  k += px(fc - 1, 11, 1, 1, SKS) + px(fc - 2, 12, 4, 1, o.sex === 'f' ? LIP : MOUTH);
  if (o.glasses) {
    k += px(6, 8, 4, 1, FRAME) + px(6, 11, 4, 1, FRAME) + px(6, 9, 1, 2, FRAME) + px(9, 9, 1, 2, FRAME)
      + px(11, 8, 4, 1, FRAME) + px(11, 11, 4, 1, FRAME) + px(11, 9, 1, 2, FRAME) + px(14, 9, 1, 2, FRAME)
      + px(10, 9, 1, 1, FRAME) + px(5, 9, 1, 1, FRAME) + px(15, 9, 1, 1, FRAME)
      + px(8, 10, 1, 1, EYE) + px(12, 10, 1, 1, EYE);            // 안경: 1×1 눈
  } else {
    k += px(7, 9, 1, 2, EYE) + px(12, 9, 1, 2, EYE);            // 무안경: 세로 눈(중앙 정렬)
  }
  k += px(fc - 1, 16, 2, 1, tieD) + px(fc - 1, 17, 2, 3, tie) + px(fc, 19, 1, 1, tieD);
  return k;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- tests/avatar.test.ts` → PASS (5)

- [ ] **Step 5: `src/components/ui/AvatarDefs.tsx` 완성** (공유 흰 아웃라인 필터, 레이아웃에 1회)

```tsx
// src/components/ui/AvatarDefs.tsx — 모든 PixelAvatar가 참조하는 공유 흰 아웃라인 필터.
export default function AvatarDefs() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
      <defs>
        <filter id="pg-avatar-outline" x="-25%" y="-25%" width="150%" height="150%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="d" />
          <feFlood floodColor="#ffffff" />
          <feComposite in2="d" operator="in" result="o" />
          <feMerge>
            <feMergeNode in="o" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
```

- [ ] **Step 6: `src/components/ui/PixelAvatar.tsx` 생성**

```tsx
// src/components/ui/PixelAvatar.tsx
import { avatarInnerSvg, AVATAR_VIEWBOX, type AvatarOpts } from '@/lib/avatar';

export default function PixelAvatar({ size = 48, className, ...opts }: AvatarOpts & { size?: number; className?: string }) {
  return (
    <svg
      className={`pg-pixel${className ? ` ${className}` : ''}`}
      width={size} height={size} viewBox={AVATAR_VIEWBOX} aria-hidden
    >
      <g filter="url(#pg-avatar-outline)" dangerouslySetInnerHTML={{ __html: avatarInnerSvg(opts) }} />
    </svg>
  );
}
```

- [ ] **Step 7: 빌드 + Commit**

Run: `npm run build` (레이아웃이 AvatarDefs 실제 버전 사용) → 성공.

```bash
git add -A && git commit -m "feat(design): 픽셀 아바타 빌더 + PixelAvatar + 공유 아웃라인 필터 + 정당색 맵"
```

---

### Task 3: 정당색 맵 테스트 + 스펙트럼 라이브러리 (TDD)

**Files:**
- Create: `tests/parties.test.ts`, `src/lib/spectrum.ts`, `tests/spectrum.test.ts`
- (parties.ts는 Task 2에서 생성됨)

- [ ] **Step 1: `tests/parties.test.ts`**

```ts
import { describe, expect, test } from 'vitest';
import { PARTY_COLORS, partyColor, shade } from '@/lib/parties';

describe('parties', () => {
  test('9개 정당 등록', () => {
    expect(Object.keys(PARTY_COLORS).length).toBe(9);
    expect(PARTY_COLORS['더불어민주당']).toBe('#003B96');
    expect(PARTY_COLORS['국민의힘']).toBe('#E61E2B');
  });
  test('미등록 정당 폴백', () => {
    expect(partyColor('없는당')).toBe('#808080');
    expect(partyColor('개혁신당')).toBe('#FF7210');
  });
  test('shade 음수=어둡게, 클램프', () => {
    expect(shade('#000000', -50)).toBe('#000000');
    expect(shade('#ffffff', 50)).toBe('#ffffff');
    expect(shade('#808080', 16)).toBe('#909090');
  });
});
```

Run: `npm run test -- tests/parties.test.ts` → PASS.

- [ ] **Step 2: 실패 테스트 `tests/spectrum.test.ts`**

```ts
import { describe, expect, test } from 'vitest';
import { leanOf, accentStops, accentGradient } from '@/lib/spectrum';
import { initialState } from '@/lib/scoring';
import type { UserState } from '@/data/schema';

function withAxes(a: Partial<UserState['axes']>): UserState {
  const s = initialState();
  Object.assign(s.axes, a);
  return s;
}

describe('spectrum', () => {
  test('leanOf = (econ+social+security)/3', () => {
    expect(leanOf(withAxes({ econ: -60, social: -30, security: -30 }))).toBe(-40);
    expect(leanOf(withAxes({ econ: 60, social: 60, security: 60 }))).toBe(60);
  });
  test('좌향(≤-30) → blue→violet, 우향(≥30) → violet→red, 중도 → blue→violet 중간톤', () => {
    expect(accentStops(-50, 'fill')).toEqual(['#2f6fe6', '#8b5cf6']);
    expect(accentStops(50, 'fill')).toEqual(['#8b5cf6', '#e8434b']);
    expect(accentStops(0, 'fill')[0]).not.toBe('#2f6fe6'); // 중도는 별도 중간톤
  });
  test('text tier는 밝은 토큰', () => {
    expect(accentStops(-50, 'text')).toEqual(['#6aa3ff', '#b794f6']);
    expect(accentStops(50, 'text')).toEqual(['#b794f6', '#ff7b82']);
  });
  test('accentGradient는 css linear-gradient 문자열', () => {
    expect(accentGradient(-50, 'text')).toBe('linear-gradient(92deg, #6aa3ff, #b794f6)');
  });
});
```

Run: `npm run test -- tests/spectrum.test.ts` → FAIL.

- [ ] **Step 3: `src/lib/spectrum.ts` 구현**

```ts
// src/lib/spectrum.ts — 좌우 정치 스펙트럼 액센트(순수).
import type { UserState } from '@/data/schema';

export function leanOf(state: UserState): number {
  return (state.axes.econ + state.axes.social + state.axes.security) / 3;
}

const FILL = { blue: '#2f6fe6', violet: '#8b5cf6', red: '#e8434b', midA: '#5f6fe6', midB: '#b15cc0' };
const TEXT = { blue: '#6aa3ff', violet: '#b794f6', red: '#ff7b82', midA: '#8fa3ff', midB: '#d49be0' };

export function accentStops(lean: number, tier: 'fill' | 'text'): [string, string] {
  const c = tier === 'text' ? TEXT : FILL;
  if (lean <= -30) return [c.blue, c.violet];
  if (lean >= 30) return [c.violet, c.red];
  return [c.midA, c.midB];
}

export function accentGradient(lean: number, tier: 'fill' | 'text'): string {
  const [a, b] = accentStops(lean, tier);
  return `linear-gradient(92deg, ${a}, ${b})`;
}
```

Run: `npm run test -- tests/spectrum.test.ts` → PASS. `npx tsc --noEmit` 클린.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(design): 정당색 테스트 + 좌우 스펙트럼 액센트 라이브러리"
```

---

### Task 4: 랜덤닉 생성기 (TDD)

**Files:** Create `src/lib/nick.ts`, `tests/nick.test.ts`

- [ ] **Step 1: 실패 테스트**

```ts
import { describe, expect, test } from 'vitest';
import { makeNick } from '@/lib/nick';

describe('makeNick', () => {
  test('{nickLabel}_{토큰앞4자}', () => {
    expect(makeNick('강성친명', 'a3f9c1d2-xxxx')).toBe('강성친명_a3f9');
  });
  test('토큰이 짧아도 안전', () => {
    expect(makeNick('중도', 'ab')).toBe('중도_ab');
  });
  test('nickLabel 공백 제거', () => {
    expect(makeNick('강성 친명', 'a3f9zzzz')).toBe('강성친명_a3f9');
  });
});
```

Run: `npm run test -- tests/nick.test.ts` → FAIL.

- [ ] **Step 2: 구현 `src/lib/nick.ts`**

```ts
// src/lib/nick.ts — 결과 유형 라벨 + 토큰으로 익명 닉 생성(순수).
export function makeNick(nickLabel: string, token: string): string {
  const label = nickLabel.replace(/\s+/g, '');
  const suffix = token.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4);
  return `${label}_${suffix}`;
}
```

Run: `npm run test -- tests/nick.test.ts` → PASS.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(design): 랜덤닉 생성기"
```

---

### Task 5: 스키마 변경 — Politician.face/tags, PoliticalType.nickLabel

**Files:**
- Modify: `src/data/schema.ts`, `src/data/types.ts`, `src/data/politicians.ts`, `tests/data.test.ts`

- [ ] **Step 1: `src/data/schema.ts`에 타입 추가/수정**

`PoliticalType` 인터페이스에 `nickLabel: string;` 추가(필수). `Politician` 인터페이스에서 `evidence?` 제거하고 `face: AvatarFace;`와 `tags?: string[];` 추가. 파일 상단(또는 적절한 위치)에 `AvatarFace` 타입 추가:

```ts
export interface AvatarFace {
  sex: 'm' | 'f';
  hair: 'up' | 'down' | 'bob';
  hairColor: 'black' | 'silver';
  glasses: boolean;
}
```

`PoliticalType` (기존 필드 유지, 한 줄 추가):
```ts
export interface PoliticalType {
  id: string;
  name: string;
  nickLabel: string;          // ← 추가: 댓글 랜덤닉 prefix (예: "강성친명")
  camp: '좌파' | '중도좌' | '중도우' | '우파' | '비이념';
  tagline: string;
  description: string;
  keywords: string[];
  vector: TargetVector;
  weights?: Partial<Record<DimId, number>>;
}
```

`Politician` (evidence 제거, face/tags 추가):
```ts
export interface Politician {
  id: string;
  name: string;
  party: string;
  vector: TargetVector;
  face: AvatarFace;           // ← 추가: 픽셀 아바타 파라미터
  tags?: string[];            // ← 추가: 결과/댓글에 노출(내용은 다음 데이터 단계에서)
}
```
`Evidence` 인터페이스는 남겨둬도 무방하나 사용처가 없어지므로 삭제한다.

- [ ] **Step 2: `src/data/types.ts` 13유형에 `nickLabel` 추가** (잠정 라벨, 4~6자 권장)

각 유형 객체에 `nickLabel`을 추가한다. 정확한 매핑:
```
nl-jusa→'자주파' · pd-labor→'노동좌파' · postmodern-left→'젠더진보' · hard-leejm→'강성친명' ·
prosec-reform→'검찰개혁' · moderate-lib→'온건자유' · young-merit→'능력주의' · prag-con→'중도실용' ·
pro-impeach-con→'찬탄보수' · anti-impeach-main→'반탄주류' · plaza-right→'광장우파' ·
cynic→'무당회의' · apathy→'무관심'
```
예: `{ id: 'hard-leejm', name: '강성 친명 개혁파', nickLabel: '강성친명', camp: '중도좌', ... }`

- [ ] **Step 3: `src/data/politicians.ts` 25명에 `face` 추가, `evidence` 제거**

각 정치인 객체에서 `evidence` 필드를 제거하고 `face`를 추가한다. (값은 잠정 — 다음 데이터 단계에서 검수). 매핑:
```
lee-jm    face:{sex:'m',hair:'down',hairColor:'black',glasses:false}
jung-cr   {sex:'m',hair:'down',hairColor:'black',glasses:false}
park-cd   {sex:'m',hair:'down',hairColor:'black',glasses:true}
cho-k     {sex:'m',hair:'down',hairColor:'silver',glasses:true}
kim-dy    {sex:'m',hair:'up',hairColor:'silver',glasses:false}
kim-ks    {sex:'m',hair:'down',hairColor:'black',glasses:true}
lim-js    {sex:'m',hair:'down',hairColor:'black',glasses:false}
lee-ny    {sex:'m',hair:'up',hairColor:'silver',glasses:true}
kwon-yg   {sex:'m',hair:'down',hairColor:'black',glasses:true}
kim-jy    {sex:'f',hair:'bob',hairColor:'black',glasses:false}
jang-hy   {sex:'f',hair:'down',hairColor:'black',glasses:true}
lee-js    {sex:'m',hair:'up',hairColor:'black',glasses:false}
chun-hr   {sex:'m',hair:'up',hairColor:'black',glasses:false}
ahn-cs    {sex:'m',hair:'down',hairColor:'black',glasses:false}
oh-sh     {sex:'m',hair:'up',hairColor:'black',glasses:false}
yoo-sm    {sex:'m',hair:'up',hairColor:'silver',glasses:false}
han-dh    {sex:'m',hair:'down',hairColor:'black',glasses:true}
jang-dh   {sex:'m',hair:'down',hairColor:'black',glasses:true}
na-kw     {sex:'f',hair:'bob',hairColor:'black',glasses:false}
yoon-sh   {sex:'m',hair:'up',hairColor:'silver',glasses:false}
kim-ms    {sex:'m',hair:'up',hairColor:'silver',glasses:true}
hong-jp   {sex:'m',hair:'up',hairColor:'silver',glasses:false}
hwang-ka  {sex:'m',hair:'up',hairColor:'silver',glasses:true}
jeon-hg   {sex:'m',hair:'up',hairColor:'silver',glasses:false}
jeon-kh   {sex:'m',hair:'up',hairColor:'silver',glasses:false}
```
예: `{ id: 'han-dh', name: '한동훈', party: '국민의힘', vector: {...}, face: { sex:'m', hair:'down', hairColor:'black', glasses:true } },` (기존 `evidence: [...]` 줄 삭제)

- [ ] **Step 4: `tests/data.test.ts`에 검증 추가** (기존 describe 블록 유지, append)

```ts
import { TYPE_MAP } from '@/data/types';
// (POLITICIANS, TYPES, AXES는 기존 import 재사용)

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
```

- [ ] **Step 5: 검증**

Run: `npm run test`  → 전체 PASS (기존 페르소나/스코어링 영향 없음, 신규 검증 통과).
Run: `npx tsc --noEmit` → 에러 없음 (모든 유형 nickLabel, 모든 정치인 face 채워짐).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(design): 정치인 face/tags · 유형 nickLabel 스키마 추가 (evidence 제거)"
```

---

### Task 6: 프리미티브 UI 컴포넌트

**Files:** Create `src/components/ui/`: `Button.tsx`, `Chip.tsx`, `Tag.tsx`, `ProgressBar.tsx`, `Card.tsx`, `SectionHeading.tsx`, `Eyebrow.tsx`, `Alert.tsx`, `PoliticianNameBadge.tsx`

각 컴포넌트는 시맨틱 토큰 클래스만 사용. (시각 컴포넌트라 단위 테스트 대신 빌드/타입으로 검증.)

- [ ] **Step 1: 컴포넌트 작성**

```tsx
// src/components/ui/Button.tsx
import type { ButtonHTMLAttributes } from 'react';
type Variant = 'primary' | 'secondary' | 'ghost';
const VARIANT: Record<Variant, string> = {
  primary: 'text-background font-bold',                 // 배경 그라디언트는 style로 주입(스펙트럼)
  secondary: 'border border-border-strong bg-surface-raised text-foreground-secondary',
  ghost: 'text-foreground-subtle hover:text-foreground-secondary',
};
export default function Button(
  { variant = 'secondary', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant },
) {
  return <button className={['rounded-xl px-5 py-3 text-body02 transition', VARIANT[variant], className].join(' ')} {...rest} />;
}
```

```tsx
// src/components/ui/Chip.tsx — 유형 키워드 (#해시태그)
export default function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-border-strong bg-surface-raised px-2.5 py-1 text-label01 text-foreground-secondary">{children}</span>;
}
```

```tsx
// src/components/ui/Tag.tsx — 정치인 태그 (더 작고 흐림)
export default function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-[5px] border border-border bg-surface-raised px-1.5 py-0.5 text-label01 text-foreground-subtle">{children}</span>;
}
```

```tsx
// src/components/ui/ProgressBar.tsx — 유사도/진행률 공용. fill 그라디언트는 style로 주입.
export default function ProgressBar({ value, gradient }: { value: number; gradient: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundImage: gradient }} />
    </div>
  );
}
```

```tsx
// src/components/ui/Card.tsx
export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={['rounded-xl border border-border bg-surface p-[18px]', className].join(' ')}>{children}</div>;
}
```

```tsx
// src/components/ui/SectionHeading.tsx — 터미널 프리픽스 "> 제목"
export default function SectionHeading({ children, accentColor = '#6aa3ff' }: { children: React.ReactNode; accentColor?: string }) {
  return (
    <h2 className="mb-3.5 text-heading02 font-bold tracking-[-0.02em]">
      <span className="font-mono font-normal" style={{ color: accentColor }}>&gt; </span>
      {children}
    </h2>
  );
}
```

```tsx
// src/components/ui/Eyebrow.tsx — 진영 eyebrow "// 라벨" (대문자·자간 금지)
export default function Eyebrow({ children, accentColor = '#6aa3ff' }: { children: React.ReactNode; accentColor?: string }) {
  return (
    <p className="font-mono text-label02 text-foreground-subtle">
      <span style={{ color: accentColor }}>// </span>{children}
    </p>
  );
}
```

```tsx
// src/components/ui/Alert.tsx — 우아한 강등/오류 안내
export default function Alert({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-warning/40 bg-warning/10 px-3.5 py-3 text-body02 text-warning">{children}</p>;
}
```

```tsx
// src/components/ui/PoliticianNameBadge.tsx — 아바타 우측하단 정당색 테두리 이름칩
export default function PoliticianNameBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="absolute -bottom-1.5 -right-1.5 whitespace-nowrap rounded-full border bg-surface px-1.5 py-0.5 text-[9px] leading-tight text-foreground-secondary"
      style={{ borderColor: color }}
    >{name}</span>
  );
}
```

NOTE: `Alert`의 `border-warning/40`·`bg-warning/10`은 Tailwind v4가 `--color-warning`에서 알파 변형을 생성하므로 동작한다. 동작 안 하면 `style`로 대체.

- [ ] **Step 2: 빌드 + Commit**

Run: `npx tsc --noEmit` → 클린. `npm run build` → 성공.

```bash
git add -A && git commit -m "feat(design): 프리미티브 UI 컴포넌트(Button/Chip/Tag/ProgressBar/Card/SectionHeading/Eyebrow/Alert/NameBadge)"
```

---

### Task 7: RadarChart 재단장 (다크 + 스펙트럼 fill)

**Files:**
- Create: `src/components/ui/RadarChart.tsx`
- Delete: `src/components/RadarChart.tsx` (기존 zinc 버전)

- [ ] **Step 1: `src/components/ui/RadarChart.tsx` 작성** (lean으로 fill 색 결정)

```tsx
// src/components/ui/RadarChart.tsx — 6축, 다크 + 스펙트럼 그라디언트 채움.
import { AXES, type AxisId } from '@/data/schema';
import { accentStops } from '@/lib/spectrum';

const LABELS: Record<AxisId, string> = {
  econ: '시장', social: '전통', security: '안보', trust: '신뢰', gender: '반페미', engage: '관여',
};

export default function RadarChart({ axes, lean }: { axes: Record<AxisId, number>; lean: number }) {
  const cx = 125, cy = 120, R = 82;
  const [a, b] = accentStops(lean, 'fill');
  const pt = (i: number, r: number) => {
    const ang = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r] as const;
  };
  const poly = AXES.map((ax, i) => pt(i, ((axes[ax] + 100) / 200) * R).join(',')).join(' ');
  return (
    <svg viewBox="0 0 250 240" className="w-full max-w-[260px]">
      <defs>
        <linearGradient id="pg-radar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} stopOpacity="0.35" />
          <stop offset="1" stopColor={b} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {[0.33, 0.66, 1].map((f) => (
        <polygon key={f} points={AXES.map((_, i) => pt(i, R * f).join(',')).join(' ')} fill="none" stroke="#262626" strokeWidth="1" />
      ))}
      {AXES.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#262626" strokeWidth="1" />; })}
      <polygon points={poly} fill="url(#pg-radar)" stroke={a} strokeWidth="2" />
      {AXES.map((ax, i) => { const [x, y] = pt(i, R + 16); return (
        <text key={ax} x={x} y={y} fill="#737373" fontSize="10" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">{LABELS[ax]}</text>
      ); })}
    </svg>
  );
}
```

NOTE: 라디얼 그라디언트 id `pg-radar`가 여러 RadarChart 렌더 시 중복될 수 있으나 결과 페이지엔 1개만 쓰이므로 안전. (여러 개 동시 렌더가 생기면 그때 id 유니크화.)

- [ ] **Step 2: 기존 RadarChart 삭제 + 빌드**

```bash
git rm src/components/RadarChart.tsx
```
(ResultView가 아직 옛 경로를 import하면 Task 8에서 교체하므로, 이 시점 빌드가 깨지면 Task 8과 함께 커밋한다. 단독 검증: `npx tsc --noEmit`로 RadarChart 자체 타입만 확인.)

- [ ] **Step 3: Commit** (Task 8과 묶어도 됨)

```bash
git add -A && git commit -m "feat(design): RadarChart 다크/스펙트럼 재단장"
```

---

### Task 8: ResultView 재단장

**Files:** Modify(전면 교체) `src/components/ResultView.tsx`

- [ ] **Step 1: `src/components/ResultView.tsx` 전체 교체**

```tsx
// src/components/ResultView.tsx
import type { MatchResult, UserState } from '@/data/schema';
import { TYPE_MAP } from '@/data/types';
import { POLITICIAN_MAP } from '@/data/politicians';
import { partyColor } from '@/lib/parties';
import { leanOf, accentGradient } from '@/lib/spectrum';
import PixelAvatar from '@/components/ui/PixelAvatar';
import Card from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';
import Eyebrow from '@/components/ui/Eyebrow';
import Chip from '@/components/ui/Chip';
import Tag from '@/components/ui/Tag';
import ProgressBar from '@/components/ui/ProgressBar';
import RadarChart from '@/components/ui/RadarChart';

const NO_MATCH = new Set(['cynic', 'apathy']);

export default function ResultView(
  { typeId, state, top, samePct }: { typeId: string; state: UserState; top: MatchResult[]; samePct?: number },
) {
  const type = TYPE_MAP[typeId];
  if (!type) return null;
  const lean = leanOf(state);
  const textGrad = accentGradient(lean, 'text');
  const fillGrad = accentGradient(lean, 'fill');
  const accentColor = textGrad.match(/#[0-9a-fA-F]{6}/)?.[0] ?? '#6aa3ff';
  const soft = NO_MATCH.has(typeId);
  const gradText = { backgroundImage: textGrad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } as const;

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow accentColor={accentColor}>{type.camp}</Eyebrow>
        <h1 className="mt-1 text-display01 font-bold tracking-[-0.03em]" style={gradText} data-testid="type-name">{type.name}</h1>
        <p className="mt-2 text-body01 text-foreground-secondary">“{type.tagline}”</p>
        <p className="mt-4 whitespace-pre-line text-body02 leading-relaxed text-foreground-subtle">{type.description}</p>
        <p className="mt-4 flex flex-wrap gap-2">{type.keywords.map((k) => <Chip key={k}>{k}</Chip>)}</p>
        {samePct !== undefined && (
          <p className="mt-4 text-body02 text-foreground-subtle">전체 응답자 중 <b style={{ color: accentColor }}>{samePct}%</b>가 당신과 같은 유형이에요</p>
        )}
      </section>

      <Card>
        <SectionHeading accentColor={accentColor}>{soft ? '그나마 가까운 정치인' : '나와 가장 가까운 정치인'}</SectionHeading>
        <ol className="flex flex-col gap-1">
          {top.map((m, i) => {
            const p = POLITICIAN_MAP[m.politicianId];
            if (!p) return null;
            const col = partyColor(p.party);
            return (
              <li key={m.politicianId} className="mb-3">
                <div className="flex items-center gap-3">
                  <PixelAvatar {...p.face} party={p.party} size={48} />
                  <div>
                    <div className="text-body01">{i + 1}위 {p.name}</div>
                    <div className="text-label01 text-foreground-subtle">{p.party}</div>
                  </div>
                  <b className="ml-auto text-[17px]" style={gradText}>{m.similarity}%</b>
                </div>
                {p.tags?.length ? <div className="ml-[61px] mt-2 flex flex-wrap gap-1.5">{p.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div> : null}
                <div className="mt-2"><ProgressBar value={m.similarity} gradient={fillGrad} /></div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card>
        <SectionHeading accentColor={accentColor}>내 성향 프로필</SectionHeading>
        <div className="flex justify-center"><RadarChart axes={state.axes} lean={lean} /></div>
      </Card>
    </div>
  );
}
```

NOTE: `accentColor`는 텍스트 그라디언트 첫 hex를 단색으로 뽑아 eyebrow/소제목 sigil·강조 숫자에 사용.

- [ ] **Step 2: 검증**

Run: `npx tsc --noEmit` → 클린. `npm run build` → 성공.
수동: `.env.local`(DB) 있으면 `npm run dev`로 `/r/[id]` 확인 — 없으면 빌드 통과로 대체.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(design): ResultView 재단장(스펙트럼·아바타·태그·터미널 라벨)"
```

---

### Task 9: 댓글 신원 모델 교체 (DB 스키마 + 서버 액션)

**Files:** Modify `src/db/schema.ts`, `src/app/actions.ts`

- [ ] **Step 1: `src/db/schema.ts` comments 테이블 변경**

`comments`에서 `passwordHash` 제거, `ownerHash text('owner_hash').notNull()` 추가. `nickname`은 유지(서버가 생성해 저장). 최종:

```ts
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  resultId: uuid('result_id').references(() => results.id).notNull(),
  nickname: text('nickname').notNull(),          // 서버 생성 랜덤닉
  ownerHash: text('owner_hash').notNull(),        // localStorage 토큰 해시(본인 식별)
  body: text('body').notNull(),
  ipHash: text('ip_hash').notNull(),
  deleted: boolean('deleted').default(false).notNull(),
  reportCount: integer('report_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

- [ ] **Step 2: `src/app/actions.ts` 댓글 액션 교체**

기존 `addComment`/`deleteComment`/`listComments`/`CommentView` 및 `hashPassword`/`verifyPassword`를 교체한다. (`submitTest`/`getResult`/`sha256`/`clientIpHash`/속도제한 로직은 유지.) import에서 `randomBytes, scryptSync, timingSafeEqual`은 더 이상 불필요하면 제거하고 `createHash`만 유지.

새 `CommentView` 및 액션:

```ts
import { makeNick } from '@/lib/nick';
import { TYPE_MAP } from '@/data/types';
import { POLITICIAN_MAP } from '@/data/politicians';
import type { AvatarFace } from '@/data/schema';

const ownerHashOf = (token: string) => sha256(token + (process.env.IP_SALT ?? ''));

export interface CommentView {
  id: string;
  nickname: string;
  body: string;
  createdAt: string;
  badge: { face: AvatarFace; party: string; politicianName: string } | null;
}

export async function addComment(
  input: { resultId: string; ownerToken: string; body: string },
): Promise<{ ok: boolean; error?: string }> {
  const body = input.body.trim();
  if (!input.ownerToken || input.ownerToken.length < 6) return { ok: false, error: '잘못된 요청' };
  if (body.length < 1 || body.length > 500) return { ok: false, error: '내용은 1~500자' };
  if (BANNED_WORDS.some((w) => body.includes(w))) return { ok: false, error: '금칙어가 포함되어 있어요' };
  try {
    const [row] = await db.select({ id: results.id, typeId: results.typeId }).from(results).where(eq(results.id, input.resultId));
    if (!row) return { ok: false, error: '테스트 결과가 필요해요' };

    const ipHash = await clientIpHash();
    const oneMinAgo = new Date(Date.now() - 60_000);
    const [{ recent }] = await db
      .select({ recent: sql<number>`count(*)::int` })
      .from(comments)
      .where(and(eq(comments.ipHash, ipHash), gt(comments.createdAt, oneMinAgo)));
    if (recent >= 3) return { ok: false, error: '너무 빨라요. 잠시 후 다시 시도해주세요' };

    const nickLabel = TYPE_MAP[row.typeId]?.nickLabel ?? '시민';
    const nickname = makeNick(nickLabel, input.ownerToken);
    await db.insert(comments).values({
      resultId: input.resultId, nickname, body,
      ownerHash: ownerHashOf(input.ownerToken), ipHash,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: '일시적인 오류로 댓글을 등록하지 못했어요' };
  }
}

export async function deleteComment(id: string, ownerToken: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const [row] = await db.select().from(comments).where(eq(comments.id, id));
    if (!row || row.deleted) return { ok: false, error: '댓글이 없어요' };
    if (row.ownerHash !== ownerHashOf(ownerToken)) return { ok: false, error: '본인 댓글만 삭제할 수 있어요' };
    await db.update(comments).set({ deleted: true }).where(eq(comments.id, id));
    return { ok: true };
  } catch {
    return { ok: false, error: '일시적인 오류' };
  }
}

// reportComment는 기존 그대로 유지.

export async function listComments(): Promise<CommentView[]> {
  try {
    const rows = await db
      .select({
        id: comments.id, nickname: comments.nickname, body: comments.body,
        createdAt: comments.createdAt, topPoliticians: results.topPoliticians,
      })
      .from(comments)
      .leftJoin(results, eq(comments.resultId, results.id))
      .where(eq(comments.deleted, false))
      .orderBy(desc(comments.createdAt))
      .limit(100);
    return rows.map((r) => {
      const topId = (r.topPoliticians as MatchResult[] | null)?.[0]?.politicianId;
      const pol = topId ? POLITICIAN_MAP[topId] : undefined;
      return {
        id: r.id, nickname: r.nickname, body: r.body, createdAt: r.createdAt.toISOString(),
        badge: pol ? { face: pol.face, party: pol.party, politicianName: pol.name } : null,
      };
    });
  } catch {
    return [];
  }
}
```

NOTE: `import { POLITICIAN_MAP }`/`TYPE_MAP`은 파일 상단 정적 import로 올린다(기존 listComments의 동적 import 제거). `scryptSync` 등 미사용 import는 제거해 빌드 unused 경고 방지.

- [ ] **Step 3: 검증**

Run: `npx tsc --noEmit` → 클린. `npm run build` → 성공(빌드는 DB 미접속).
DB 마이그레이션(`npm run db:push`)·E2E는 **자격증명 확보 후**로 연기(다음 운영 단계). 스키마가 바뀌었으므로 출시 전 `db:push` 필수 — 플랜 말미 노트 참조.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(design): 댓글 신원모델 교체(랜덤닉 + localStorage 토큰, 비번 제거)"
```

---

### Task 10: Comments 컴포넌트 재단장

**Files:** Modify(전면 교체) `src/components/Comments.tsx`

- [ ] **Step 1: `src/components/Comments.tsx` 전체 교체** (닉네임/비번 입력 제거, 토큰 기반, 새 레이아웃)

```tsx
// src/components/Comments.tsx
'use client';

import { useEffect, useState } from 'react';
import { addComment, deleteComment, listComments, reportComment, type CommentView } from '@/app/actions';
import { partyColor } from '@/lib/parties';
import PixelAvatar from '@/components/ui/PixelAvatar';
import PoliticianNameBadge from '@/components/ui/PoliticianNameBadge';
import Card from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';

const TOKEN_KEY = 'pg_owner_token';
const RESULT_KEY = 'pg_result_id';

function getOwnerToken(): string | null {
  try {
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) { t = crypto.randomUUID(); localStorage.setItem(TOKEN_KEY, t); }
    return t;
  } catch { return null; }
}

export default function Comments() {
  const [items, setItems] = useState<CommentView[]>([]);
  const [myResultId, setMyResultId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { setMyResultId(localStorage.getItem(RESULT_KEY)); } catch { /* 무시 */ }
    setToken(getOwnerToken());
    void listComments().then(setItems);
  }, []);

  const canWrite = !!myResultId && !!token;

  async function submit() {
    if (!myResultId || !token) return;
    setBusy(true); setError('');
    const res = await addComment({ resultId: myResultId, ownerToken: token, body });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? '실패'); return; }
    setBody(''); setItems(await listComments());
  }
  async function remove(id: string) {
    if (!token) return;
    const res = await deleteComment(id, token);
    if (!res.ok) { alert(res.error); return; }
    setItems(await listComments());
  }
  async function report(id: string) { await reportComment(id); alert('신고가 접수됐어요'); }

  return (
    <Card className="mt-3.5">
      <SectionHeading>광장 댓글 <span className="font-normal text-foreground-faint">— 모든 유형이 모이는 곳</span></SectionHeading>

      {canWrite ? (
        <div className="mb-4">
          <textarea
            value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} rows={2}
            placeholder="내 정치인 뱃지를 달고 한마디"
            className="w-full resize-none rounded-lg border border-border-strong bg-surface-raised px-3 py-2 text-body02"
            data-testid="comment-body"
          />
          {error && <p className="mt-1 text-body02 text-danger">{error}</p>}
          <button onClick={submit} disabled={busy}
            className="mt-2 rounded-lg border border-spectrum-blue-text bg-surface-raised px-4 py-1.5 text-label01 text-spectrum-blue-text disabled:opacity-50"
            data-testid="comment-submit">등록</button>
        </div>
      ) : (
        <p className="mb-4 rounded-lg bg-surface-raised p-3.5 text-body02 text-foreground-subtle">
          댓글은 테스트를 완료한 사람만 쓸 수 있어요. (시크릿 모드에서는 작성이 불가합니다)
        </p>
      )}

      <ul className="flex flex-col">
        {items.map((c) => (
          <li key={c.id} className="flex items-start gap-3.5 border-t border-[#161616] py-4">
            <div className="relative h-12 w-12 flex-shrink-0">
              {c.badge && <>
                <PixelAvatar {...c.badge.face} party={c.badge.party} size={48} />
                <PoliticianNameBadge name={c.badge.politicianName} color={partyColor(c.badge.party)} />
              </>}
            </div>
            <div className="flex-1">
              <div><b className="text-body02">{c.nickname}</b><span className="ml-1.5 text-[10px] text-foreground-faint">{new Date(c.createdAt).toLocaleString('ko-KR')}</span></div>
              <p className="mt-1 whitespace-pre-line text-body02 text-foreground-secondary">{c.body}</p>
              <div className="mt-1.5 flex gap-3 text-[11px] text-foreground-faint">
                <button onClick={() => remove(c.id)} className="hover:text-foreground-secondary">삭제</button>
                <button onClick={() => report(c.id)} className="hover:text-danger">신고</button>
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="py-4 text-body02 text-foreground-faint">아직 댓글이 없어요. 첫 댓글의 주인공이 되어보세요.</p>}
      </ul>
    </Card>
  );
}
```

NOTE: `<Comments>`는 이제 props 없음. 호출처(`r/[id]/page.tsx`)에서 `<Comments resultId=... />` → `<Comments />`로 바꿔야 함(Task 11에서 처리). 작성 자격은 `RESULT_KEY`(테스트 완주 시 저장됨) + 토큰 기준.

- [ ] **Step 2: 검증**

Run: `npx tsc --noEmit` (호출처 미수정이면 에러 가능 — Task 11과 함께 커밋). RadarChart/ResultView/Comments가 모두 새 컴포넌트를 쓰므로 이 시점 `npm run build`는 Task 11 후에 성공.

- [ ] **Step 3: Commit** (Task 11과 묶음 권장)

```bash
git add -A && git commit -m "feat(design): Comments 재단장(토큰 기반·아바타 뱃지 레이아웃)"
```

---

### Task 11: 페이지 재단장 — test / r[id] / 랜딩 / stats + 결과 저장 시 토큰

**Files:** Modify `src/app/test/page.tsx`, `src/app/r/[id]/page.tsx`, `src/app/page.tsx`, `src/app/stats/page.tsx`

- [ ] **Step 1: `src/app/r/[id]/page.tsx` — Comments props 제거 + 컨테이너 다크화**

기존 결과 페이지에서: `import Comments`는 유지, `<Comments resultId={r.id} />` → `<Comments />`로 변경. `<main>` 클래스는 토큰 기반 유지(`mx-auto max-w-[560px] px-[18px] py-12`). 하단 링크 버튼은 `Button` 컴포넌트(secondary)로 교체:

```tsx
import Button from '@/components/ui/Button';
import Link from 'next/link';
// ...
<div className="mt-10 flex justify-center gap-3">
  <Link href="/test"><Button variant="secondary">나도 테스트하기</Button></Link>
  <Link href="/stats"><Button variant="secondary">전체 통계 보기</Button></Link>
</div>
<Comments />
```

- [ ] **Step 2: `src/app/test/page.tsx` — 토큰 발급 + 컴포넌트화**

완주 후 결과 저장 성공 시 `localStorage`에 `pg_result_id`와 함께 `pg_owner_token`(없으면 생성)을 보장한다. 진행 UI를 새 컴포넌트/토큰으로 교체. 핵심 변경만:

`finish()`의 성공 분기에서 토큰 보장 추가:
```ts
if (res.ok) {
  try {
    localStorage.setItem('pg_result_id', res.id);
    if (!localStorage.getItem('pg_owner_token')) localStorage.setItem('pg_owner_token', crypto.randomUUID());
  } catch { /* 무시 */ }
  router.push(`/r/${res.id}`);
}
```

질문/옵션/진행바 마크업을 토큰 클래스로 교체(진행바는 중립색 fill — 아직 lean 미확정이므로 `bg-foreground-subtle`):
```tsx
// 진행 영역
<div className="mb-8">
  <div className="mb-2 flex justify-between text-label01 text-foreground-subtle"><span>Q{answers.length + 1}</span><span>{progress}%</span></div>
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised"><div className="h-full rounded-full bg-foreground-subtle transition-all" style={{ width: `${progress}%` }} /></div>
</div>
<h1 className="mb-8 text-body01 font-bold leading-relaxed">{question.text}</h1>
<div className="flex flex-col gap-3">
  {question.options.map((opt, i) => (
    <button key={i} data-testid="option" onClick={() => answer(i)}
      className="rounded-xl border border-border-strong bg-surface-raised px-5 py-4 text-left text-body01 transition hover:border-spectrum-blue-text">
      {opt.label}
    </button>
  ))}
</div>
{answers.length > 0 && (
  <button onClick={() => setAnswers(answers.slice(0, -1))} className="mt-8 self-start font-mono text-label01 text-foreground-faint hover:text-foreground-subtle">← 이전 질문으로</button>
)}
```
강등(localResult) 분기는 `<Alert>` 컴포넌트로 안내문 교체, `<ResultView>`는 그대로 사용.

- [ ] **Step 3: `src/app/page.tsx` (랜딩) — 다크 + 그라디언트 헤드라인 + 터미널 메타**

```tsx
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { results } from '@/db/schema';
import Button from '@/components/ui/Button';

export const revalidate = 60;

async function participantCount(): Promise<number | null> {
  try { const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(results); return count; } catch { return null; }
}

export default async function Home() {
  const count = await participantCount();
  const grad = { backgroundImage: 'linear-gradient(92deg, #6aa3ff, #b794f6, #ff7b82)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } as const;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-label01 text-foreground-subtle">18문항 내외 · 3분</p>
      <h1 className="mt-3 max-w-xl text-[2.4rem] font-bold leading-tight tracking-[-0.03em]" style={grad}>나의 정치 유형,<br />그리고 나와 가장 가까운 정치인은?</h1>
      <p className="mt-4 max-w-md text-body01 text-foreground-secondary">좌우 하나의 축으로는 알 수 없는 당신의 진짜 좌표. 13가지 유형 중 당신은 어디에?</p>
      <Link href="/test" data-testid="start" className="mt-8"><Button variant="primary" style={{ backgroundImage: 'linear-gradient(92deg,#2f6fe6,#8b5cf6,#e8434b)', padding: '16px 40px', fontSize: '1.05rem' }}>테스트 시작하기</Button></Link>
      {count !== null && count > 0 && <p className="mt-4 font-mono text-label01 text-foreground-faint">지금까지 {count.toLocaleString()}명이 참여했어요</p>}
      <p className="mt-10 max-w-md text-[11px] leading-relaxed text-foreground-faint">결과는 익명으로 저장되며 개인을 식별하는 정보는 수집하지 않습니다. 정치인 매칭은 공개 발언·표결 기록 기반의 참고용 추정입니다.</p>
    </main>
  );
}
```

- [ ] **Step 4: `src/app/stats/page.tsx` 전체 교체** (쿼리 로직 동일, 마크업 다크/스펙트럼)

```tsx
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { results } from '@/db/schema';
import { TYPE_MAP } from '@/data/types';
import { POLITICIAN_MAP } from '@/data/politicians';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';

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
  } catch { return null; }
}

export default async function StatsPage() {
  const stats = await getStats();
  return (
    <main className="mx-auto max-w-[560px] px-[18px] py-12">
      <h1 className="mb-8 text-display02 font-bold tracking-[-0.03em]">전체 통계</h1>
      {!stats || stats.total === 0 ? (
        <p className="text-body02 text-foreground-subtle">아직 집계할 데이터가 없어요.</p>
      ) : (
        <>
          <p className="mb-6 font-mono text-label01 text-foreground-subtle">총 {stats.total.toLocaleString()}명 참여 · 1분마다 갱신</p>
          <section className="mb-10">
            <SectionHeading>유형 분포</SectionHeading>
            {stats.byType.map((r) => {
              const pct = Math.round((r.count / stats.total) * 1000) / 10;
              return (
                <div key={r.typeId} className="mb-2.5">
                  <div className="mb-1 flex justify-between text-body02">
                    <span>{TYPE_MAP[r.typeId]?.name ?? r.typeId}</span>
                    <span className="text-foreground-subtle">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
                    <div className="h-full rounded-full bg-spectrum-violet" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </section>
          <section>
            <SectionHeading>가장 많이 매칭된 정치인 (1위 기준)</SectionHeading>
            <ol className="flex flex-col gap-1 text-body02">
              {stats.byPol.slice(0, 10).map((r, i) => (
                <li key={r.polId ?? i} className="flex justify-between rounded-lg bg-surface-raised px-4 py-2">
                  <span>{i + 1}. {POLITICIAN_MAP[r.polId]?.name ?? '?'}</span>
                  <span className="text-foreground-subtle">{r.count}명</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
      <div className="mt-10 text-center">
        <Link href="/test"><Button variant="primary" style={{ backgroundImage: 'linear-gradient(92deg,#2f6fe6,#8b5cf6,#e8434b)' }}>나도 테스트하기</Button></Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: 검증**

Run: `npx tsc --noEmit` → 클린. `npm run test` → 48+ PASS(로직 불변). `npm run build` → 성공(모든 페이지 새 컴포넌트로 컴파일).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(design): 페이지 재단장(결과/테스트/랜딩/통계) + 댓글 토큰 발급"
```

---

### Task 12: OG 이미지 재단장 + 최종 검증

**Files:** Modify `src/app/r/[id]/opengraph-image.tsx`

- [ ] **Step 1: OG 이미지 다크/스펙트럼 정렬**

기존 OG는 Pretendard-Bold + 어두운 배경. 배경을 `#0a0a0a`로, 유형명에 스펙트럼 텍스트(단색 근사: 좌/우에 따라 `#6aa3ff`/`#ff7b82`, 중도 `#b794f6`)를 적용한다. 폰트는 기존 `Pretendard-Bold.otf` 유지(OG는 ImageResponse라 BookkGothic ttf로 교체해도 무방하나, 동작 검증된 기존 폰트 유지). 변경 핵심:
```tsx
import { leanOf } from '@/lib/spectrum';
// const r = await getResult(id); const type = r ? TYPE_MAP[r.typeId] : undefined;
// const lean = r ? leanOf(r.state) : 0;
// const color = lean <= -30 ? '#6aa3ff' : lean >= 30 ? '#ff7b82' : '#b794f6';
// 배경 #0a0a0a, 유형명 div style color: color
```
`getResult`가 `state`(UserState)를 반환하므로 `leanOf(r.state)` 사용 가능.

- [ ] **Step 2: 최종 검증**

```bash
cd /Users/seungboshim/Projects/personal/politic-graph
npm run test        # 단위 전체 PASS (페르소나/스코어링/데이터/avatar/parties/spectrum/nick)
npm run build       # 빌드 성공
npx tsc --noEmit    # 타입 에러 없음
```

수동 체크리스트(가능 시 `.env.local` DB 연결 후 `npm run dev`):
- [ ] 라이트모드 잔재 없음(전 페이지 다크)
- [ ] 결과 페이지: 좌/중도/우 결과의 유형명·바·레이더 색이 스펙트럼으로 다름, 텍스트 시인성 OK
- [ ] 정치인 행: 아바타 + 정당색 넥타이 + 태그(데이터 있으면) + 스펙트럼 바
- [ ] 댓글: 닉네임/비번 입력 없음, 본문만. 댓글 항목에 아바타 + 정치인 이름 뱃지
- [ ] 진영/섹션 라벨이 `// `, `> ` 터미널 형식(대문자·자간 없음)
- [ ] OG 이미지 다크 렌더

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(design): OG 이미지 다크/스펙트럼 정렬 + 최종 검증"
```

---

## 출시 전 필수(다음 운영 단계) · 데이터 단계 인계

- **DB 마이그레이션**: `comments` 스키마가 `password_hash → owner_hash`로 바뀌었다. Supabase 자격증명 확보 후 `npm run db:push` 필수. 기존 댓글 데이터가 있으면 `password_hash` 컬럼 제거·`owner_hash` 추가 마이그레이션 영향 확인(개발 DB면 테이블 재생성 가능).
- **E2E 갱신**: `e2e/smoke.spec.ts`는 댓글 작성 시 닉네임/비번 입력을 더 이상 하지 않으므로(본문만) 해당 단계 수정 필요. 라이브 DB 연결 후 갱신·실행.
- **데이터 단계(Gemini 협업)**: 질문 문구/델타, 유형 벡터·`nickLabel` 최종화, 정치인 벡터·`face` 검수·`tags` 작성, 정당 9종으로 `party` 재매핑(권영국·장혜영 등), 좌파 NL/PD 통합(`postmodern-left` 정리). 전부 `src/data/*` 값 수정 + `npm run test`(페르소나 골든) 회귀 확인으로 처리.

## 디자인 면책

색·폰트의 미적 완성은 토큰 위에서 추후 튜닝(스펙 §5). 본 플랜은 구조(토큰·컴포넌트·스키마) 확정까지가 범위다.
