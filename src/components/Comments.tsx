// src/components/Comments.tsx
'use client';

import { useEffect, useState } from 'react';
import { addComment, deleteComment, listComments, reportComment, type CommentView } from '@/app/actions';
import { partyColor } from '@/lib/parties';
import PixelAvatar from '@/components/ui/PixelAvatar';
import PoliticianNameBadge from '@/components/ui/PoliticianNameBadge';
import Card from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';

const TOKEN_KEY = 'pg_owner_token';
const RESULT_KEY = 'pg_result_id';

function getOwnerToken(): string | null {
  try {
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) { t = crypto.randomUUID(); localStorage.setItem(TOKEN_KEY, t); }
    return t;
  } catch { return null; }
}

export default function Comments() {
  const [items, setItems] = useState<CommentView[]>([]);
  const [myResultId, setMyResultId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { setMyResultId(localStorage.getItem(RESULT_KEY)); } catch { /* 무시 */ }
    setToken(getOwnerToken());
    void listComments().then(setItems);
  }, []);

  const canWrite = !!myResultId && !!token;

  async function submit() {
    if (!myResultId || !token) return;
    setBusy(true); setError('');
    const res = await addComment({ resultId: myResultId, ownerToken: token, body });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? '실패'); return; }
    setBody(''); setItems(await listComments());
  }
  async function remove(id: string) {
    if (!token) return;
    const res = await deleteComment(id, token);
    if (!res.ok) { alert(res.error); return; }
    setItems(await listComments());
  }
  async function report(id: string) { await reportComment(id); alert('신고가 접수됐어요'); }

  return (
    <Card className="mt-3.5">
      <SectionHeading>광장 댓글 <span className="font-normal text-foreground-faint">— 모든 유형이 모이는 곳</span></SectionHeading>

      {canWrite ? (
        <div className="mb-4">
          <textarea
            value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} rows={2}
            placeholder="내 정치인 뱃지를 달고 한마디"
            className="w-full resize-none rounded-lg border border-border-strong bg-surface-raised px-3 py-2 text-body02"
            data-testid="comment-body"
          />
          {error && <p className="mt-1 text-body02 text-danger">{error}</p>}
          <button onClick={submit} disabled={busy}
            className="mt-2 rounded-lg border border-spectrum-blue-text bg-surface-raised px-4 py-1.5 text-label01 text-spectrum-blue-text disabled:opacity-50"
            data-testid="comment-submit">등록</button>
        </div>
      ) : (
        <p className="mb-4 rounded-lg bg-surface-raised p-3.5 text-body02 text-foreground-subtle">
          댓글은 테스트를 완료한 사람만 쓸 수 있어요. (시크릿 모드에서는 작성이 불가합니다)
        </p>
      )}

      <ul className="flex flex-col">
        {items.map((c) => (
          <li key={c.id} className="flex items-start gap-3.5 border-t border-border py-4">
            <div className="relative h-12 w-12 flex-shrink-0">
              {c.badge && <>
                <PixelAvatar {...c.badge.face} party={c.badge.party} size={48} />
                <PoliticianNameBadge name={c.badge.politicianName} color={partyColor(c.badge.party)} />
              </>}
            </div>
            <div className="flex-1">
              <div><b className="text-body02">{c.nickname}</b><span className="ml-1.5 text-[10px] text-foreground-faint">{new Date(c.createdAt).toLocaleString('ko-KR')}</span></div>
              <p className="mt-1 whitespace-pre-line text-body02 text-foreground-secondary">{c.body}</p>
              <div className="mt-1.5 flex gap-3 text-[11px] text-foreground-faint">
                <button onClick={() => remove(c.id)} className="hover:text-foreground-secondary">삭제</button>
                <button onClick={() => report(c.id)} className="hover:text-danger">신고</button>
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="py-4 text-body02 text-foreground-faint">아직 댓글이 없어요. 첫 댓글의 주인공이 되어보세요.</p>}
      </ul>
    </Card>
  );
}
