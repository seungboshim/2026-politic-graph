// e2e/smoke.spec.ts
import { expect, test } from '@playwright/test';

test('완주 → 결과 → 댓글 작성', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('start').click();

  // 항상 첫 번째 선택지를 클릭해 완주
  for (let i = 0; i < 25; i += 1) {
    const options = page.getByTestId('option');
    if ((await options.count()) === 0) break; // 결과 페이지 도착
    await options.first().click();
  }

  await expect(page.getByTestId('type-name')).toBeVisible({ timeout: 15_000 });

  // 댓글 작성 (방금 완주했으므로 localStorage에 결과 ID 있음)
  await page.getByTestId('comment-nickname').fill('스모크');
  await page.getByTestId('comment-password').fill('1234');
  await page.getByTestId('comment-body').fill('E2E 스모크 테스트 댓글');
  await page.getByTestId('comment-submit').click();
  await expect(page.getByText('E2E 스모크 테스트 댓글')).toBeVisible();
});
