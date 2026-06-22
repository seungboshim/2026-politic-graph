// src/app/opengraph-image.tsx — 사이트 공통 OG 카드(랜딩/테스트/통계 공유용)
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { SITE_NAME } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = '정치성향 테스트 — 나와 가장 가까운 정치인은?';

export default async function Image() {
  const font = await readFile(new URL('./Pretendard-Bold.otf', import.meta.url));

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'white',
        fontFamily: 'Pretendard', padding: '0 80px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 34, color: '#a3a3a3' }}>{SITE_NAME}</div>
        <div style={{ fontSize: 74, fontWeight: 700, marginTop: 24, lineHeight: 1.25, maxWidth: 1000 }}>
          나의 정치 유형, 그리고 나와 가장 가까운 정치인은?
        </div>
        <div style={{ display: 'flex', width: 380, height: 14, borderRadius: 999, marginTop: 44, background: 'linear-gradient(90deg,#2f6fe6,#8b5cf6,#e8434b)' }} />
        <div style={{ fontSize: 30, color: '#d4d4d8', marginTop: 32 }}>6개 축 · 12가지 유형 · 익명 매칭</div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Pretendard', data: font, weight: 700 }] },
  );
}
