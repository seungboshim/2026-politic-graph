// src/lib/nick.ts — 결과 유형 라벨 + 토큰으로 익명 닉 생성(순수).
export function makeNick(nickLabel: string, token: string): string {
  const label = nickLabel.replace(/\s+/g, '');
  const suffix = token.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4);
  return `${label}_${suffix}`;
}
