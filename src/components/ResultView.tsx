// src/components/ResultView.tsx
import type { MatchResult, UserState } from '@/data/schema';
import { TYPE_MAP } from '@/data/types';
import { POLITICIAN_MAP } from '@/data/politicians';
import { partyColor } from '@/lib/parties';
import { leanOf, accentGradient } from '@/lib/spectrum';
import PixelAvatar from '@/components/ui/PixelAvatar';
import Card from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';
import Eyebrow from '@/components/ui/Eyebrow';
import Chip from '@/components/ui/Chip';
import Tag from '@/components/ui/Tag';
import ProgressBar from '@/components/ui/ProgressBar';
import RadarChart from '@/components/ui/RadarChart';

const NO_MATCH = new Set(['cynic', 'apathy']);

export default function ResultView(
  { typeId, state, top, samePct }: { typeId: string; state: UserState; top: MatchResult[]; samePct?: number },
) {
  const type = TYPE_MAP[typeId];
  if (!type) return null;
  const lean = leanOf(state);
  const textGrad = accentGradient(lean, 'text');
  const fillGrad = accentGradient(lean, 'fill');
  const accentColor = textGrad.match(/#[0-9a-fA-F]{6}/)?.[0] ?? '#6aa3ff';
  const soft = NO_MATCH.has(typeId);
  const gradText = { backgroundImage: textGrad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } as const;

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow accentColor={accentColor}>{type.camp}</Eyebrow>
        <h1 className="mt-1 text-display01 font-bold tracking-[-0.03em]" style={gradText} data-testid="type-name">{type.name}</h1>
        <p className="mt-2 text-body01 text-foreground-secondary">"{type.tagline}"</p>
        <p className="mt-4 whitespace-pre-line text-body02 leading-relaxed text-foreground-subtle">{type.description}</p>
        <p className="mt-4 flex flex-wrap gap-2">{type.keywords.map((k) => <Chip key={k}>{k}</Chip>)}</p>
        {samePct !== undefined && (
          <p className="mt-4 text-body02 text-foreground-subtle">전체 응답자 중 <b style={{ color: accentColor }}>{samePct}%</b>가 당신과 같은 유형이에요</p>
        )}
      </section>

      <Card>
        <SectionHeading accentColor={accentColor}>{soft ? '그나마 가까운 정치인' : '나와 가장 가까운 정치인'}</SectionHeading>
        <ol className="flex flex-col gap-1">
          {top.map((m, i) => {
            const p = POLITICIAN_MAP[m.politicianId];
            if (!p) return null;
            return (
              <li key={m.politicianId} className="mb-3">
                <div className="flex items-center gap-3">
                  <PixelAvatar {...p.face} party={p.party} size={48} />
                  <div>
                    <div className="text-body01">{i + 1}위 {p.name}</div>
                    <div className="text-label01 text-foreground-subtle">{p.party}</div>
                  </div>
                  <b className="ml-auto text-[17px]" style={gradText}>{m.similarity}%</b>
                </div>
                {p.tags?.length ? <div className="ml-[61px] mt-2 flex flex-wrap gap-1.5">{p.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div> : null}
                <div className="mt-2"><ProgressBar value={m.similarity} gradient={fillGrad} /></div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card>
        <SectionHeading accentColor={accentColor}>내 성향 프로필</SectionHeading>
        <div className="flex justify-center"><RadarChart axes={state.axes} lean={lean} /></div>
      </Card>
    </div>
  );
}
