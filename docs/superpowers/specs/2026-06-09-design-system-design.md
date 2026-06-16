# 정치성향 테스트 — 디자인 시스템 설계

**날짜**: 2026-06-09
**상태**: 사용자 승인 대기
**범위**: 디자인 시스템(토큰 + 컴포넌트 구조)만. 질문지·유형·정치인 데이터 정비는 별도 스펙으로 분리(다음 단계).
**관련 목업**: `.superpowers/brainstorm/.../component-gallery.html`, `full-screen-v4.html`, `avatar-final2.html`

## 0. 핵심 원칙

- **다크 전용.** 라이트모드 제거.
- **비주얼 토큰은 잠정(교체 가능), 컴포넌트 구조는 확정.** 현재 "네온 하이브리드" 룩은 만족 단계가 아니며, **시맨틱 토큰 한 겹**을 거쳐 색·폰트·글로우를 나중에 통째로 바꿀 수 있게 한다. 컴포넌트의 책임·조합(레이아웃)은 이 스펙에서 고정한다.
- **픽셀/터미널 정체성 유지.** 모노스페이스 기반, 픽셀 도트 아바타, 정당색 액센트.
- 기존 MVP(`master`)의 페이지·서버액션 구조 위에 **스타일 레이어와 컴포넌트만 교체**한다. 채점·엔진·DB 로직은 건드리지 않는다.

## 1. 토큰 (잠정 값 — `globals.css`의 CSS 변수 + Tailwind 테마)

모든 컴포넌트는 raw hex가 아니라 시맨틱 토큰만 참조한다. 룩 변경 = 토큰 값만 교체.

**확정 규칙**: 비-정당색은 전부 **Tailwind 기본 팔레트**(neutral 베이스 + 액센트)에 매핑하고 raw hex를 쓰지 않는다. 시맨틱 토큰명은 **foreground / background / surface** 계열. Tailwind v4 `@theme inline`의 `--color-*` 네임스페이스로 정의해 `bg-surface` / `text-foreground` 등 유틸리티를 생성한다.

### 색 — 시맨틱 토큰 (다크 전용, Tailwind 매핑 확정)
| 토큰 (`--color-*`) | Tailwind | hex | 용도 |
|---|---|---|---|
| `background` | neutral-950 | #0a0a0a | 페이지 배경 |
| `surface` | neutral-900 | #171717 | 카드 |
| `surface-raised` | neutral-800 | #262626 | 입력·칩·옵션 |
| `border` | neutral-800 | #262626 | 구분선 |
| `border-strong` | neutral-700 | #404040 | 강조 테두리 |
| `foreground` | neutral-100 | #f5f5f5 | 본문 1차 |
| `foreground-secondary` | neutral-400 | #a3a3a3 | 본문 2차 |
| `foreground-subtle` | neutral-500 | #737373 | 메타 |
| `foreground-faint` | neutral-600 | #525252 | 가장 흐림 |
| `brand` | cyan-400 | #22d3ee | 네온 액센트1 |
| `brand-2` | fuchsia-500 | #d946ef | 네온 액센트2 |
| `brand-3` | violet-400 | #a78bfa | 그라디언트 중간 |
| `success` | emerald-400 | #34d399 | 상태 |
| `warning` | amber-300 | #fcd34d | 상태 |
| `danger` | red-500 | #ef4444 | 상태 |

> 네이밍 충돌 주의: `background`/`surface`는 `bg-background`/`bg-surface`로 안전. (`color-bg` 같은 접두사 중복 회피.)

### 정당색 — 공식 메인컬러 (`PARTY_COLORS` TS 맵, ⚠ 값 검증 필요)
정당명 → 공식 hex. 넥타이·정치인 뱃지·유사도 바 톤에 사용. 정치인 데이터가 정당 문자열로 참조하므로 CSS 토큰이 아닌 **TS 상수 맵**으로 둔다(정당 추가/변경은 이 맵만 수정).

| 정당 | hex | 비고 |
|---|---|---|
| 더불어민주당 | #003B96 | 2024 리브랜드 메인 블루 |
| 국민의힘 | #E61E2B | |
| 개혁신당 | #FF7210 | 주황 |
| 조국혁신당 | #0073CF | 파랑 |
| 진보당 | #D6001C | |
| 민주노동당 | #FFED00 | |
| 새로운미래 | #45BABD | 청록 |
| 전 정의당(녹색정의당) | #007C36 | 녹색 (정의당 #FFED00과 구분 위해 녹색정의당 색 사용) |
| 자유통일당 | #E33334 | |
| 무소속 | #808080 | |

> 출처: 한국어 위키백과 〈틀:정당색/대한민국〉 원문(2026-06 기준)으로 검증. 국민의힘·진보당·자유통일당이 모두 적색 계열이라 아바타 넥타이 변별이 약할 수 있으나, "공식색 우선" 방침에 따라 그대로 사용한다(필요 시 명도/채도 미세 보정만).

### 타이포그래피 — BookkGothic (Light 400 / Bold 700), 넘버링 토큰
- **폰트**: BookkGothic 단일 패밀리. `public/fonts/`에 `BookkGothic_Light.ttf`(400) · `BookkGothic_Bold.ttf`(700) 복사 후 `globals.css`에서 `@font-face` 2개 정의. `--font-sans`(=`--color`와 동급의 `--font-*` 네임스페이스)에 `'BookkGothic', ui-monospace, system-ui, sans-serif` 폴백 스택.
- **2 weight 제약**: 사용 가능한 굵기는 `font-normal`(400=Light)·`font-bold`(700=Bold)뿐. 500/600 등 중간 굵기는 합성(가짜 볼드)되므로 금지. 위계는 **크기 + L/B + 색 + 자간**으로 만든다.
- **스케일** (`--text-*` 네임스페이스, 01=가장 큼):

| 토큰 (`text-*`) | size | weight | 비고 | 용도 |
|---|---|---|---|---|
| `display01` | 2rem(32px) | Bold | tracking -0.5 | 결과 유형명(히어로) |
| `display02` | 1.5rem(24px) | Bold | tracking -0.3 | 랜딩 헤드라인 |
| `heading01` | 1rem(16px) | Bold | | 큰 섹션 제목 |
| `heading02` | 0.8125rem(13px) | Bold | | 카드 섹션 제목 |
| `body01` | 0.9375rem(15px) | Light | | 질문문·태그라인 |
| `body02` | 0.8125rem(13px) | Light | | 본문·설명·댓글 |
| `label01` | 0.6875rem(11px) | Light | foreground-subtle | 메타(정당·시간) |
| `label02` | 0.625rem(10px) | Bold | uppercase·tracking +1.5 | 라벨(진영·섹션캡) |

- 그라디언트 텍스트(유형명)는 `brand→brand-3→brand-2` 선형 그라디언트 + `bg-clip-text`. (잠정 — 아트디렉션 튜닝 대상)

### 기타
- radius: 카드·버튼 ~10–12px, 칩 ~5–6px (Tailwind `rounded-xl`/`rounded-md`).
- 글로우: 액센트 요소에 네온 `shadow`/`drop-shadow`. (잠정)
- 간격: Tailwind 기본 4px 스케일.
- 픽셀 렌더링: 아바타 SVG는 `image-rendering: pixelated` + 정수배 표시.

## 2. 컴포넌트 인벤토리 (구조 확정)

### 프리미티브
- **`<PixelAvatar>`** — props `{ sex:'m'|'f', hair:'up'|'down'|'bob', hairColor:'black'|'silver', glasses:boolean, party:string, size:number }`. 20px 그리드 SVG를 코드 생성(에셋 없음), 흰색 1px 실루엣 아웃라인(feMorphology). 무안경=세로 눈(1×2, 중앙), 안경=검은 사각테+1×1 눈. 여성 긴머리는 목뒤·어깨까지 채움. 넥타이=정당색. 사이즈 가변(24~96px).
- **`<Button>`** — variant: `primary`(네온 그라디언트), `secondary`(아웃라인), `ghost`(텍스트).
- **`<Chip>`** (유형 키워드 #해시태그) / **`<Tag>`** (정치인 태그) — 시각적으로 구분되는 두 종류.
- **`<ProgressBar>`** — 네온 그라디언트 fill. 유사도와 진행률에 공용.
- **`<PoliticianNameBadge>`** — 아바타 우측하단에 겹치는 정당색 테두리 칩(정치인 이름).
- **`<Card>`** / **`<SectionHeading>`** — 섹션 컨테이너 + 소제목 라벨.
- **`<Alert>`** — 우아한 강등/오류 안내 배너.

### 조합
- **`<TypeResultCard>`** — 진영 라벨 → 그라디언트 유형명 → 태그라인 → 설명 → 키워드 Chip[] → "N%가 같은 유형" 통계.
- **`<PoliticianMatchRow>`** = PixelAvatar + 이름/정당 + 유사도% + Tag[] + ProgressBar. (※ 기존 "태깅 근거(evidence)" 표시는 제거. 대신 정치인 `tags` 노출 — 데이터에 `tags: string[]` 추가 필요)
- **`<RadarChart>`** — 6축(시장/전통/안보/신뢰/반페미/관여) SVG, 다크+네온 그라디언트 채움.
- **테스트 진행** — `<QuestionProgress>`(Q번호+%+바) · `<QuestionPrompt>`(질문문) · `<OptionButton>`(선택지) · 뒤로 `<Button ghost>`.
- **댓글** — `<CommentComposer>`(자동 랜덤닉 표시 + 본문 textarea + 등록) · `<CommentItem>`(좌: Avatar+NameBadge / 우: 랜덤닉+시간+본문+삭제·신고).
- **통계** — `<StatBar>`(유형 분포 라벨드 바) · `<RankRow>`(정치인 1위 매칭 랭킹).
- **`<LandingHero>`** — 헤드라인 + 서브 + CTA + 참여수 + 면책 문구.
- **`<AppHeader>`** — `● politic-graph` + 컨텍스트 라벨(터미널풍 상단바).

### 페이지 = 컴포넌트 조합
- `/` = AppHeader + LandingHero
- `/test` = QuestionProgress + QuestionPrompt + OptionButton[] + Button(ghost)
- `/r/[id]` = TypeResultCard + PoliticianMatchRow[] + RadarChart + Button[] + CommentComposer + CommentItem[]
- `/stats` = StatBar[] + RankRow[]
- `not-found` = 안내 + Button

## 3. 댓글 신원 모델 변경 (기존 MVP 대비)

기존: 닉네임 입력 + 비밀번호 해시. **변경**: 
- 닉네임 입력 제거 → **결과 기반 자동 랜덤닉** `{유형단축명}_{uuid4자}` (예: `강성친명_3f9a`). 유형마다 짧은 닉 라벨(`nickLabel`)을 둔다.
- 비밀번호 제거 → **localStorage 사용자 토큰**으로 본인 댓글 식별/삭제. 댓글 작성 자격도 동일 토큰(테스트 완료자) 기준.
- 서버는 여전히 `resultId` 존재를 검증하고 속도제한·금칙어를 적용. (구현 시 `comments` 스키마: `passwordHash` → `ownerToken` 해시로 대체, `nickname`은 서버 생성/저장.)

> 이 변경은 데이터·서버액션에 영향이 있으므로, 디자인 시스템 적용 구현 계획에 "댓글 신원 모델 리팩터" 항목으로 포함한다.

## 4. 구현 방식 (다음 단계 계획에서 상세화)

- `globals.css`에 시맨틱 토큰(CSS 변수) 정의 + Tailwind v4 테마 매핑. 컴포넌트는 토큰 클래스만 사용(raw hex 금지).
- `src/components/`에 위 컴포넌트를 분리 신설/교체. `PixelAvatar`는 순수 함수 SVG 빌더(`src/lib/avatar.ts`) + 얇은 컴포넌트 래퍼.
- 기존 페이지(`page.tsx`, `test/`, `r/[id]/`, `stats/`)의 마크업을 새 컴포넌트로 교체. 채점/엔진/DB 로직 불변.
- OG 이미지도 동일 토큰/아바타로 정렬.
- 회귀 방지: 기존 단위/E2E 테스트 유지, 컴포넌트는 시각 중심이라 스냅샷보다 "렌더링 깨짐 없음 + 토큰 참조" 수준으로 검증.

## 5. 명시적 비범위 (이번 스펙 제외)

- 질문지 문구/밸런싱, 유형 정의, 정치인 벡터·태그 콘텐츠 정비 → 별도 스펙.
- 최종 비주얼 아트디렉션 확정(색·폰트의 미적 완성) → 토큰 위에서 추후 튜닝.
- 픽셀 폰트 도입, 사운드/모션 등 부가 연출.
