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
