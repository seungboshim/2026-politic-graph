// /ads.txt — AdSense 게재 인증. 퍼블리셔 ID(env)에서 생성. 미설정 시 빈 응답.
import { ADSENSE_CLIENT } from '@/lib/ads';

export const dynamic = 'force-static';

export function GET() {
  const pub = ADSENSE_CLIENT.replace(/^ca-/, ''); // ca-pub-XXX → pub-XXX
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
