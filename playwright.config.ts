import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E テスト設定
 *
 * CI/CD コスト削減のため：
 * - Chromium のみでテスト
 * - 並列実行なし（workers: 1）
 * - main へのPRのみで実行（CI設定側で制御）
 */
export default defineConfig({
  testDir: './e2e',

  // テストタイムアウト
  timeout: 30 * 1000,

  // 各テストの実行回数（失敗時のリトライ）
  retries: process.env.CI ? 2 : 0,

  // 並列実行なし（コスト削減）
  workers: 1,

  // レポート設定
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    // ベースURL
    baseURL: 'http://localhost:3000',

    // スクリーンショット（失敗時のみ）
    screenshot: 'only-on-failure',

    // ビデオ録画（失敗時のみ）
    video: 'retain-on-failure',

    // トレース（失敗時のみ）
    trace: 'retain-on-failure',
  },

  // Chromium のみ（コスト削減）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 開発サーバー設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      E2E_TEST: 'true',
    },
  },
});
