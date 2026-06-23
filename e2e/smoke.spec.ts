// e2e/smoke.spec.ts
import { expect, test } from '@playwright/test';
import postgres from 'postgres';

const dbUrl = () =>
  process.env.DATABASE_URL_UNPOOLED ?? process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

let createdResultId: string | null = null;

// 공유 DB를 쓰므로 테스트가 만든 행은 정리한다(로컬 실행 시 광장 댓글 오염 방지).
test.afterEach(async () => {
  const url = dbUrl();
  if (!url || !createdResultId) return;
  const sql = postgres(url, { prepare: false });
  try {
    await sql`delete from comments where result_id = ${createdResultId}`;
    await sql`delete from results where id = ${createdResultId}`;
  } catch { /* 무시 */ } finally { await sql.end(); createdResultId = null; }
});

test('완주 → 결과 저장 → 댓글 작성', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('start').click();
  await page.getByTestId('option').first().waitFor({ state: 'visible', timeout: 15_000 });

  // 첫 선택지를 반복 클릭해 완주. 클릭 사이 짧은 대기로 하이드레이션/리렌더를 기다린다
  // (지연 없이 연타하면 React 재렌더 전에 클릭이 무시돼 Q1에 멈춤).
  for (let i = 0; i < 40; i += 1) {
    if (/\/r\/[0-9a-f-]{36}/.test(page.url())) break; // 결과 도착
    const options = page.getByTestId('option');
    if ((await options.count()) > 0) {
      await options.first().click({ timeout: 5_000 }).catch(() => { /* 전환 중 미스 무시 */ });
    }
    await page.waitForTimeout(300);
  }

  // submitTest가 DB에 저장하면 /r/<uuid>로 이동
  await page.waitForURL(/\/r\/[0-9a-f-]{36}/, { timeout: 20_000 });
  createdResultId = page.url().match(/\/r\/([0-9a-f-]{36})/)?.[1] ?? null;
  expect(createdResultId).not.toBeNull();
  await expect(page.getByTestId('type-name')).toBeVisible();

  // 댓글 작성 (ownerToken·resultId는 완주 시 localStorage에 세팅됨, 닉/비번 입력 없음)
  const body = `E2E 스모크 ${Date.now()}`;
  await page.getByTestId('comment-body').fill(body);
  await page.getByTestId('comment-submit').click();
  await expect(page.getByText(body)).toBeVisible({ timeout: 15_000 });
});
