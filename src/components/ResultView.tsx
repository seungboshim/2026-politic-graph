// src/components/ResultView.tsx — Task 13에서 완성. 일단 최소 버전.
import type { MatchResult, UserState } from '@/data/schema';
import { TYPE_MAP } from '@/data/types';

export default function ResultView({ typeId }: { typeId: string; state: UserState; top: MatchResult[] }) {
  const type = TYPE_MAP[typeId];
  return <div>{type?.name}</div>;
}
