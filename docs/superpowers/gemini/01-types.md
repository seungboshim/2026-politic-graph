# [Gemini 프롬프트 1/3] 유형(types) 검토·정교화

아래는 현재 13개 정치 유형의 초안입니다. 각 유형은 `vector`(6축 + 선택적 스탠스 절대값), `weights`(판별 가중치), `nickLabel`(댓글 닉 prefix), `tagline`/`description`/`keywords`(결과 화면 카피)를 가집니다.

## 당신이 할 일
1. **벡터 교정**: 각 유형의 6축·스탠스 값이 그 정치 정체성의 "전형적 지지자"를 잘 나타내는지 검토하고 어색한 값을 고치세요. (예: 광장우파의 `trust`가 충분히 낮은지, 강성친명의 `leejm`이 0에 가까운지 등)
2. **판별력**: 서로 가까워서 헷갈릴 유형 쌍(예: 강성친명 vs 검찰개혁운동파, 찬탄보수 vs 반탄주류)이 `weights`로 충분히 갈리는지 점검·제안.
3. **카피 다듬기**: tagline(한 줄, 밈/정체성 자극), description(2~3문장, 자기 유형을 읽고 "어 이거 난데?" 싶게), keywords(#해시태그 2~3개)를 더 날카롭고 자연스럽게.
4. **NL/PD 결정**: 스펙상 좌파 유형을 NL(`nl-jusa`)/PD(`pd-labor`) 둘로 줄이고 `postmodern-left`(젠더진보)를 통합할지 검토. 젠더·소수자 변별은 이미 `gender`/`social` 연속축이 잡으니 별도 유형이 과한지, 아니면 인지도·재미상 남길지 **추천 + 이유**. (남기면 3개, 통합하면 12개)
5. nickLabel은 4~6자, 공백 없이.

## 출력 형식
- **(1) JSON 배열**: 아래 각 객체를 그대로(또는 통합 시 줄여서) 반환. 필드명·값 형식 유지. 바꾼 값만이 아니라 **전체 배열**을 주세요(제가 파일을 통째로 교체).
- **(2) 변경 요약**: 유형별로 "무엇을 왜 바꿨는지" 1~2줄. NL/PD 결정과 이유. 불확실한 값 표시.

스키마(타입):
```
{ id, name, nickLabel, camp('좌파'|'중도좌'|'중도우'|'우파'|'비이념'),
  tagline, description, keywords[],
  vector: { axes:{econ,social,security,trust,gender,engage}, impeach?, fraud?, leejm?, prosec? },
  weights?: { <축 또는 스탠스>: number } }
```

## 현재 초안 (13개)
```json
[
{"id":"nl-jusa","name":"NL 자주파","nickLabel":"자주파","camp":"좌파","tagline":"분단이 모든 문제의 뿌리라고 믿는 사람","description":"한반도 문제의 근원을 외세와 분단에서 찾는다. 반미·자주·통일이 핵심 의제이고, 국가보안법 폐지를 오래된 숙제로 여긴다. 노동 의제에도 적극적이지만 우선순위는 민족 문제다.","keywords":["#반미자주","#통일우선","#국보법폐지"],"vector":{"axes":{"econ":-80,"social":-40,"security":-85,"trust":-40,"gender":-35,"engage":80},"leejm":55,"prosec":80},"weights":{"security":2}},
{"id":"pd-labor","name":"PD 노동좌파","nickLabel":"노동좌파","camp":"좌파","tagline":"계급이 먼저다. 나머지는 그 다음","description":"불평등과 노동 문제를 정치의 중심에 둔다. 민주당은 자본의 정당이라 보고, 진보정당의 독자 노선을 지지한다. NL의 민족주의에는 비판적이다.","keywords":["#노동중심","#반자본","#불평등"],"vector":{"axes":{"econ":-90,"social":-50,"security":-35,"trust":-30,"gender":-50,"engage":80},"leejm":65,"prosec":75},"weights":{"econ":2}},
{"id":"postmodern-left","name":"포스트모던 진보","nickLabel":"젠더진보","camp":"좌파","tagline":"차별금지법 없는 민주주의는 미완성","description":"젠더·소수자·기후가 핵심 의제다. 거대 양당 모두 낡았다고 보지만, 사회적 소수자 의제에서는 타협하지 않는다. 올드 레프트의 마초성도 불편하다.","keywords":["#차별금지법","#젠더","#기후위기"],"vector":{"axes":{"econ":-60,"social":-85,"security":-35,"trust":-10,"gender":-90,"engage":75},"leejm":70,"prosec":60},"weights":{"gender":2,"social":1.5}},
{"id":"hard-leejm","name":"강성 친명 개혁파","nickLabel":"강성친명","camp":"중도좌","tagline":"개혁의 칼을 쥐었으면 끝까지 휘둘러야","description":"이재명 정부의 성공이 곧 개혁의 성공이라 믿는다. 검찰·사법·언론 개혁은 타협 없이 밀어붙여야 하고, 내부 비판자는 한가하다고 느낀다. 행동하는 지지층.","keywords":["#이재명정부","#사법개혁","#검찰개혁"],"vector":{"axes":{"econ":-50,"social":-20,"security":-35,"trust":-25,"gender":-10,"engage":90},"leejm":5,"prosec":90},"weights":{"leejm":2.5,"prosec":1.5}},
{"id":"prosec-reform","name":"검찰개혁 운동파","nickLabel":"검찰개혁","camp":"중도좌","tagline":"검찰 해체 전까지 이 싸움은 안 끝났다","description":"검찰 권력 해체가 한국 정치의 제1과제다. 윤석열 정권의 청산이 곧 정의 회복이라 보고, 친문 정서가 남아 있다. 이재명 정부엔 조건부 지지.","keywords":["#검찰해체","#윤석열청산","#친문정서"],"vector":{"axes":{"econ":-45,"social":-35,"security":-30,"trust":-45,"gender":-25,"engage":85},"leejm":35,"prosec":100},"weights":{"prosec":2.5}},
{"id":"moderate-lib","name":"온건 자유주의","nickLabel":"온건자유","camp":"중도좌","tagline":"개혁은 좋은데, 좀 차분하게 합시다","description":"민주당계 가치에 동의하지만 강성 팬덤 정치가 불편하다. 제도와 절차를 중시하고, 급진보다 점진을 선호한다. 비명계·제3지대에 마음이 간 적이 있다.","keywords":["#합리적중도","#제도권안정"],"vector":{"axes":{"econ":-25,"social":-10,"security":-10,"trust":45,"gender":-5,"engage":60},"leejm":80,"prosec":35},"weights":{"leejm":2,"trust":1.5}},
{"id":"young-merit","name":"청년 능력주의 보수","nickLabel":"능력주의","camp":"중도우","tagline":"공정한 경쟁, 그 이상도 이하도 바라지 않는다","description":"시장과 경쟁을 신뢰하고 할당제 같은 인위적 보정을 역차별로 본다. 페미니즘에 비판적이지만 태극기 부대와도 거리가 멀다. 낡은 보수가 아닌 새 보수를 원한다.","keywords":["#능력주의","#반페미","#작은정부"],"vector":{"axes":{"econ":60,"social":5,"security":40,"trust":30,"gender":80,"engage":70},"impeach":"pro","fraud":5},"weights":{"gender":2.5}},
{"id":"prag-con","name":"중도실용 보수","nickLabel":"중도실용","camp":"중도우","tagline":"이념은 됐고, 일 잘하는 쪽이 내 편","description":"먹고사는 문제가 이념보다 앞선다. 보수에 가깝지만 진영 논리가 과열되면 발을 뺀다. 외연 확장과 수도권 실용주의에 끌린다.","keywords":["#수도권실용","#외연확장","#탈이념"],"vector":{"axes":{"econ":40,"social":10,"security":40,"trust":55,"gender":10,"engage":55},"impeach":"pro","fraud":5}},
{"id":"pro-impeach-con","name":"찬탄 개혁보수","nickLabel":"찬탄보수","camp":"우파","tagline":"보수를 살리려면 광장과 결별해야 한다","description":"계엄과 탄핵 국면에서 헌정 질서를 택했다. 보수의 가치는 지키되 부정선거론·아스팔트 우파와는 선을 그어야 보수가 산다고 믿는다.","keywords":["#보수재건","#법치","#광장과거리두기"],"vector":{"axes":{"econ":50,"social":30,"security":60,"trust":65,"gender":25,"engage":75},"impeach":"pro","fraud":5},"weights":{"impeach":2.5,"trust":1.5}},
{"id":"anti-impeach-main","name":"반탄 당권 주류","nickLabel":"반탄주류","camp":"우파","tagline":"탄핵은 잘못됐지만, 싸움은 제도 안에서","description":"탄핵에 반대했고 지금도 부당했다고 본다. 다만 부정선거론 같은 장외 노선보다는 당을 중심으로 야당 투쟁을 해야 한다는 입장. 현 국민의힘 주류 정서.","keywords":["#반탄","#야당투쟁","#당정쇄신"],"vector":{"axes":{"econ":50,"social":55,"security":65,"trust":25,"gender":35,"engage":80},"impeach":"antiMild","fraud":35},"weights":{"impeach":2.5}},
{"id":"plaza-right","name":"광장 우파","nickLabel":"광장우파","camp":"우파","tagline":"제도가 썩었으면 광장으로 나가는 수밖에","description":"탄핵은 무효이고 선거는 의심스럽다. 제도권 정치 전체를 불신하며 광장과 유튜브가 진짜 여론이라 믿는다. 윤어게인·부정선거 진상규명이 시대적 사명.","keywords":["#부정선거","#윤어게인","#광화문"],"vector":{"axes":{"econ":45,"social":85,"security":80,"trust":-70,"gender":55,"engage":95},"impeach":"yoonAgain","fraud":95},"weights":{"fraud":2.5,"impeach":2,"trust":1.5}},
{"id":"cynic","name":"무당층 회의파","nickLabel":"무당회의","camp":"비이념","tagline":"둘 다 싫다는 게 왜 의견이 아닌가","description":"정치에 관심이 없는 게 아니다. 지금의 정치가 싫은 거다. 거대 양당 모두 기득권이라 보고, 찍을 곳이 없어서 안 찍는다. 성향은 있지만 소속은 거부한다.","keywords":["#둘다싫어","#정치혐오"],"vector":{"axes":{"econ":0,"social":0,"security":0,"trust":-45,"gender":5,"engage":45}},"weights":{"trust":2,"engage":1.5}},
{"id":"apathy","name":"무관심층","nickLabel":"무관심","camp":"비이념","tagline":"그 시간에 내 인생 챙기는 게 낫다","description":"정치 뉴스는 피곤하고, 누가 되든 내 삶은 비슷하다고 느낀다. 투표는 할 때도 있고 안 할 때도 있다. 정치보다 중요한 게 많은 사람.","keywords":["#먹고살기바쁨"],"vector":{"axes":{"econ":0,"social":0,"security":0,"trust":0,"gender":0,"engage":-80}},"weights":{"engage":3}}
]
```
