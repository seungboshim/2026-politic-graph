// src/components/Comments.tsx
'use client';

import { useEffect, useState } from 'react';
import { addComment, deleteComment, listComments, reportComment, type CommentView } from '@/app/actions';

export default function Comments({ resultId }: { resultId: string }) {
  const [items, setItems] = useState<CommentView[]>([]);
  const [canWrite, setCanWrite] = useState(false);
  const [myResultId, setMyResultId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const id = localStorage.getItem('pg_result_id');
      setMyResultId(id);
      setCanWrite(!!id);
    } catch { setCanWrite(false); }
    void listComments().then(setItems);
  }, []);

  async function submit() {
    if (!myResultId) return;
    setBusy(true);
    setError('');
    const res = await addComment({ resultId: myResultId, nickname, password, body });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? '실패'); return; }
    setBody('');
    setItems(await listComments());
  }

  async function remove(id: string) {
    const pw = prompt('댓글 비밀번호를 입력하세요');
    if (!pw) return;
    const res = await deleteComment(id, pw);
    if (!res.ok) { alert(res.error); return; }
    setItems(await listComments());
  }

  async function report(id: string) {
    await reportComment(id);
    alert('신고가 접수됐어요');
  }

  return (
    <section className="mt-14">
      <h2 className="mb-4 text-lg font-bold">광장 댓글 <span className="text-sm font-normal text-zinc-400">— 모든 유형이 모이는 곳</span></h2>

      {canWrite ? (
        <div className="mb-6 rounded-xl border border-zinc-200 p-4">
          <div className="mb-2 flex gap-2">
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임"
              maxLength={12} className="w-32 rounded-lg border border-zinc-200 px-3 py-2 text-sm" data-testid="comment-nickname" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호"
              type="password" className="w-32 rounded-lg border border-zinc-200 px-3 py-2 text-sm" data-testid="comment-password" />
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="내 유형 뱃지를 달고 한마디"
            maxLength={500} rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" data-testid="comment-body" />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          <button onClick={submit} disabled={busy}
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50" data-testid="comment-submit">
            등록
          </button>
        </div>
      ) : (
        <p className="mb-6 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          댓글은 테스트를 완료한 사람만 쓸 수 있어요. (시크릿 모드에서는 작성이 불가합니다)
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {items.map((c) => (
          <li key={c.id} className="rounded-xl border border-zinc-100 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm">
              {c.badge && (
                <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs text-white">
                  {c.badge.typeName} · {c.badge.politicianName} {c.badge.similarity}%
                </span>
              )}
              <b>{c.nickname}</b>
              <span className="text-xs text-zinc-400">{new Date(c.createdAt).toLocaleString('ko-KR')}</span>
            </div>
            <p className="whitespace-pre-line text-zinc-700">{c.body}</p>
            <div className="mt-2 flex gap-3 text-xs text-zinc-400">
              <button onClick={() => remove(c.id)} className="hover:text-zinc-600">삭제</button>
              <button onClick={() => report(c.id)} className="hover:text-red-500">신고</button>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-zinc-400">아직 댓글이 없어요. 첫 댓글의 주인공이 되어보세요.</p>}
      </ul>
    </section>
  );
}
