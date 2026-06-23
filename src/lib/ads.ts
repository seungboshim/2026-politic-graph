// src/lib/ads.ts — Google AdSense 설정(공개값, env 기반).
// 퍼블리셔 ID는 ads.txt·스크립트 src에 노출되는 공개 정보지만, 환경별 on/off를
// 위해 env로 둔다. 값이 없으면 광고 관련 마크업이 전혀 렌더되지 않는다.
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? ''; // "ca-pub-XXXXXXXXXXXXXXXX"
export const adsEnabled = /^ca-pub-\d{10,}$/.test(ADSENSE_CLIENT);

// 광고 유닛 슬롯 ID(승인 후 AdSense 대시보드에서 발급). 비어있으면 해당 유닛 미렌더.
export const AD_SLOTS = {
  result: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT ?? '',
  stats: process.env.NEXT_PUBLIC_ADSENSE_SLOT_STATS ?? '',
};
