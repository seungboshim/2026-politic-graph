// src/data/politicians.ts
import { Politician } from './schema';

// engage는 정치인 매칭에서 제외되지만 스키마 일관성을 위해 80 고정.
const E = 80;

export const POLITICIANS: Politician[] = [
  // ─ 진보·민주 진영
  { id: 'lee-jm', name: '이재명', party: '더불어민주당', vector: { axes: { econ: -55, social: -20, security: -35, trust: -10, gender: -10, engage: E }, impeach: 'pro', fraud: 0, leejm: 0, prosec: 75 }, face: { sex: 'm', hair: 'down', hairColor: 'black', glasses: true }, tags: ['#이재명정부', '#개혁행보', '#당원주권'] },
  { id: 'jung-cr', name: '정청래', party: '더불어민주당', vector: { axes: { econ: -50, social: -25, security: -40, trust: -30, gender: -15, engage: E }, impeach: 'pro', fraud: 0, leejm: 20, prosec: 95 }, face: { sex: 'm', hair: 'down', hairColor: 'black', glasses: false }, tags: ['#선명야당', '#당대표', '#언론사법개혁'] },
  { id: 'cho-k', name: '조국', party: '조국혁신당', vector: { axes: { econ: -45, social: -40, security: -30, trust: -45, gender: -30, engage: E }, impeach: 'pro', fraud: 0, leejm: 45, prosec: 100 }, face: { sex: 'm', hair: 'down', hairColor: 'silver', glasses: true }, tags: ['#검찰해체', '#조국혁신', '#선명진보'] },
  { id: 'kim-dy', name: '김동연', party: '더불어민주당', vector: { axes: { econ: -25, social: -15, security: -10, trust: 45, gender: -10, engage: E }, impeach: 'pro', fraud: 0, leejm: 75, prosec: 40 }, face: { sex: 'm', hair: 'up', hairColor: 'silver', glasses: false }, tags: ['#경제유능', '#합리적자유', '#이견존중'] },
  // ─ 진보정당
  { id: 'kwon-yg', name: '권영국', party: '정의당', vector: { axes: { econ: -85, social: -55, security: -45, trust: -35, gender: -55, engage: E }, impeach: 'pro', fraud: 0, leejm: 60, prosec: 85 }, face: { sex: 'm', hair: 'down', hairColor: 'black', glasses: true }, tags: ['#노동중심', '#현장주의', '#양당심판'] },
  { id: 'kim-jy', name: '김재연', party: '진보당', vector: { axes: { econ: -85, social: -45, security: -80, trust: -45, gender: -45, engage: E }, impeach: 'pro', fraud: 0, leejm: 50, prosec: 85 }, face: { sex: 'f', hair: 'bob', hairColor: 'black', glasses: false }, tags: ['#노동자연대', '#반미자주', '#진보정치'] },
  { id: 'jang-hy', name: '장혜영', party: '정의당', vector: { axes: { econ: -65, social: -85, security: -40, trust: -15, gender: -90, engage: E }, impeach: 'pro', fraud: 0, leejm: 70, prosec: 60 }, face: { sex: 'f', hair: 'down', hairColor: 'black', glasses: true }, tags: ['#차별금지법', '#젠더진보', '#기후정치'] },
  // ─ 제3지대·중도·보수
  { id: 'lee-js', name: '이준석', party: '개혁신당', vector: { axes: { econ: 65, social: 10, security: 45, trust: 45, gender: 85, engage: E }, impeach: 'pro', fraud: 10, leejm: 95, prosec: 20 }, face: { sex: 'm', hair: 'up', hairColor: 'black', glasses: false }, tags: ['#공정경쟁', '#반페미', '#개혁보수'] },
  { id: 'oh-sh', name: '오세훈', party: '국민의힘', vector: { axes: { econ: 40, social: 20, security: 50, trust: 50, gender: 20, engage: E }, impeach: 'pro', fraud: 5, leejm: 90, prosec: 15 }, face: { sex: 'm', hair: 'up', hairColor: 'black', glasses: false }, tags: ['#수도권실용', '#약자와의동행', '#대권주자'] },
  { id: 'han-dh', name: '한동훈', party: '무소속', vector: { axes: { econ: 50, social: 30, security: 60, trust: 65, gender: 25, engage: E }, impeach: 'pro', fraud: 5, leejm: 95, prosec: 10 }, face: { sex: 'm', hair: 'down', hairColor: 'black', glasses: true }, tags: ['#법치와상식', '#복당론', '#차기대권'] },
  { id: 'jang-dh', name: '장동혁', party: '국민의힘', vector: { axes: { econ: 50, social: 50, security: 65, trust: 35, gender: 35, engage: E }, impeach: 'antiMild', fraud: 45, leejm: 95, prosec: 10 }, face: { sex: 'm', hair: 'down', hairColor: 'black', glasses: false }, tags: ['#장동혁지도부', '#선관위정국', '#정면돌파'] },
  // ─ 광장 우파
  { id: 'jeon-hg', name: '전한길', party: '무소속', vector: { axes: { econ: 45, social: 75, security: 75, trust: -75, gender: 55, engage: E }, impeach: 'yoonAgain', fraud: 90, leejm: 100, prosec: 0 }, face: { sex: 'm', hair: 'up', hairColor: 'silver', glasses: false }, tags: ['#애국우파', '#장외투쟁', '#강성보수'] },
  { id: 'jeon-kh', name: '전광훈', party: '자유통일당', vector: { axes: { econ: 35, social: 95, security: 85, trust: -70, gender: 70, engage: E }, impeach: 'yoonAgain', fraud: 95, leejm: 100, prosec: 0 }, face: { sex: 'm', hair: 'up', hairColor: 'silver', glasses: false }, tags: ['#광화문애국', '#주사파척결', '#기독우파'] },
];

export const POLITICIAN_MAP: Record<string, Politician> = Object.fromEntries(POLITICIANS.map((p) => [p.id, p]));
