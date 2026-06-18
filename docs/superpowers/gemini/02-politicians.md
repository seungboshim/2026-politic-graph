# [Gemini 프롬프트 2/3] 정치인(politicians) 검토·정교화

아래는 현재 25명의 정치인 초안입니다. 각자 `vector`(6축 + 4스탠스 **모두** 절대값), `party`, `face`(픽셀 아바타 파라미터)를 가집니다. (앞서 검토한 유형과 **같은 벡터 공간** — 사용자와 정치인이 같은 좌표계에서 거리로 매칭됩니다.)

## 당신이 할 일 (한국 정치 지식이 가장 중요한 단계)
1. **벡터 사실성 교정**: 각 인물의 6축·4스탠스가 그 사람의 **공개된 실제 입장**(발언·표결·노선)과 맞는지 검토하고 어긋난 값을 고치세요. 특히:
   - `impeach`(찬탄/반탄온건/윤어게인), `fraud`(부정선거 수용도), `leejm`(0 강성친명 ~ 100 반이재명), `prosec`(검찰개혁 강도) — 이 4개가 인물 변별의 핵심입니다.
   - 근거가 분명한 것만 강하게, 애매하면 중립(50 근처). **사실을 지어내지 마세요.** 불확실한 항목은 메모에 표시.
2. **정당 재매핑(필수)**: `party`는 반드시 9종 중 하나여야 합니다 — 더불어민주당·국민의힘·개혁신당·조국혁신당·진보당·정의당·새로운미래·자유통일당·무소속. 현재 9종 밖 값(`민주노동당`=권영국, `전 정의당`=장혜영)을 9종으로 재배정하세요(장혜영은 정의당 버킷이 기본 의도). 2026년 현재 소속이 바뀐 인물이 있으면 함께 교정.
3. **태그 작성**: 각 정치인에 `tags`(#해시태그 2~3개)를 추가하세요. 결과 화면에서 그 인물을 한눈에 설명하는 키워드(예: 이재명 #강성개혁 #사법개혁). 객관적·서술적으로.
4. **face 점검**: 식별용 스타일 아바타 파라미터(닮은꼴 아님). `sex:'m'|'f'`, `hair:'up'|'down'|'bob'`(여성만 bob), `hairColor:'black'|'silver'`, `glasses:boolean`. 명백히 틀린 것만 고치세요(예: 은발/안경 유무).
5. **명단 제안(선택)**: 빠지면 아쉬운 인물(특히 좌파 진영 인지도 보강)이나 2026년 현재성이 떨어져 빼도 될 인물이 있으면 별도로 제안. 추가 시 위 모든 필드를 채워서.

## 출력 형식
- **(1) JSON 배열 전체**(25명, 추가/삭제 반영). 필드명·형식 유지. `vector.axes`의 `engage`는 매칭에서 제외되므로 모두 80으로 둬도 무방.
- **(2) 변경 요약**: 인물별 "무엇을 왜"(특히 스탠스 4개와 정당 재매핑). 불확실/추측 항목 명시. 제안한 추가/삭제와 이유.

스키마(타입):
```
{ id, name, party(9종 중 하나),
  vector: { axes:{econ,social,security,trust,gender,engage}, impeach:'pro'|'antiMild'|'yoonAgain', fraud, leejm, prosec },
  face: { sex:'m'|'f', hair:'up'|'down'|'bob', hairColor:'black'|'silver', glasses:boolean },
  tags?: string[] }
```

## 현재 초안 (25명)
```json
[
{"id":"lee-jm","name":"이재명","party":"더불어민주당","vector":{"axes":{"econ":-55,"social":-20,"security":-35,"trust":-10,"gender":-10,"engage":80},"impeach":"pro","fraud":0,"leejm":0,"prosec":75},"face":{"sex":"m","hair":"down","hairColor":"black","glasses":false}},
{"id":"jung-cr","name":"정청래","party":"더불어민주당","vector":{"axes":{"econ":-50,"social":-25,"security":-40,"trust":-30,"gender":-15,"engage":80},"impeach":"pro","fraud":0,"leejm":5,"prosec":90},"face":{"sex":"m","hair":"down","hairColor":"black","glasses":false}},
{"id":"park-cd","name":"박찬대","party":"더불어민주당","vector":{"axes":{"econ":-50,"social":-20,"security":-35,"trust":-20,"gender":-10,"engage":80},"impeach":"pro","fraud":0,"leejm":10,"prosec":80},"face":{"sex":"m","hair":"down","hairColor":"black","glasses":true}},
{"id":"cho-k","name":"조국","party":"조국혁신당","vector":{"axes":{"econ":-45,"social":-40,"security":-30,"trust":-40,"gender":-30,"engage":80},"impeach":"pro","fraud":0,"leejm":30,"prosec":100},"face":{"sex":"m","hair":"down","hairColor":"silver","glasses":true}},
{"id":"kim-dy","name":"김동연","party":"더불어민주당","vector":{"axes":{"econ":-25,"social":-15,"security":-10,"trust":40,"gender":-10,"engage":80},"impeach":"pro","fraud":0,"leejm":70,"prosec":40},"face":{"sex":"m","hair":"up","hairColor":"silver","glasses":false}},
{"id":"kim-ks","name":"김경수","party":"더불어민주당","vector":{"axes":{"econ":-40,"social":-25,"security":-30,"trust":30,"gender":-20,"engage":80},"impeach":"pro","fraud":0,"leejm":55,"prosec":55},"face":{"sex":"m","hair":"down","hairColor":"black","glasses":true}},
{"id":"lim-js","name":"임종석","party":"더불어민주당","vector":{"axes":{"econ":-40,"social":-25,"security":-50,"trust":20,"gender":-15,"engage":80},"impeach":"pro","fraud":0,"leejm":65,"prosec":50},"face":{"sex":"m","hair":"down","hairColor":"black","glasses":false}},
{"id":"lee-ny","name":"이낙연","party":"새로운미래","vector":{"axes":{"econ":-20,"social":0,"security":-15,"trust":50,"gender":-5,"engage":80},"impeach":"pro","fraud":0,"leejm":90,"prosec":30},"face":{"sex":"m","hair":"up","hairColor":"silver","glasses":true}},
{"id":"kwon-yg","name":"권영국","party":"민주노동당","vector":{"axes":{"econ":-85,"social":-55,"security":-45,"trust":-35,"gender":-55,"engage":80},"impeach":"pro","fraud":0,"leejm":60,"prosec":85},"face":{"sex":"m","hair":"down","hairColor":"black","glasses":true}},
{"id":"kim-jy","name":"김재연","party":"진보당","vector":{"axes":{"econ":-80,"social":-45,"security":-75,"trust":-45,"gender":-45,"engage":80},"impeach":"pro","fraud":0,"leejm":50,"prosec":85},"face":{"sex":"f","hair":"bob","hairColor":"black","glasses":false}},
{"id":"jang-hy","name":"장혜영","party":"전 정의당","vector":{"axes":{"econ":-65,"social":-80,"security":-40,"trust":-15,"gender":-85,"engage":80},"impeach":"pro","fraud":0,"leejm":70,"prosec":60},"face":{"sex":"f","hair":"down","hairColor":"black","glasses":true}},
{"id":"lee-js","name":"이준석","party":"개혁신당","vector":{"axes":{"econ":60,"social":10,"security":45,"trust":45,"gender":75,"engage":80},"impeach":"pro","fraud":5,"leejm":95,"prosec":20},"face":{"sex":"m","hair":"up","hairColor":"black","glasses":false}},
{"id":"chun-hr","name":"천하람","party":"개혁신당","vector":{"axes":{"econ":50,"social":-5,"security":35,"trust":30,"gender":60,"engage":80},"impeach":"pro","fraud":5,"leejm":90,"prosec":25},"face":{"sex":"m","hair":"up","hairColor":"black","glasses":false}},
{"id":"ahn-cs","name":"안철수","party":"국민의힘","vector":{"axes":{"econ":35,"social":5,"security":40,"trust":55,"gender":10,"engage":80},"impeach":"pro","fraud":5,"leejm":85,"prosec":25},"face":{"sex":"m","hair":"down","hairColor":"black","glasses":false}},
{"id":"oh-sh","name":"오세훈","party":"국민의힘","vector":{"axes":{"econ":45,"social":25,"security":50,"trust":50,"gender":20,"engage":80},"impeach":"pro","fraud":5,"leejm":90,"prosec":15},"face":{"sex":"m","hair":"up","hairColor":"black","glasses":false}},
{"id":"yoo-sm","name":"유승민","party":"국민의힘","vector":{"axes":{"econ":30,"social":20,"security":55,"trust":60,"gender":10,"engage":80},"impeach":"pro","fraud":0,"leejm":85,"prosec":20},"face":{"sex":"m","hair":"up","hairColor":"silver","glasses":false}},
{"id":"han-dh","name":"한동훈","party":"국민의힘","vector":{"axes":{"econ":50,"social":30,"security":60,"trust":65,"gender":25,"engage":80},"impeach":"pro","fraud":5,"leejm":95,"prosec":10},"face":{"sex":"m","hair":"down","hairColor":"black","glasses":true}},
{"id":"jang-dh","name":"장동혁","party":"국민의힘","vector":{"axes":{"econ":50,"social":50,"security":65,"trust":30,"gender":35,"engage":80},"impeach":"antiMild","fraud":30,"leejm":95,"prosec":10},"face":{"sex":"m","hair":"down","hairColor":"black","glasses":true}},
{"id":"na-kw","name":"나경원","party":"국민의힘","vector":{"axes":{"econ":45,"social":60,"security":65,"trust":25,"gender":40,"engage":80},"impeach":"antiMild","fraud":35,"leejm":95,"prosec":10},"face":{"sex":"f","hair":"bob","hairColor":"black","glasses":false}},
{"id":"yoon-sh","name":"윤상현","party":"국민의힘","vector":{"axes":{"econ":45,"social":55,"security":70,"trust":15,"gender":35,"engage":80},"impeach":"antiMild","fraud":50,"leejm":95,"prosec":5},"face":{"sex":"m","hair":"up","hairColor":"silver","glasses":false}},
{"id":"kim-ms","name":"김문수","party":"국민의힘","vector":{"axes":{"econ":55,"social":75,"security":75,"trust":10,"gender":45,"engage":80},"impeach":"antiMild","fraud":55,"leejm":95,"prosec":5},"face":{"sex":"m","hair":"up","hairColor":"silver","glasses":true}},
{"id":"hong-jp","name":"홍준표","party":"무소속","vector":{"axes":{"econ":60,"social":55,"security":70,"trust":40,"gender":50,"engage":80},"impeach":"antiMild","fraud":10,"leejm":90,"prosec":15},"face":{"sex":"m","hair":"up","hairColor":"silver","glasses":false}},
{"id":"hwang-ka","name":"황교안","party":"무소속","vector":{"axes":{"econ":50,"social":80,"security":80,"trust":-60,"gender":50,"engage":80},"impeach":"yoonAgain","fraud":95,"leejm":100,"prosec":0},"face":{"sex":"m","hair":"up","hairColor":"silver","glasses":true}},
{"id":"jeon-hg","name":"전한길","party":"자유통일당","vector":{"axes":{"econ":40,"social":75,"security":75,"trust":-75,"gender":55,"engage":80},"impeach":"yoonAgain","fraud":100,"leejm":100,"prosec":0},"face":{"sex":"m","hair":"up","hairColor":"silver","glasses":false}},
{"id":"jeon-kh","name":"전광훈","party":"자유통일당","vector":{"axes":{"econ":35,"social":95,"security":85,"trust":-70,"gender":70,"engage":80},"impeach":"yoonAgain","fraud":95,"leejm":100,"prosec":0},"face":{"sex":"m","hair":"up","hairColor":"silver","glasses":false}}
]
```
