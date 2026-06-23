'use client';

import { useState } from 'react';

export default function ShareButton({ typeName }: { typeName?: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = window.location.href;
    const text = typeName ? `나의 정치 유형은 "${typeName}"! 당신은?` : '나의 정치 유형 결과를 확인해보세요';
    // 모바일 등: 네이티브 공유 시트
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: '정치성향 테스트', text, url }); } catch { /* 사용자 취소 등 무시 */ }
      return;
    }
    // 폴백: 링크 클립보드 복사
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* 무시 */ }
  }

  return (
    <button
      onClick={onShare}
      data-testid="share"
      className="inline-block rounded-xl px-8 py-3 text-body01 font-bold text-background transition active:scale-95"
      style={{ backgroundImage: 'linear-gradient(92deg,#2f6fe6,#8b5cf6,#e8434b)' }}
    >
      {copied ? '✓ 링크가 복사됐어요' : '결과 공유하기'}
    </button>
  );
}
