// src/app/r/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getResult } from '@/app/actions';
import { TYPE_MAP } from '@/data/types';
import { leanOf } from '@/lib/spectrum';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getResult(id);
  const type = r ? TYPE_MAP[r.typeId] : undefined;
  const font = await fetch(new URL('./Pretendard-Bold.otf', import.meta.url)).then((res) => res.arrayBuffer());

  const lean = r ? leanOf(r.state) : 0;
  const color = lean <= -30 ? '#6aa3ff' : lean >= 30 ? '#ff7b82' : '#b794f6';

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'white',
        fontFamily: 'Pretendard',
      }}>
        <div style={{ fontSize: 36, color: '#a3a3a3' }}>정치성향 테스트</div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 24, color }}>{type?.name ?? '나의 정치 유형은?'}</div>
        {type && <div style={{ fontSize: 40, color: '#d4d4d8', marginTop: 20 }}>"{type.tagline}"</div>}
      </div>
    ),
    { ...size, fonts: [{ name: 'Pretendard', data: font, weight: 700 }] },
  );
}
