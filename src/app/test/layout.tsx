// src/app/test/layout.tsx — /test는 클라이언트 컴포넌트라 메타데이터를 레이아웃에서 정의
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '테스트 시작',
  description: '18문항 내외·약 3분. 6개 축으로 나의 정치 유형과 가장 가까운 현역 정치인을 익명으로 찾아보세요.',
  alternates: { canonical: '/test' },
};

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
