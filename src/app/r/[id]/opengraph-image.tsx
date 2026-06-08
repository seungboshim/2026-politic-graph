// src/app/r/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getResult } from '@/app/actions';
import { TYPE_MAP } from '@/data/types';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getResult(id);
  const type = r ? TYPE_MAP[r.typeId] : undefined;
  const font = await fetch(new URL('./Pretendard-Bold.otf', import.meta.url)).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#18181b', color: 'white',
        fontFamily: 'Pretendard',
      }}>
        <div style={{ fontSize: 36, color: '#a1a1aa' }}>정치성향 테스트</div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 24 }}>{type?.name ?? '나의 정치 유형은?'}</div>
        {type && <div style={{ fontSize: 40, color: '#d4d4d8', marginTop: 20 }}>"{type.tagline}"</div>}
      </div>
    ),
    { ...size, fonts: [{ name: 'Pretendard', data: font, weight: 700 }] },
  );
}
