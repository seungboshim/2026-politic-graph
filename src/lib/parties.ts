// src/lib/parties.ts
export const PARTY_COLORS: Record<string, string> = {
  '더불어민주당': '#003B96',
  '국민의힘': '#E61E2B',
  '개혁신당': '#FF7210',
  '조국혁신당': '#0073CF',
  '진보당': '#D6001C',
  '정의당': '#FFED00',
  '기본소득당': '#00D2C3',
  '새로운미래': '#45BABD',
  '자유와혁신': '#A50034',
  '무소속': '#808080',
};

/** 미등록 정당은 무소속 회색으로 폴백 */
export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? '#808080';
}

/** hex 명도 가감 (−255~255). */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
