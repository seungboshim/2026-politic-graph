# 정치성향 테스트 — 디자인 시스템 설계

**날짜**: 2026-06-09
**상태**: 사용자 승인 대기
**범위**: 디자인 시스템(토큰 + 컴포넌트 구조)만. 질문지·유형·정치인 데이터 정비는 별도 스펙으로 분리(다음 단계).
**관련 목업**: `.superpowers/brainstorm/.../component-gallery.html`, `full-screen-v4.html`, `avatar-final2.html`

## 0. 핵심 원칙

- **다크 전용.** 라이트모드 제거.
- **비주얼 토큰은 잠정(교체 가능), 컴포넌트 구조는 확정.** 현재 룩(다크 + 픽셀 + 좌우 스펙트럼 액센트)은 미적 완성 단계가 아니며, **시맨틱 토큰 한 겹**을 거쳐 색·폰트·글로우를 나중에 통째로 바꿀 수 있게 한다. 컴포넌트의 책임·조합(레이아웃)은 이 스펙에서 고정한다.
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
| `success` | emerald-400 | #34d399 | 상태 |
| `warning` | amber-300 | #fcd34d | 상태 |
| `danger` | red-500 | #ef4444 | 상태 |

> 네이밍 충돌 주의: `background`/`surface`는 `bg-background`/`bg-surface`로 안전. (`color-bg` 같은 접두사 중복 회피.)
> 액센트는 네온(cyan/fuchsia)을 **폐기**하고 아래 좌우 스펙트럼으로 대체한다.

### 액센트 — 좌우 정치 스펙트럼 (네온 폐기, 확정)
브랜드 액센트 = **좌(민주 블루) ↔ 우(국힘 레드)** 정치 축. 임의 네온 대신 이 스펙트럼을 유형명·유사도 바·레이더·CTA에 쓴다. (정당 브랜드색이 좌우와 일치하는 건 민주·국힘뿐이라, 스펙트럼은 "좌=파랑/우=빨강" 추상 축으로만 쓰고 **넥타이·뱃지는 §정당색을 그대로 유지**한다.)

**적응형(확정)**: 결과의 좌우 위치 `lean = (econ + social + security)/3` 에 따라 액센트 그라디언트가 달라진다 — 좌향은 파랑, 우향은 빨강, 중도는 보라. "내 결과가 내 정치색으로 칠해진다."

| lean | 그라디언트(좌→우 stop) |
|---|---|
| ≤ −30 (좌) | `spectrum-blue → spectrum-violet` |
| −30 ~ +30 (중도) | `spectrum-blue-mid → spectrum-violet-mid` (보라 계열) |
| ≥ +30 (우) | `spectrum-violet → spectrum-red` |

**두 단(tier) — 채움은 진하게, 텍스트는 밝게** (다크 배경 시인성):

| 역할 | 토큰 | hex | 용도 |
|---|---|---|---|
| 채움 | `spectrum-blue` | #2f6fe6 | 바·레이더 fill 좌극 |
| 채움 | `spectrum-violet` | #8b5cf6 | 중간 |
| 채움 | `spectrum-red` | #e8434b | 바·레이더 fill 우극 |
| 텍스트 | `spectrum-blue-text` | #6aa3ff | 그라디언트 텍스트(유형명·%) 좌극 |
| 텍스트 | `spectrum-violet-text` | #b794f6 | 중간 |
| 텍스트 | `spectrum-red-text` | #ff7b82 | 그라디언트 텍스트 우극 |

- **규칙**: 텍스트(유형명·유사도 %·액센트 카피)는 `*-text`(밝은) 톤만 사용. 바·레이더 등 면 채움은 진한 톤 사용. 대형 볼드 텍스트 기준 대비 ≥3:1 확보.
- 토큰은 `--color-spectrum-*`로 정의. 적응형 그라디언트는 런타임에 `lean`으로 stop을 고르는 헬퍼(`accentGradient(lean, 'fill'|'text')`)로 생성.

### 정당색 — 공식 메인컬러 (`PARTY_COLORS` TS 맵, ⚠ 값 검증 필요)
정당명 → 공식 hex. 넥타이·정치인 뱃지·유사도 바 톤에 사용. 정치인 데이터가 정당 문자열로 참조하므로 CSS 토큰이 아닌 **TS 상수 맵**으로 둔다(정당 추가/변경은 이 맵만 수정).

**정당 범위 확정**: 8개 정당 + 무소속. 정의당계 군소(기본소득당·사회민주당·녹색당)는 의석·인지도가 미미하므로 별도로 풀지 않고 **정의**로 통합한다.

| 정당 | hex | 비고 |
|---|---|---|
| 더불어민주당 | #003B96 | 2024 리브랜드 메인 블루 |
| 국민의힘 | #E61E2B | |
| 개혁신당 | #FF7210 | 주황 |
| 조국혁신당 | #0073CF | 파랑 |
| 진보당 | #D6001C | |
| 정의당 | #FFED00 | 정의당계 군소 통합 라벨 |
| 새로운미래 | #45BABD | 청록 |
| 자유통일당 | #E33334 | |
| 무소속 | #808080 | |

> 출처: 한국어 위키백과 〈틀:정당색/대한민국〉 원문(2026-06 기준)으로 검증. (나무위키 〈대한민국/정당〉은 403으로 직접 참조 불가.) 국민의힘·진보당·자유통일당이 모두 적색 계열이라 아바타 넥타이 변별이 약할 수 있으나 "공식색 우선" 방침에 따라 그대로 사용한다(필요 시 명도/채도 미세 보정만). **정치인 데이터는 이 9개 party 문자열만 사용**한다(다음 단계).

### 타이포그래피 — BookkGothic (Light 400 / Bold 700), 넘버링 토큰
- **폰트**: BookkGothic 단일 패밀리. `public/fonts/`에 `BookkGothic_Light.ttf`(400) · `BookkGothic_Bold.ttf`(700) 복사 후 `globals.css`에서 `@font-face` 2개 정의. `--font-sans`(=`--color`와 동급의 `--font-*` 네임스페이스)에 `'BookkGothic', ui-monospace, system-ui, sans-serif` 폴백 스택.
- **2 weight 제약**: 사용 가능한 굵기는 `font-normal`(400=Light)·`font-bold`(700=Bold)뿐. 500/600 등 중간 굵기는 합성(가짜 볼드)되므로 금지. 위계는 **크기 + L/B + 색 + 자간**으로 만든다.
- **스케일** (`--text-*` 네임스페이스, 01=가장 큼):

**자간 확정**: 전체적으로 좁힌다. 기본 `letter-spacing: -0.02em`, display는 -0.03em. 대문자 라벨(label02)만 가독성 위해 +0.05em.

| 토큰 (`text-*`) | size | weight | tracking | 용도 |
|---|---|---|---|---|
| `display01` | 2rem(32px) | Bold | -0.03em | 결과 유형명(히어로) |
| `display02` | 1.5rem(24px) | Bold | -0.03em | 랜딩 헤드라인 |
| `heading01` | 1rem(16px) | Bold | -0.02em | 큰 섹션 제목 |
| `heading02` | 0.8125rem(13px) | Bold | -0.02em | 카드 섹션 제목 |
| `body01` | 0.9375rem(15px) | Light | -0.02em | 질문문·태그라인 |
| `body02` | 0.8125rem(13px) | Light | -0.02em | 본문·설명·댓글 |
| `label01` | 0.6875rem(11px) | Light | -0.02em (foreground-subtle) | 메타(정당·시간) |
| `label02` | 0.625rem(10px) | Bold | +0.05em·uppercase | 라벨(진영·섹션캡) |

- 그라디언트 텍스트(유형명·유사도 %)는 §액센트의 **밝은 텍스트 스펙트럼**(`spectrum-*-text`)을 `lean`에 맞춰 `bg-clip-text`로 적용.

### 기타
- radius: 카드·버튼 ~10–12px, 칩 ~5–6px (Tailwind `rounded-xl`/`rounded-md`).
- 글로우: 액센트 요소에 스펙트럼색 `shadow`/`drop-shadow`. (잠정)
- 간격: Tailwind 기본 4px 스케일.
- 픽셀 렌더링: 아바타 SVG는 `image-rendering: pixelated` + 정수배 표시.

## 2. 컴포넌트 인벤토리 (구조 확정)

### 프리미티브
- **`<PixelAvatar>`** — props `{ sex:'m'|'f', hair:'up'|'down'|'bob', hairColor:'black'|'silver', glasses:boolean, party:string, size:number }`. 20px 그리드 SVG를 코드 생성(에셋 없음), 흰색 1px 실루엣 아웃라인(feMorphology). 무안경=세로 눈(1×2, 중앙), 안경=검은 사각테+1×1 눈. 여성 긴머리는 목뒤·어깨까지 채움. 넥타이=정당색. 사이즈 가변(24~96px).
- **`<Button>`** — variant: `primary`(스펙트럼 그라디언트), `secondary`(아웃라인), `ghost`(텍스트).
- **`<Chip>`** (유형 키워드 #해시태그) / **`<Tag>`** (정치인 태그) — 시각적으로 구분되는 두 종류.
- **`<ProgressBar>`** — 스펙트럼 그라디언트 fill. 유사도와 진행률에 공용.
- **`<PoliticianNameBadge>`** — 아바타 우측하단에 겹치는 정당색 테두리 칩(정치인 이름).
- **`<Card>`** / **`<SectionHeading>`** — 섹션 컨테이너 + 소제목 라벨.
- **`<Alert>`** — 우아한 강등/오류 안내 배너.

### 조합
- **`<TypeResultCard>`** — 진영 라벨 → 그라디언트 유형명 → 태그라인 → 설명 → 키워드 Chip[] → "N%가 같은 유형" 통계.
- **`<PoliticianMatchRow>`** = PixelAvatar + 이름/정당 + 유사도% + Tag[] + ProgressBar. (※ 기존 "태깅 근거(evidence)" 표시는 제거. 대신 정치인 `tags` 노출 — 데이터에 `tags: string[]` 추가 필요)
- **`<RadarChart>`** — 6축(시장/전통/안보/신뢰/반페미/관여) SVG, 다크+스펙트럼 그라디언트 채움.
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

### 다음 데이터 단계로 넘기는 확정 결정 (메모)
- **정당 범위 = 8개 + 무소속** (위 §1). 정치인 데이터의 `party`는 이 문자열만 사용.
- **좌파 유형은 NL / PD 2분만.** 포스트모던 진보는 별도 유형으로 분리하지 않음(젠더·소수자 변별은 연속축 `gender`/`social`이 흡수). → 기존 13유형에서 `postmodern-left` 통합 검토.
- **정의당계 군소(기본소득·사회민주·녹색) 미분리** → "정의" 버킷.
- **정치인 정당 재매핑 필요**: 기존 데이터의 `민주노동당`(권영국)·`전 정의당`(장혜영) 등은 위 9개 라벨로 재배정. `evidence` 필드 제거, `tags: string[]` 추가.
