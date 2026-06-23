// playwright.config.ts
import { defineConfig } from '@playwright/test';

// 로컬: .env.local의 DB 자격증명을 로드(웹서버 + 테스트 클린업용). CI: 워크플로 env 사용.
try { process.loadEnvFile?.('.env.local'); } catch { /* CI에서는 env를 직접 주입 */ }

const isCI = !!process.env.CI;
const port = process.env.E2E_PORT ?? '3000'; // 다른 프로젝트와 포트 충돌 시 E2E_PORT로 변경

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: { baseURL: `http://localhost:${port}`, trace: 'on-first-retry' },
  webServer: {
    // CI는 프로덕션 빌드로 안정성 확보, 로컬은 dev로 빠르게.
    command: isCI ? `npm run build && npm run start -- -p ${port}` : `npm run dev -- -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
