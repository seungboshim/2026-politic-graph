import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '정치성향 테스트의 개인정보 수집·이용 및 광고 쿠키에 관한 안내.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const UPDATED = '2026년 6월 23일';

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[640px] px-[18px] py-12">
      <h1 className="text-display02 font-bold tracking-[-0.03em]">개인정보처리방침</h1>
      <p className="mt-2 font-mono text-label01 text-foreground-subtle">최종 업데이트: {UPDATED}</p>

      <div className="mt-8 flex flex-col gap-7 text-body02 leading-relaxed text-foreground-secondary">
        <section>
          <h2 className="mb-2 text-body01 font-bold text-foreground">1. 수집하는 정보</h2>
          <p>본 서비스는 회원가입 없이 익명으로 운영되며, 이름·연락처 등 개인을 직접 식별하는 정보를 수집하지 않습니다. 수집·처리하는 항목은 다음과 같습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><b>테스트 결과</b>: 응답으로 산출된 정치 성향 벡터와 유형(익명). 통계 집계와 결과 공유 링크 생성에 사용됩니다.</li>
            <li><b>IP 주소의 해시값</b>: 댓글 도배·악용 방지(작성 빈도 제한)를 위해 IP를 일방향 해시로 변환해 사용하며, <b>원본 IP는 저장하지 않습니다</b>.</li>
            <li><b>브라우저 로컬 저장소</b>: 결과 식별자와 댓글 작성자 토큰·표시용 닉네임을 기기에 저장합니다(본인 댓글 작성·삭제 관리용). 서버 계정과 무관합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-body01 font-bold text-foreground">2. 쿠키 및 맞춤형 광고</h2>
          <p>본 서비스는 Google AdSense를 통해 광고를 게재할 수 있습니다. Google을 포함한 제3자 광고 공급업체는 쿠키 또는 기기 식별자를 사용하여 이용자의 이전 방문 기록 등을 바탕으로 맞춤형 광고를 제공할 수 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Google의 광고 쿠키 사용에 대한 안내 및 맞춤 설정 거부: <a className="text-spectrum-blue-text underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google 광고 설정</a></li>
            <li>제3자 업체의 맞춤형 광고 일괄 거부: <a className="text-spectrum-blue-text underline" href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a></li>
          </ul>
          <p className="mt-2">브라우저 설정에서 쿠키를 차단·삭제할 수 있으며, 이 경우 일부 기능이 제한될 수 있습니다.</p>
        </section>

        <section>
          <h2 className="mb-2 text-body01 font-bold text-foreground">3. 제3자 제공</h2>
          <p>수집된 정보는 광고 게재 및 서비스 운영·통계 목적 외에 제3자에게 판매하거나 제공하지 않습니다(법령에 따른 경우 제외).</p>
        </section>

        <section>
          <h2 className="mb-2 text-body01 font-bold text-foreground">4. 콘텐츠의 성격</h2>
          <p>정치인 매칭 및 성향 분석 결과는 공개된 발언·표결 기록 등을 바탕으로 한 <b>참고용 추정</b>이며, 특정 인물에 대한 사실의 단정이나 공식 입장이 아닙니다.</p>
        </section>

        <section>
          <h2 className="mb-2 text-body01 font-bold text-foreground">5. 문의</h2>
          <p>개인정보 처리에 관한 문의는 운영자 이메일로 연락해 주세요: <span className="text-foreground">[운영자 이메일 기입]</span></p>
        </section>
      </div>

      <div className="mt-10">
        <Link href="/" className="font-mono text-label01 text-foreground-faint hover:text-foreground-subtle">← 홈으로</Link>
      </div>
    </main>
  );
}
