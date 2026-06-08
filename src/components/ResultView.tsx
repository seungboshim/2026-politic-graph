// src/components/ResultView.tsx
import type { MatchResult, UserState } from '@/data/schema';
import { TYPE_MAP } from '@/data/types';
import { POLITICIAN_MAP } from '@/data/politicians';
import RadarChart from './RadarChart';

const NO_MATCH_TYPES = new Set(['cynic', 'apathy']);

export default function ResultView({
  typeId, state, top, samePct,
}: { typeId: string; state: UserState; top: MatchResult[]; samePct?: number }) {
  const type = TYPE_MAP[typeId];
  if (!type) return null;
  const soft = NO_MATCH_TYPES.has(typeId);

  return (
    <div className="flex flex-col gap-10">
      <section className="text-center">
        <p className="text-sm text-zinc-500">{type.camp}</p>
        <h1 className="mt-1 text-3xl font-extrabold" data-testid="type-name">{type.name}</h1>
        <p className="mt-2 text-zinc-600">"{type.tagline}"</p>
        <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-left leading-relaxed text-zinc-700">{type.description}</p>
        <p className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-zinc-500">
          {type.keywords.map((k) => <span key={k} className="rounded-full bg-zinc-100 px-3 py-1">{k}</span>)}
        </p>
        {samePct !== undefined && (
          <p className="mt-4 text-sm text-zinc-500">전체 응답자 중 <b>{samePct}%</b>가 당신과 같은 유형이에요</p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">{soft ? '그나마 가까운 정치인' : '나와 가장 가까운 정치인'}</h2>
        <ol className="flex flex-col gap-3">
          {top.map((m, i) => {
            const p = POLITICIAN_MAP[m.politicianId];
            if (!p) return null;
            return (
              <li key={m.politicianId} className="flex items-center justify-between rounded-xl border border-zinc-200 px-5 py-4">
                <span>
                  <b className="mr-2">{i + 1}위 {p.name}</b>
                  <span className="text-sm text-zinc-500">{p.party}</span>
                  {p.evidence?.length ? (
                    <details className="mt-1 text-xs text-zinc-500">
                      <summary className="cursor-pointer">태깅 근거</summary>
                      <ul className="mt-1 list-disc pl-4">
                        {p.evidence.map((e, j) => <li key={j}>{e.tag}: {e.value} — {e.source}</li>)}
                      </ul>
                    </details>
                  ) : null}
                </span>
                <b className="text-xl">{m.similarity}%</b>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">내 성향 프로필</h2>
        <RadarChart axes={state.axes} />
      </section>
    </div>
  );
}
