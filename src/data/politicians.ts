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
  { id: 'lee-js', name: '이준석', party: '개혁신당', vector: { axes: { econ: 60, social: 10, security: 45, trust: 45, gender: 75, engage: E }, impeach: 'pro', fraud: 5, leejm: 95, prosec: 20 } },
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
