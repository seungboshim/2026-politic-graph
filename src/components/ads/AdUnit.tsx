'use client';

// 수동 광고 유닛. 슬롯 ID(env)와 클라이언트 ID가 모두 있을 때만 렌더 → 승인 전엔
// 빈 회색 박스가 뜨지 않는다. 공간(min-height) 확보로 레이아웃 시프트(CLS) 최소화.
import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, adsEnabled } from '@/lib/ads';

export default function AdUnit({ slot, className = '' }: { slot?: string; className?: string }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsEnabled || !slot || pushed.current) return;
    try {
      const w = window as unknown as { adsbygoogle?: Record<string, unknown>[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
      pushed.current = true;
    } catch { /* 스크립트 미로드 등 무시 */ }
  }, [slot]);

  if (!adsEnabled || !slot) return null;

  return (
    <div className={`my-6 w-full ${className}`}>
      <p className="mb-1 text-center font-mono text-[10px] text-foreground-faint">스폰서</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 100 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
