# [Gemini 프롬프트 3/3] 질문(questions) 검토·정교화

아래는 현재 질문 세트의 실제 소스(TypeScript)입니다. `likert(id,phase,text,axis,mag)` 헬퍼는 "매우 동의 +mag / 동의 +mag/2 / 보통 0 / 비동의 −mag/2 / 매우 비동의 −mag"의 5점 척도를 한 축에 부여합니다. 그 외 질문은 선택지마다 `axes`(축 델타) 또는 스탠스 델타(`impeach`/`fraud`/`leejm`/`prosec`), `routeBonus`(q9 전용)를 직접 가집니다.

## 구조 (바꾸지 말 것)
- **Phase 1**(전원 공통 9문항, q1~q9): 6축을 거칠게 측정. q9는 라우터(정당 선호 → routeBonus). 라우트 = (econ+social+security)/3 + routeBonus → 좌/중도/우, `engage ≤ −50`이면 무관심.
- **Phase 2**: 좌향 LEFT(l1~l6) / 우향 RIGHT(관문 r1 → 반탄이면 RIGHT_ANTI r2·r3, 찬탄이면 RIGHT_PRO r2p → 공통 r4~r6) / 중도 CENTER(c1~c6) / 무관심 APATHY(a1~a3).
- **Phase 3**: PHASE3_POOL(p1~p6) 중 후보 유형을 가장 잘 가르는 3개가 동적으로 선택됨. 각 문항은 `target` 축을 가짐.

## 당신이 할 일
1. **문구 다듬기**: 각 질문·선택지 텍스트를 더 자연스럽고(한국어 구어/밈 감각) 중립적이되 변별력 있게. 리커트형은 평이하게, 상황형(q4·q7 등)은 생생하게. 유도신문·이중질문은 제거.
2. **델타 점검**: 각 선택지의 축/스탠스 델타가 "그 답을 고른 사람"의 성향과 방향·크기가 맞는지 검토. |델타| ≤ 60 유지. 한 선택지가 1~2개 축에만 기여하도록(과한 다축 부여 자제).
3. **커버리지/밸런스**: 6축과 4스탠스가 충분히 측정되는지, 특정 유형으로만 쏠리지 않는지. 앞서 검토한 13(또는 12)개 유형 각각이 **어떤 답 조합으로 도달 가능한지** 점검하고, 도달 어려운 유형이 있으면 질문/델타 보강 제안.
4. **분기 정합성**: q9 routeBonus와 r1 탄핵 관문이 의도대로 분기시키는지. 우향 반탄→부정선거 심화 흐름이 자연스러운지.
5. (선택) 문항 추가/삭제 제안 — 단 Phase 구조와 id 체계는 유지.

## 출력 형식
- **(1) 개선된 질문 목록(JSON)**: 각 질문을 `{ id, phase, branch?, target?, text, options:[{ label, axes?{}, impeach?, fraud?, leejm?, prosec?, routeBonus? }] }` 형태로. 리커트도 5선택지를 펼쳐서 명시(헬퍼 안 써도 됨). **전체 목록**을 주세요.
- **(2) 변경 요약 + 커버리지 노트**: 무엇을 왜 바꿨는지, 어떤 유형이 도달 어려웠고 어떻게 보강했는지, 불확실/주관적 판단 표시.

## 검증 기준(참고)
바꾼 데이터는 13(또는 12)개 "모범 답안 페르소나"가 각자 의도한 유형 + 정치인으로 매칭되는지 회귀 테스트(`tests/personas.test.ts`)로 검증됩니다. 즉 **유형을 충분히 변별하는 답 경로**가 존재해야 합니다.

## 현재 소스
```ts
// likert(id,phase,text,axis,mag): 매우동의 +mag / 동의 +mag/2 / 보통 0 / 비동의 −mag/2 / 매우비동의 −mag
// ── Phase 1 (공통 9문항)
q1 likert econ -40  "부유층과 대기업에 세금을 더 걷어 복지를 늘려야 한다."
q2 likert econ +35  "정부 규제는 시장의 발목을 잡을 때가 더 많다."
q3 likert social -40 "차별금지법, 이제는 제정해야 한다."
q4 (social) "명절에 친척 어른이 '요즘 세상은 너무 문란해졌어, 옛날이 좋았지'라고 한다. 나는…"
   - 맞는 말씀이다. 전통과 질서가 무너지고 있다 {social:35}
   - 그런가보다 하고 넘긴다 {social:5}
   - "세상이 변한 건데요" 하고 한마디 한다 {social:-20}
   - 그 "옛날"이 누구에게 좋았는지 따져 묻고 싶다 {social:-40}
q5 likert security +40 "북한은 대화 상대가 아니라 안보 위협이다."
q6 likert trust +40  "선거관리위원회·법원 같은 국가기관은 대체로 믿을 만하다."
q7 (gender) "온라인에서 '한국은 여전히 여성차별 사회다'라는 글을 봤다. 나는…"
   - 동의한다. 구조적 차별은 여전하다 {gender:-40}
   - 일부 맞지만 과장됐다 {gender:-5}
   - 이제는 역차별이 더 문제다 {gender:35}
   - 남녀 갈라치기 자체가 지겹다 {gender:10, engage:-10}
q8 (engage) "정치 뉴스, 얼마나 챙겨보나?"
   - 거의 실시간. 커뮤니티·유튜브까지 본다 {engage:45}
   - 주요 뉴스는 챙겨본다 {engage:15}
   - 큰일 터졌을 때만 {engage:-25}
   - 일부러 안 본다. 피곤하다 {engage:-55}
q9 (라우터) "내일이 총선이라면, 그나마 마음이 가는 쪽은?"
   - 더불어민주당 {routeBonus:-25, engage:5}
   - 조국혁신당·진보당 등 범진보 정당 {routeBonus:-25, econ:-10}
   - 국민의힘 {routeBonus:25, engage:5}
   - 개혁신당 {routeBonus:10, gender:10}
   - 자유통일당 등 그 외 우파 정당 {routeBonus:25, social:15, trust:-10}
   - 없다 / 모르겠다 {routeBonus:0, trust:-10}

// ── Phase 2 좌향 LEFT (l1~l6)
l1 (leejm) "이재명 대통령, 국정운영을 잘하고 있다." → 매우동의 {leejm:-45} / 동의 {leejm:-20} / 보통 {leejm:0} / 비동의 {leejm:25} / 매우비동의 {leejm:45}
l2 (prosec) "검찰 권력은 아직도 너무 세다. 더 강하게 개혁해야 한다." → 매우동의(해체) {prosec:45,trust:-10} / 동의 {prosec:20} / 보통 {prosec:0} / 이미충분 {prosec:-20} / 보복이다 {prosec:-45,trust:10}
l3 "당 지도부를 공개 비판하는 민주당 의원을 보면…" → 내부총질 {leejm:-25,engage:10} / 시기가나쁨 {leejm:-5} / 건강한다양성 {leejm:20} / 그의원이낫다 {leejm:35}
l4 "내 마음에 가장 가까운 의제는?" → 자주외교 {security:-40} / 노동·불평등 {econ:-35} / 성평등·소수자 {gender:-35,social:-25} / 기후 {social:-20,econ:-15} / 이재명정부성공 {leejm:-20,engage:10} / 이념보다민생 {trust:15}
l5 likert gender -35 "민주당은 페미니즘 이슈에 더 적극적이어야 한다."
l6 "총선에서 우리 지역 민주당 후보가 영 별로라면…" → 그래도민주당 {leejm:-20} / 진보정당 {econ:-25,social:-15} / 제3지대가능 {leejm:20,trust:10} / 기분따라 {engage:-20}

// ── Phase 2 우향 (관문 r1 + 분기 + 공통)
r1 (관문) "윤석열 전 대통령 탄핵, 지금 어떻게 평가하나?" → 탄핵불가피 {impeach:'pro',trust:10} / 헌재존중·미래로 {impeach:'antiMild'} / 탄핵무효·윤어게인 {impeach:'yoonAgain',trust:-20} / 유보 {engage:-10}
r2 (반탄분기) "부정선거 의혹, 어떻게 보나?" → 음모론 {fraud:-40,trust:10} / 검증필요 {fraud:15,trust:-10} / 확신 {fraud:45,trust:-30}
r3 (반탄분기) "광화문 집회에 대해 나는…" → 참여 {engage:25,social:15,fraud:10} / 방식부담 {social:5} / 보수에해롭다 {social:-10,fraud:-15}
r2p (찬탄분기) "태극기·광화문 세력과 보수의 관계, 어때야 하나?" → 우군 {social:25,trust:-15} / 전략적으로만 {social:10} / 선을그어야 {trust:20,social:-10}
r4 (공통) "경제를 살리려면?" → 감세·규제완화 {econ:35} / 재정부양 {econ:-10} / 공정시장 {econ:5,trust:10} / 복지병행 {econ:-25}
r5 (공통) "여성가족부 부활 같은 젠더 이슈에서 나는…" → 반페미기조 {gender:40} / 역차별시정·신중 {gender:15} / 성평등필요 {gender:-20} / 관심없음 {engage:-15}
r6 (공통) "국민의힘에 대해 솔직히 말하면…" → 내당 {engage:15} / 지지하지만한심 {trust:-5} / 가치는지지·당은글쎄 {trust:5} / 당보다인물·운동 {engage:10,trust:-15}

// ── Phase 2 중도 CENTER (c1~c6)
c1 "선거날의 나는…" → 무조건투표 {engage:30} / 괜찮으면 {engage:5} / 잘안감 {engage:-30} / 정치싫음 {engage:-50}
c2 "거대 양당이 싫다면, 그 이유는?" → 다기득권 {trust:-35} / 무능 {trust:-15} / 진영싸움 {trust:-20} / 관심없음 {engage:-30}
c3 "여성할당제·청년할당제 같은 제도는…" → 역차별 {gender:35,econ:15} / 부작용 {gender:15} / 보정장치필요 {gender:-25} / 관심없음 {engage:-15}
c4 "지지 정당 없이 사는 이유는?" → 정책따라 {trust:10,engage:15} / 찍을데없음 {trust:-25} / 삶안바뀜 {trust:-20,engage:-25} / 무리짓기싫음 {trust:-5}
c5 "세금과 복지, 굳이 고르라면?" → 세금↓ {econ:35} / 현수준 {econ:5} / 복지확대 {econ:-35} / 모름 {engage:-10}
c6 "정치인에게 제일 중요한 자질은?" → 유능함 {trust:5,engage:10} / 도덕성 {trust:15} / 소신·이념 {engage:20} / 동네챙김 {engage:-10}

// ── Phase 2 무관심 APATHY (a1~a3)
a1 "정치 얘기가 싫은 이유는?" → 싸움만해서 {trust:-20} / 상관없어서 {engage:-25} / 어려워서 {engage:-15} / 아주싫진않음 {engage:15}
a2 "그래도 투표는…" → 한다 {engage:20} / 할때도 {engage:0} / 거의안함 {engage:-25}
a3 "뉴스에서 그나마 눈이 가는 주제는?" → 부동산·경제 {econ:10} / 사건사고 {engage:0} / 연예·스포츠 {engage:-10} / 대선같은빅이벤트 {engage:15}

// ── Phase 3 풀 PHASE3_POOL (p1~p6, 3개 동적선택, 각 target 축)
p1 likert econ -35 target=econ "부동산 보유세는 더 강화해야 한다."
p2 likert social -35 target=social "국가보안법은 폐지해야 한다."
p3 likert trust +35 target=trust "우리나라 선거 시스템은 세계적으로 공정한 편이다."
p4 likert gender -35 target=gender "페미니즘은 결국 평등을 위한 운동이다."
p5 likert security -35 target=security "주한미군은 단계적으로 줄여나가야 한다."
p6 likert trust +30 target=trust "법원 판결은 대체로 공정하다."
```
