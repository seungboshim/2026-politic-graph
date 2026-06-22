// src/data/questions.ts
// 문구·구조는 Gemini 데이터 사이클 산출물 채택. 스탠스(leejm/prosec/fraud) 값은
// 엔진의 "기준 50에서 누적되는 델타" 모델에 맞게 재설계됨(절대값 아님).
import { Question } from './schema';

// ───────────────────────── Phase 1 (전원 공통, 9문항)
export const PHASE1: Question[] = [
  {
    id: 'q1', phase: 1, text: '부유층과 대기업에 세금을 더 걷어 복지 재정을 대폭 확대해야 합니까?',
    options: [
      { label: '매우 동의 (분배 우선)', axes: { econ: -40 } },
      { label: '동의', axes: { econ: -20 } },
      { label: '보통 / 중립', axes: { econ: 0 } },
      { label: '비동의', axes: { econ: 20 } },
      { label: '매우 비동의 (감세·성장 우선)', axes: { econ: 40 } },
    ],
  },
  {
    id: 'q2', phase: 1, text: '기업 규제 완화와 시장 자율성 보장이 경제를 살리는 최선의 길입니까?',
    options: [
      { label: '매우 동의 (규제 타파)', axes: { econ: 35 } },
      { label: '동의', axes: { econ: 17 } },
      { label: '보통 / 중립', axes: { econ: 0 } },
      { label: '비동의', axes: { econ: -17 } },
      { label: '매우 비동의 (정부 개입 필요)', axes: { econ: -35 } },
    ],
  },
  {
    id: 'q3', phase: 1, text: '성적 지향, 정체성 등을 포함한 포괄적 차별금지법을 조속히 제정해야 합니까?',
    options: [
      { label: '매우 동의 (인권 우선)', axes: { social: -40 } },
      { label: '동의', axes: { social: -20 } },
      { label: '보통 / 중립', axes: { social: 0 } },
      { label: '비동의', axes: { social: 20 } },
      { label: '매우 비동의 (전통 가치 수호)', axes: { social: 40 } },
    ],
  },
  {
    id: 'q4', phase: 1, text: '명절에 친척 어른이 "요즘 세상은 전통과 기강이 무너져 너무 개방적이고 문란하다"고 하신다면 당신의 생각은?',
    options: [
      { label: '적극 공감한다. 무분별한 개방으로 사회 질서와 전통 가치가 파괴되고 있다.', axes: { social: 40 } },
      { label: '어느 정도 일리 있는 말씀이라 생각하며 경청한다.', axes: { social: 15 } },
      { label: '요즘 시대 변화를 받아들이지 못하는 낡은 꼰대 마인드라고 생각한다.', axes: { social: -20 } },
      { label: '가부장적 전통이야말로 구시대적 악습이므로 완전히 타파해야 한다고 본다.', axes: { social: -40 } },
    ],
  },
  {
    id: 'q5', phase: 1, text: '현시점 북한 정권은 대화와 협력의 대상이라기보다, 강력한 억제력을 동원해야 할 주적입니까?',
    options: [
      { label: '매우 동의 (대북 강경)', axes: { security: 40 } },
      { label: '동의', axes: { security: 20 } },
      { label: '보통 / 중립', axes: { security: 0 } },
      { label: '비동의', axes: { security: -20 } },
      { label: '매우 비동의 (대화·주권 우선)', axes: { security: -40 } },
    ],
  },
  {
    id: 'q6', phase: 1, text: '중앙선거관리위원회나 사법부 같은 국가 근간 기관의 행정적 공정성을 신뢰합니까?',
    options: [
      { label: '매우 신뢰한다 (시스템 안정)', axes: { trust: 40 } },
      { label: '신뢰하는 편이다', axes: { trust: 20 } },
      { label: '보통 / 유보', axes: { trust: 0 } },
      { label: '불신하는 편이다', axes: { trust: -20 } },
      { label: '전혀 신뢰할 수 없다 (기관 부패/편향)', axes: { trust: -40 } },
    ],
  },
  {
    id: 'q7', phase: 1, text: '인터넷 커뮤니티나 미디어 등에서 "한국 사회는 여전히 여성이 억압받는 차별 사회"라는 주장을 마주했을 때 당신의 반응은?',
    options: [
      { label: '적극 동의한다. 유리천장 등 구조적 성차별은 여전히 공고하다.', axes: { gender: -40 } },
      { label: '일부 공감하지만, 과거에 비해 많이 개선되었으며 다소 과장된 면이 있다.', axes: { gender: -15 } },
      { label: '동의하지 않는다. 오히려 각종 할당제 등 청년 남성에 대한 역차별이 심각하다.', axes: { gender: 40 } },
      { label: '페미니즘 독선과 남녀 갈라치기 선동 자체가 극도로 혐오스럽고 지겹다.', axes: { gender: 20, engage: -15 } },
    ],
  },
  {
    id: 'q8', phase: 1, text: '최근 여야 당권 정국이나 선관위 사태 같은 정치권 뉴스를 얼마나 찾아보십니까?',
    options: [
      { label: '매 실시간으로 유튜브 채널, 정치 커뮤니티 반응까지 샅샅이 찾아본다.', axes: { engage: 50 } },
      { label: '주요 언론의 헤드라인 뉴스와 핵심 쟁점은 꾸준히 챙겨보는 편이다.', axes: { engage: 20 } },
      { label: '포털 메인에 뜨거나 사회적으로 큰 논란이 터졌을 때만 가끔 확인한다.', axes: { engage: -20 } },
      { label: '진흙탕 싸움이 피곤하고 내 삶에 도움 안 돼서 의도적으로 차단한다.', axes: { engage: -55 } },
    ],
  },
  {
    id: 'q9', phase: 1, text: '만약 내일 바로 선거가 치러진다면, 당신의 정치적 지향과 가장 가까운 세력은 어디입니까?',
    options: [
      { label: '이재명 정부의 국정 성공과 민주당의 전면 개혁 세력', routeBonus: -30, axes: { engage: 10 } },
      { label: '조국혁신당, 진보당 등 선명한 야권 및 진보 독자 노선', routeBonus: -30, axes: { econ: -15 } },
      { label: '법치와 보수 재건을 내세우는 제도권 보수 세력 (국민의힘·한동훈계)', routeBonus: 30, axes: { engage: 10 } },
      { label: '이준석 중심의 철저한 능력주의와 실용을 추구하는 개혁신당', routeBonus: 15, axes: { gender: 15 } },
      { label: '부정선거 진상규명과 광장 시위를 주도하는 강성 애국우파 세력', routeBonus: 30, axes: { social: 20, trust: -15 } },
      { label: '양당의 기득권 정쟁에 반대하며 지지하는 당이 없다.', routeBonus: 0, axes: { trust: -20 } },
    ],
  },
];

// ───────────────────────── Phase 2 — 좌향 (6문항)
export const LEFT: Question[] = [
  {
    id: 'l1', phase: 2, branch: 'left', text: '최근 당내 일각의 견제 움직임 속에서, 이재명 대통령에게 전권을 실어주어 정부 주도의 핵심 개혁을 돌파해야 합니까?',
    options: [
      { label: '매우 동의 (강성 친명 체제 사수)', leejm: -45 },
      { label: '동의 (이재명 정부 성공 우선)', leejm: -20 },
      { label: '보통 / 중립', leejm: 0 },
      { label: '비동의 (특정 인물 중심의 독주 견제 필요)', leejm: 25 },
      { label: '매우 비동의 (당내 이견 탄압이자 비민주적 독재)', leejm: 45 },
    ],
  },
  {
    id: 'l2', phase: 2, branch: 'left', text: '여전히 검찰 및 사법부의 기득권 카르텔이 강력하므로, 아예 구조적 해체 수준의 강경 개혁을 밀어붙여야 합니까?',
    options: [
      { label: '매우 동의 (수사권 완전 박탈 및 검찰 해체)', prosec: 45, axes: { trust: -15 } },
      { label: '동의 (강력한 인적·조직 쇄신 필요)', prosec: 20 },
      { label: '보통 / 중립', prosec: 0 },
      { label: '비동의 (이미 수사권 조정 등으로 권한이 약화됨)', prosec: -20 },
      { label: '매우 비동의 (야권 적폐 수사에 대한 정치적 보복 행위)', prosec: -45, axes: { trust: 20 } },
    ],
  },
  {
    id: 'l3', phase: 2, branch: 'left', text: '민주당 지도부의 방침이나 특정 법안에 대해 공개적으로 쓴소리를 내는 당내 인사를 어떻게 보십니까?',
    options: [
      { label: '중요한 시국에 분열을 조장하는 배신이자 이기적인 내부총질이다.', leejm: -25, axes: { engage: 15 } },
      { label: '개인 소신은 자유나, 여당으로서의 전열을 흐트러뜨리는 아쉬운 행동이다.', leejm: -5 },
      { label: '건강한 민주 정당이라면 당연히 존재해야 할 상식적인 이견이다.', leejm: 20 },
      { label: '강성 팬덤의 눈치를 보지 않는 진정한 소신파 의원이며 지지한다.', leejm: 35, axes: { trust: 15 } },
    ],
  },
  {
    id: 'l4', phase: 2, branch: 'left', text: '대한민국의 국익을 가장 심각하게 위협하는 핵심 리스크와 최우선 개혁 과제는 무엇입니까?',
    options: [
      { label: '한미일 동맹 맹신과 사대주의 외교 (반미자주 및 평화 주권 회복)', axes: { security: -45 } },
      { label: '자본 권력의 횡포와 노동시장 양극화 (재벌 규제 및 노동자 권리 쟁취)', axes: { econ: -45 } },
      { label: '기후 위기 방관과 소수자 차별 (차별금지법 제정 및 탄소 배출 규제)', axes: { social: -40, gender: -30 } },
      { label: '정부 흔들기에 눈이 먼 검찰·사법·언론 기득권 카르텔 청산', prosec: 30, axes: { engage: 15 } },
    ],
  },
  {
    id: 'l5', phase: 2, branch: 'left', text: '국내 핵심 기술 유출과 불평등 무역 논란 속에서, 대중국 외교 관계를 어떻게 설정해야 합니까?',
    options: [
      { label: '실리 외교가 핵심이다. 미국 일변도에서 벗어나 중국과의 경제적 연대를 대폭 강화해야 한다.', axes: { security: -45 } },
      { label: '미국·중국 어느 한쪽에 종속되지 않는 철저한 민족 자주 외교 노선을 걸어야 한다.', axes: { security: -30 } },
      { label: '경제적 실리는 챙기되, 안보와 기술 유출 방지를 위해 중국에 저자세로 임해선 안 된다.', axes: { security: 10 } },
      { label: '사실상 국가 자산과 공급망을 중국에 종속시키려는 친중적 행태를 단호히 차단하고 규제해야 한다.', axes: { security: 40 } },
    ],
  },
  {
    id: 'l6', phase: 2, branch: 'left', text: '거대 여당인 민주당이 민생 법안 처리에 미진하거나 강성 정쟁에만 몰두한다는 비판이 일 때, 당신의 선택은?',
    options: [
      { label: '개혁을 막아서는 야당과 언론의 선동일 뿐, 민주당 중심으로 뭉쳐야 한다.', leejm: -20 },
      { label: '양당 프레임을 깨기 위해 더 선명한 진보 독자 정당에 표를 주겠다.', axes: { econ: -30, social: -15 } },
      { label: '기존 계파에서 벗어난 합리적인 제3지대 대안 세력을 모색하겠다.', leejm: 35, axes: { trust: 15 } },
    ],
  },
];

// ───────────────────────── Phase 2 — 우향 (관문 r1 + 분기 + 공통)
export const RIGHT_GATE: Question = {
  id: 'r1', phase: 2, branch: 'right', text: '과거 보수 집권기 시절 감행된 윤석열 전 대통령 탄핵 사건에 대해 지금 어떻게 평가하십니까?',
  options: [
    { label: '법치주의와 헌정 질서를 지키기 위한 정당하고 불가피한 선택이었다.', impeach: 'pro', axes: { trust: 25 } },
    { label: '과정이 매끄럽지 못했으나 헌법재판소의 결정을 존중하고 미래로 나아가야 한다.', impeach: 'antiMild', axes: { trust: 10 } },
    { label: '거짓 선동과 배신으로 얼룩진 원천 무효의 정치 탄핵이었다.', impeach: 'yoonAgain', axes: { trust: -35 } },
  ],
};

export const RIGHT_ANTI: Question[] = [
  {
    id: 'r2', phase: 2, branch: 'rightAnti', text: '6.3 지선 투표용지 부족으로 촉발된 올림픽공원 시위 등 일련의 "선관위 부실/부정선거 의혹"을 어떻게 보십니까?',
    options: [
      { label: '단순한 행정 착오와 부실 관리일 뿐이며, 이를 부정선거 음모론으로 몰고 가선 안 된다.', fraud: -40, axes: { trust: 25 } },
      { label: '단순 실수가 아니라 조직적 조작의 개연성이 높으므로 투표 전면 재검증과 특검이 필요하다.', fraud: 30, axes: { trust: -20 } },
      { label: '민주주의 체제를 전복하려는 명백한 대규모 기획 부정선거이며 선관위를 전면 해체해야 한다.', fraud: 45, axes: { trust: -45 } },
    ],
  },
  {
    id: 'r3', phase: 2, branch: 'rightAnti', text: '보수 야당의 투쟁 방향에서, 최근 강성 우파 중심의 올림픽공원 아스팔트 장외 집회를 어떻게 평가하십니까?',
    options: [
      { label: '체제가 썩었으므로 광장에서 강력한 아스팔트 구국 투쟁으로 정권을 압박해야 한다.', fraud: 40, axes: { engage: 25, social: 15 } },
      { label: '초기 취지는 공감하나 지나치게 극우 음모론화되어 중도층이 다 이탈해 부담스럽다.', fraud: 5 },
      { label: '이런 극단적인 장외 폭주는 당의 외연 확장을 가로막고 보수 전체를 궤멸시키는 자해행위다.', fraud: -30, axes: { social: -20 } },
    ],
  },
];

export const RIGHT_PRO: Question[] = [
  {
    id: 'r2p', phase: 2, branch: 'rightPro', text: '보수 진영이 재집권하기 위해 아스팔트 태극기 세력 및 강성 유튜버들과의 관계를 어떻게 설정해야 합니까?',
    options: [
      { label: '우파 정체성이 확실한 소중한 우군이므로 이들의 강력한 결집력을 품고 가야 한다.', axes: { social: 25, trust: -20 } },
      { label: '노선은 다르더라도 대여 투쟁 국면에서는 전략적으로 연대할 필요가 있다.', axes: { social: 10 } },
      { label: '음모론과 극단주의에 매몰된 이들과는 칼같이 선을 그어야 합리적 중도가 보수를 선택한다.', axes: { trust: 30, social: -20 } },
    ],
  },
];

export const RIGHT_COMMON: Question[] = [
  {
    id: 'r4', phase: 2, branch: 'right', text: '현재 무역 수지 악화와 민생 경제 위기를 타개할 가장 효과적인 해결책은 무엇입니까?',
    options: [
      { label: '법인세·상속세 인하와 과감한 규제 철폐로 기업 투자의 활력을 불어넣는 성장 노선', axes: { econ: 45 } },
      { label: '정부의 적극적인 재정 집행을 통해 취약계층의 내수 소비 진작을 도모하는 민생 노선', axes: { econ: -20 } },
      { label: '독과점 카르텔을 징벌하고 중소기업 중심의 공정 경쟁 생태계를 확립하는 시장 노선', axes: { econ: 10, trust: 15 } },
    ],
  },
  {
    id: 'r5', phase: 2, branch: 'right', text: '여성가족부 폐지 및 성평등 정책 기조 등 젠더 갈등 이슈에 대한 당신의 뚜렷한 입장은?',
    options: [
      { label: '할당제 등 인위적 성별 우대는 전면 폐지하고 철저한 능력 위주의 공정을 확립해야 한다.', axes: { gender: 45 } },
      { label: '급진적 페미니즘의 폐해는 시정하되, 실질적인 취약계층 보호 정책은 정교하게 유지해야 한다.', axes: { gender: 20 } },
      { label: '보수 진영의 일방적인 반페미니즘 갈라치기 정치는 잘못되었으며 양성평등 가치는 존중되어야 한다.', axes: { gender: -25 } },
    ],
  },
  {
    id: 'r6', phase: 2, branch: 'right', text: '지선 참패 이후 비상 당권을 쥐고 있는 현 국민의힘 지도부(장동혁 체제 등)의 행보를 어찌 보십니까?',
    options: [
      { label: '선관위 사태 정면 돌파 등 야권에 맞서 선방하고 있으므로 현 체제를 적극 지지해야 한다.', fraud: 15, axes: { engage: 20 } },
      { label: '지지하지만 대여 투쟁 노선이 우왕좌왕하고 있어 아쉽다. 뼈를 깎는 당정 쇄신이 필요하다.', fraud: 5, axes: { trust: -10 } },
      { label: '현 노선으로는 정권 교체가 불가능하다. 조기 전당대회를 통해 전면적인 세력 교체를 단행해야 한다.', fraud: -10, axes: { trust: 15 } },
    ],
  },
];

// ───────────────────────── Phase 2 — 중도 (6문항)
export const CENTER: Question[] = [
  {
    id: 'c1', phase: 2, branch: 'center', text: '선거일 당일, 투표소를 향하는 당신의 발걸음과 가치관을 가장 잘 설명한 것은?',
    options: [
      { label: '민주 시민의 신성한 의무이므로 정치를 바꾸기 위해 무조건 투표권을 행사한다.', axes: { engage: 35 } },
      { label: '공약이나 인물을 보고 마음에 드는 대안 후보가 있을 때만 골라서 투표한다.', axes: { engage: 10 } },
      { label: '누가 되든 기득권 싸움일 뿐 내 삶은 조금도 바뀌지 않으므로 굳이 안 가거나 기권한다.', axes: { engage: -40 } },
      { label: '정치판 전체가 혐오스러워 선거철 뉴스 자체를 완전히 외면하고 일상에 집중한다.', axes: { engage: -60 } },
    ],
  },
  {
    id: 'c2', phase: 2, branch: 'center', text: '대한민국의 거대 양당 체제(민주당 vs 국민의힘)에 극심한 피로감을 느끼는 가장 큰 이유는 무엇입니까?',
    options: [
      { label: '서로 이권만 챙기며 민생은 안중에도 없는 기득권 담합 구조이기 때문이다.', axes: { trust: -40 } },
      { label: '국가 비전이나 정책 경쟁은 없고 오직 상대방을 무너뜨리려는 진영 논리 늪에 빠져서다.', axes: { trust: -25 } },
      { label: '국가적 위기 상황 속에서도 아무런 해법을 내놓지 못하는 정치권 전체의 무능함 때문이다.', axes: { trust: -15 } },
    ],
  },
  {
    id: 'c3', phase: 2, branch: 'center', text: "취업 시장이나 공공 부문의 '여성/청년 의무 할당제' 등 사회적 보정 제도에 대한 당신의 생각은?",
    options: [
      { label: '노력한 이들의 기회를 박탈하는 명백한 역차별이자 시장 왜곡이다.', axes: { gender: 40, econ: 15 } },
      { label: '취지는 알겠으나 역효과가 크므로 점진적으로 축소하거나 폐지하는 게 맞다.', axes: { gender: 20 } },
      { label: '과거 불평등을 완화하고 출발선을 맞춰주기 위한 최소한의 필수 장치다.', axes: { gender: -30 } },
    ],
  },
  {
    id: 'c4', phase: 2, branch: 'center', text: "어느 진영에도 정착하지 않고 '무당층 지대'에 머무르는 당신의 진짜 속마음은 무엇입니까?",
    options: [
      { label: '진영에 눈이 머는 순간 합리성이 사라진다. 철저히 사안별·정책별로 판단하기 위해서다.', axes: { trust: 15, engage: 15 } },
      { label: '찍고 싶어도 찍을 만한 상식적인 정당이나 인물이 단 하나도 없기 때문이다.', axes: { trust: -30 } },
      { label: '누구 편을 들며 떼 지어 싸우는 문화 자체가 원초적으로 유치하고 싫다.', axes: { trust: -5 } },
    ],
  },
  {
    id: 'c5', phase: 2, branch: 'center', text: '세금 부담 경감과 사회 복지망 확충, 단 하나만 우선해야 한다면 당신의 노선은?',
    options: [
      { label: '과도한 세금은 근로 의욕을 꺾는다. 무조건 세금을 줄여 시장 활력을 높여야 한다.', axes: { econ: 40 } },
      { label: '현재 수준의 조세 부담율을 유지하며 내실 있는 재정 균형을 잡아야 한다.', axes: { econ: 5 } },
      { label: '사각지대가 너무 많다. 부자 증세를 통해서라도 보편 복지를 획기적으로 늘려야 한다.', axes: { econ: -40 } },
    ],
  },
  {
    id: 'c6', phase: 2, branch: 'center', text: '지금 대한민국 리더에게 가장 절실하게 요구되는 덕목은 무엇이라 보십니까?',
    options: [
      { label: '이념에 매몰되지 않고 실질적인 경제 성과를 내는 유능함과 실행력', axes: { trust: 10, engage: 10 } },
      { label: '도덕적 흠결이 없고 사법적 논란에서 자유로운 떳떳함과 정직성', axes: { trust: 25 } },
      { label: '어떤 탄압에도 흔들리지 않고 개혁 노선을 밀어붙이는 강인한 이념적 소신', axes: { engage: 25 } },
    ],
  },
];

// ───────────────────────── Phase 2 — 무관심 트랙 (3문항)
export const APATHY: Question[] = [
  {
    id: 'a1', phase: 2, branch: 'apathy', text: '일상에서 정치 관련된 대화나 뉴스가 나올 때 본능적으로 거부감이 드는 이유는?',
    options: [
      { label: '하루 종일 서로 소리 지르고 싸우는 모습만 보여줘서 정신 건강에 나쁘다.', axes: { trust: -25 } },
      { label: '그들만의 리그일 뿐, 내 밥그릇이나 통장 잔고와는 아무 상관이 없어서다.', axes: { engage: -30 } },
      { label: '용어나 맥락이 너무 복잡하고 어려워서 굳이 알고 싶지 않다.', axes: { engage: -20 } },
      { label: '정치인들의 가식적인 사기극에 감정 소비를 하기 싫은 것뿐이다.', axes: { trust: -15, engage: 15 } },
    ],
  },
  {
    id: 'a2', phase: 2, branch: 'apathy', text: '선거철에 투표 통지표가 날아오면 보통 어떻게 행동하십니까?',
    options: [
      { label: '그래도 주권자인데 투표날 당일 잠시 짬을 내어 투표소는 다녀온다.', axes: { engage: 25 } },
      { label: '그날 컨디션이나 날씨, 개인 스케줄에 따라 갈 때도 있고 안 갈 때도 있다.', axes: { engage: 0 } },
      { label: '휴일일 뿐이므로 투표는 완전히 제쳐두고 여행, 휴식 등 개인 시간을 즐긴다.', axes: { engage: -35 } },
    ],
  },
  {
    id: 'a3', phase: 2, branch: 'apathy', text: '미디어를 볼 때 그나마 관심 있게 들여다보는 도메인은 어느 쪽입니까?',
    options: [
      { label: '대선이나 개표 방송 같은 대형 예능 성격의 빅 이벤트 시국', axes: { engage: 20 } },
      { label: '당장 재테크와 직결되는 부동산, 주식 시황 및 거시 경제 정보', axes: { econ: 15 } },
      { label: '자극적이고 흥미진진한 사회적 사건사고나 연예·스포츠 뉴스', axes: { engage: -15 } },
    ],
  },
];

// ───────────────────────── Phase 3 — 확정 심화 풀 (6문항, 3개 동적 선택)
export const PHASE3_POOL: Question[] = [
  {
    id: 'p1', phase: 3, target: 'econ', text: '부동산 시장 안정을 위해 다주택자 종부세 및 보유세 기준을 대폭 강화해야 합니까?',
    options: [
      { label: '매우 동의 (강력한 규제)', axes: { econ: -35 } },
      { label: '동의', axes: { econ: -17 } },
      { label: '보통 / 중립', axes: { econ: 0 } },
      { label: '비동의', axes: { econ: 17 } },
      { label: '매우 비동의 (징벌적 과세 철폐)', axes: { econ: 35 } },
    ],
  },
  {
    id: 'p2', phase: 3, target: 'social', text: '냉전 시대의 산물이자 사상의 자유를 억압하는 국가보안법을 전면 폐지해야 합니까?',
    options: [
      { label: '매우 동의 (국보법 폐지)', axes: { social: -35 } },
      { label: '동의', axes: { social: -17 } },
      { label: '보통 / 중립', axes: { social: 0 } },
      { label: '비동의', axes: { social: 17 } },
      { label: '매우 비동의 (안보 최우선 수호)', axes: { social: 35 } },
    ],
  },
  {
    id: 'p3', phase: 3, target: 'trust', text: '대한민국의 현행 중앙선거관리 시스템은 해킹이나 조작의 우려가 없는 세계 최고 수준의 투명성을 갖추고 있습니까?',
    options: [
      { label: '매우 동의 (선관위 완벽 신뢰)', axes: { trust: 35 } },
      { label: '동의', axes: { trust: 17 } },
      { label: '보통 / 중립', axes: { trust: 0 } },
      { label: '비동의 (최근 지선 사태 등 의구심 존재)', axes: { trust: -17 } },
      { label: '매우 비동의 (원천적 불신/전면 개혁 필요)', axes: { trust: -35 } },
    ],
  },
  {
    id: 'p4', phase: 3, target: 'gender', text: '현대 페미니즘 운동은 구조적인 성별 권력 격차를 해소하고 실질적 평등을 달성하기 위한 필수적 행동입니까?',
    options: [
      { label: '매우 동의 (페미니즘 옹호)', axes: { gender: -35 } },
      { label: '동의', axes: { gender: -17 } },
      { label: '보통 / 중립', axes: { gender: 0 } },
      { label: '비동의', axes: { gender: 17 } },
      { label: '매우 비동의 (이기주의 및 갈등 유발 운동)', axes: { gender: 35 } },
    ],
  },
  {
    id: 'p5', phase: 3, target: 'security', text: '한반도 평화 체제 구축과 자주국방 실현을 위해, 주한미군 규모를 단계적으로 감축하거나 철수해야 합니까?',
    options: [
      { label: '매우 동의 (미군 철수 및 자주)', axes: { security: -35 } },
      { label: '동의', axes: { security: -17 } },
      { label: '보통 / 중립', axes: { security: 0 } },
      { label: '비동의', axes: { security: 17 } },
      { label: '매우 비동의 (동맹 유지 필수)', axes: { security: 35 } },
    ],
  },
  {
    id: 'p6', phase: 3, target: 'trust', text: '대한민국 법원의 판결은 정치적 압력이나 진영 논리에 휘둘리지 않고 철저히 법리와 양심에 따라 공정하게 이루어집니까?',
    options: [
      { label: '매우 동의 (사법 공정성 확신)', axes: { trust: 35 } },
      { label: '동의', axes: { trust: 17 } },
      { label: '보통 / 중립', axes: { trust: 0 } },
      { label: '비동의 (진영별 고무줄 판결 성향 존재)', axes: { trust: -17 } },
      { label: '매우 비동의 (완전한 정치 사법부/불신)', axes: { trust: -35 } },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = [
  ...PHASE1, ...LEFT, RIGHT_GATE, ...RIGHT_ANTI, ...RIGHT_PRO, ...RIGHT_COMMON, ...CENTER, ...APATHY, ...PHASE3_POOL,
];
export const QUESTION_MAP: Record<string, Question> = Object.fromEntries(ALL_QUESTIONS.map((q) => [q.id, q]));
export const ROUTER_QUESTION_ID = 'q9';
