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

### 색 (시맨틱)
| 토큰 | 잠정값 | 용도 |
|---|---|---|
| `--bg` | #06090f | 페이지 배경 |
| `--surface` | #0a0e14 | 카드 |
| `--raised` | #11161d | 입력·칩·옵션 |
| `--border` / `--border2` | #1c2430 / #283041 | 구분선 / 강조 테두리 |
| `--text` / `--text2` / `--muted` / `--faint` | #e8edf5 / #aeb6c4 / #5b6577 / #46505f | 본문 위계 |
| `--accent1` / `--accent2` / `--accent3` | #4cc9f0 / #f72585 / #b388ff | 시안·마젠타·바이올렛 (그라디언트·글로우) |
| `--ok` / `--warn` / `--danger` | #3ddc97 / #e6c463 / #e8434b | 상태 |

### 정당색 (`PARTY_COLORS`, 데이터 토큰)
더불어민주당 #2f86e0 · 국민의힘 #e8434b · 개혁신당 #ff8a2a · 조국혁신당 #2bb3e0 · 진보당/민주노동당 #e0294f · 새로운미래 #13c2b0 · 자유통일당 #c41f33 · 무소속 #98a1ad. 넥타이·정치인 뱃지·유사도 바 톤에 사용. 정당 추가/변경은 이 맵만 수정.

### 타이포그래피
- 기본: 모노스페이스 스택 (`ui-monospace, SFMono-Regular, Menlo, monospace`). 픽셀 비트맵 폰트(예: DungGeunMo/Galmuri) 도입은 후속 옵션 — 토큰(`--font-display`)으로 분리해 둔다.
- 스케일: display(28~34px/800, 그라디언트 텍스트) · h2(13px/700) · body(13px) · small(11px) · label(10px, uppercase, letter-spacing).

### 기타
- radius: `--r` 10–12px(카드·버튼), `--rs` 5–6px(칩). 
- 글로우: 액센트 요소에 `box-shadow`/`drop-shadow` 네온 (토큰화).
- 간격: 4px 베이스 스케일.
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
