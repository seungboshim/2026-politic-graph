// 사이트 전역 AdSense 로더(승인용 스니펫 겸용). env 미설정 시 아무것도 렌더 안 함.
import Script from 'next/script';
import { ADSENSE_CLIENT, adsEnabled } from '@/lib/ads';

export default function AdsenseScript() {
  if (!adsEnabled) return null;
  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
